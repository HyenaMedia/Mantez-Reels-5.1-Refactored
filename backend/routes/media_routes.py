import logging
import os
import shutil
import sys
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from auth import require_auth
from file_scanner import get_scanner_status, scan_uploaded_file
from media_optimizer import MediaOptimizer
from services.storage_service import StorageService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/media", tags=["media"])

# Local media storage directory (used when storage_type is 'local' or 'both')
# Use environment variable or fall back to /tmp on read-only systems like Render
MEDIA_DIR = Path(os.environ.get('MEDIA_DIR', '/tmp/backend/media'))
try:
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
except (PermissionError, OSError) as e:
    # If we can't create the directory, try /tmp as fallback
    print(f"Warning: Could not create media directory at {MEDIA_DIR}: {e}")
    MEDIA_DIR = Path('/tmp/backend/media')
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Using fallback media directory: {MEDIA_DIR}")

from database import db


# ── Helpers ──────────────────────────────────────────────────────────────────

async def _get_r2_service():
    """Build a StorageService configured for R2 from current DB settings.
    Returns (StorageService, public_domain) or (None, None) if not configured."""
    settings_doc = await db.settings.find_one({}, {"_id": 0})
    cloud = (settings_doc or {}).get("cloudStorage", {})
    if not cloud.get("enabled", False):
        return None, None
    r2 = cloud.get("r2", {})
    account_id = r2.get("accountId", "")
    if not all([account_id, r2.get("accessKeyId"), r2.get("secretAccessKey"), r2.get("bucket")]):
        return None, None
    storage = StorageService({
        "enabled": True,
        "provider": "r2",
        "s3": {
            "accessKeyId": r2.get("accessKeyId", ""),
            "secretAccessKey": r2.get("secretAccessKey", ""),
            "region": "auto",
            "bucket": r2.get("bucket", ""),
            "endpoint": f"https://{account_id}.r2.cloudflarestorage.com",
            "publicDomain": r2.get("publicDomain", "").rstrip("/"),
            "accountId": account_id,
        }
    })
    return storage, r2.get("publicDomain", "").rstrip("/")


async def _default_storage_type():
    """Return the configured defaultStorage ('local', 'r2', 'both')."""
    settings_doc = await db.settings.find_one({}, {"_id": 0})
    cloud = (settings_doc or {}).get("cloudStorage", {})
    if not cloud.get("enabled", False):
        return "local"
    return cloud.get("defaultStorage", "local")


def _r2_key_from_url(url: str) -> str:
    """Extract R2 storage key from a public URL or relative path.
    e.g. '/media/foo.webp' → 'media/foo.webp'
         'https://pub.r2.dev/media/foo.webp' → 'media/foo.webp'
    """
    if url.startswith("http"):
        # Take the path after the domain
        parts = url.split("/", 3)
        return parts[3] if len(parts) > 3 else url
    return url.lstrip("/")


def _local_filename_from_url(url: str) -> str:
    """Extract just the filename from a /media/... URL."""
    return Path(url).name


def _transform_media_item(item: dict) -> dict:
    """Map DB fields to the shape the frontend expects."""
    sizes = item.get("sizes", {})
    file_size = 0
    for size_name in ("original", "large", "medium", "thumbnail"):
        if size_name in sizes:
            file_size = sizes[size_name].get("webp_size", 0)
            break

    return {
        "id": item.get("file_id", str(item.get("_id", ""))),
        "file_id": item.get("file_id", ""),
        "filename": item.get("original_filename", item.get("filename", "unknown")),
        "file_type": item.get("type", "image"),
        "urls": sizes,
        "file_size": file_size,
        "storage_type": item.get("storage_type", "local"),
        "uploaded_at": str(item.get("uploaded_at", "")),
        # Video-specific
        "url": item.get("url", ""),
        "size": item.get("size", 0),
    }


async def _upload_sizes_to_r2(storage: StorageService, sizes: dict) -> dict:
    """Upload all image size variants to R2; return new sizes dict with R2 URLs."""
    r2_sizes = {}
    for size_name, size_data in sizes.items():
        r2_entry = dict(size_data)
        for fmt, content_type in (("webp", "image/webp"), ("jpeg", "image/jpeg")):
            local_url = size_data.get(fmt, "")
            if not local_url:
                continue
            local_path = MEDIA_DIR / _local_filename_from_url(local_url)
            if not local_path.exists():
                r2_entry[fmt] = local_url  # keep local URL as fallback
                continue
            async with aiofiles.open(local_path, "rb") as f:
                file_data = await f.read()
            success, r2_url = await storage.upload_file(
                file_data, local_path.name, content_type, folder="media"
            )
            r2_entry[fmt] = r2_url if success else local_url
        r2_sizes[size_name] = r2_entry
    return r2_sizes


async def _download_sizes_from_r2(storage: StorageService, r2_sizes: dict) -> dict:
    """Download all image size variants from R2 to local disk; return local sizes dict."""
    local_sizes = {}
    for size_name, size_data in r2_sizes.items():
        local_entry = dict(size_data)
        for fmt in ("webp", "jpeg"):
            r2_url = size_data.get(fmt, "")
            if not r2_url or not r2_url.startswith("http"):
                continue
            key = _r2_key_from_url(r2_url)
            filename = Path(key).name
            success, data = await storage.download_from_r2(key)
            if success and data:
                local_path = MEDIA_DIR / filename
                async with aiofiles.open(local_path, "wb") as f:
                    await f.write(data)
                local_entry[fmt] = f"/media/{filename}"
        local_sizes[size_name] = local_entry
    return local_sizes


async def _delete_local_sizes(sizes: dict):
    """Delete local files for all size variants."""
    for size_data in sizes.values():
        for fmt in ("webp", "jpeg"):
            url = size_data.get(fmt, "")
            if url:
                local_path = MEDIA_DIR / _local_filename_from_url(url)
                if local_path.exists():
                    local_path.unlink()


async def _delete_r2_sizes(storage: StorageService, sizes: dict):
    """Delete R2 files for all size variants."""
    for size_data in sizes.values():
        for fmt in ("webp", "jpeg"):
            url = size_data.get(fmt, "")
            if url and url.startswith("http"):
                await storage.delete_from_r2(_r2_key_from_url(url))


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/scanner-status")
async def scanner_status():
    return get_scanner_status()


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), storage_target: str = None, current_user: dict = Depends(require_auth)):
    """Upload, scan, and optimise an image. Respects the global cloud storage setting (or per-upload override)."""
    try:
        is_valid, message = MediaOptimizer.validate_image(file.file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        file.file.seek(0)

        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            is_safe, scan_message = scan_uploaded_file(tmp_path)
            if not is_safe:
                os.unlink(tmp_path)
                raise HTTPException(status_code=400, detail=f"File rejected: {scan_message}")

            with open(tmp_path, "rb") as f:
                info = MediaOptimizer.get_image_info(f)
                f.seek(0)
                file_id = str(uuid.uuid4())
                base_filename = Path(file.filename).stem
                safe_filename = f"{base_filename}_{file_id}"
                optimization_result = MediaOptimizer.optimize_image(f, str(MEDIA_DIR), safe_filename)
        finally:
            try:
                os.unlink(tmp_path)
            except Exception as e:
                logger.debug(f"Failed to remove temp file {tmp_path}: {e}")

        local_sizes = optimization_result["sizes"]

        # Determine storage target (per-upload override takes precedence over global default)
        if storage_target and storage_target in ("local", "r2", "both"):
            storage_type = storage_target
        else:
            storage_type = await _default_storage_type()

        r2_sizes = {}
        final_sizes = local_sizes

        if storage_type in ("r2", "both"):
            r2_storage, _ = await _get_r2_service()
            if r2_storage:
                r2_sizes = await _upload_sizes_to_r2(r2_storage, local_sizes)
                final_sizes = r2_sizes  # R2 URLs are primary
                if storage_type == "r2":
                    await _delete_local_sizes(local_sizes)
                    local_sizes = {}
            else:
                storage_type = "local"  # fallback if R2 misconfigured

        media_doc = {
            "file_id": file_id,
            "original_filename": file.filename,
            "type": "image",
            "format": info["format"],
            "original_size": optimization_result["original_size"],
            "sizes": final_sizes,
            "local_sizes": local_sizes,
            "r2_sizes": r2_sizes,
            "storage_type": storage_type,
            "uploaded_at": datetime.now(timezone.utc),
            "scanned": True,
            "scan_result": "clean",
            "used_in": [],
        }
        await db.media.insert_one(media_doc)

        return {
            "success": True,
            "file_id": file_id,
            "original_info": info,
            "optimized": optimization_result,
            "storage_type": storage_type,
            "scanned": True,
            "message": "Image uploaded, scanned, and optimised successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")


@router.post("/upload-video")
async def upload_video(file: UploadFile = File(...), storage_target: str = None, current_user: dict = Depends(require_auth)):
    """Upload and scan a video. Respects the global cloud storage setting (or per-upload override)."""
    try:
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        if size > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Video file too large (max 100MB)")

        file_id = str(uuid.uuid4())
        base_filename = Path(file.filename).stem
        safe_filename = f"{base_filename}_{file_id}"

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            is_safe, scan_message = scan_uploaded_file(tmp_path)
            if not is_safe:
                os.unlink(tmp_path)
                raise HTTPException(status_code=400, detail=f"File rejected: {scan_message}")

            video_filename = f"{safe_filename}.mp4"
            video_path = MEDIA_DIR / video_filename
            shutil.move(tmp_path, video_path)
        except HTTPException:
            raise
        except Exception as e:
            logger.debug(f"Video upload processing failed: {e}")
            try:
                os.unlink(tmp_path)
            except Exception as cleanup_err:
                logger.debug(f"Failed to remove temp file {tmp_path}: {cleanup_err}")
            raise

        # Determine storage target
        if storage_target and storage_target in ("local", "r2", "both"):
            storage_type = storage_target
        else:
            storage_type = await _default_storage_type()

        local_url = f"/media/{video_filename}"
        r2_url = ""

        if storage_type in ("r2", "both"):
            storage, _ = await _get_r2_service()
            if storage:
                async with aiofiles.open(video_path, "rb") as f:
                    video_data = await f.read()
                success, uploaded_url = await storage.upload_file(
                    video_data, video_filename, "video/mp4", folder="media"
                )
                if success:
                    r2_url = uploaded_url
                    if storage_type == "r2":
                        video_path.unlink(missing_ok=True)
                        local_url = ""
                else:
                    storage_type = "local"
            else:
                storage_type = "local"

        primary_url = r2_url if storage_type in ("r2", "both") and r2_url else local_url

        media_doc = {
            "file_id": file_id,
            "original_filename": file.filename,
            "type": "video",
            "url": primary_url,
            "local_url": local_url,
            "r2_url": r2_url,
            "storage_type": storage_type,
            "size": size,
            "uploaded_at": datetime.now(timezone.utc),
            "scanned": True,
            "scan_result": "clean",
            "used_in": [],
        }
        await db.media.insert_one(media_doc)

        return {
            "success": True,
            "file_id": file_id,
            "url": primary_url,
            "storage_type": storage_type,
            "size": size,
            "scanned": True,
            "message": "Video uploaded and scanned successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Video upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")


@router.get("/list")
async def list_media(type: str = None, limit: int = 50, current_user: dict = Depends(require_auth)):
    """List all uploaded media files."""
    try:
        limit = min(max(1, limit), 200)  # Cap between 1 and 200
        query = {}
        if type:
            query["type"] = type
        media_list = await db.media.find(query).sort("uploaded_at", -1).limit(limit).to_list(limit)
        return {
            "success": True,
            "count": len(media_list),
            "media": [_transform_media_item(item) for item in media_list],
        }
    except Exception as e:
        logger.error(f"Failed to list media: {e}")
        raise HTTPException(status_code=500, detail="Failed to list media")


class StorageMigrateRequest(BaseModel):
    target: str  # 'local', 'r2', or 'both'


@router.patch("/{file_id}/storage")
async def migrate_storage(
    file_id: str,
    request: StorageMigrateRequest,
    current_user: dict = Depends(require_auth)
):
    """Change the storage location of an existing media file."""
    target = request.target
    if target not in ("local", "r2", "both"):
        raise HTTPException(status_code=400, detail="target must be 'local', 'r2', or 'both'")

    media = await db.media.find_one({"file_id": file_id})
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    current_type = media.get("storage_type", "local")
    media_type = media.get("type", "image")

    if current_type == target:
        return {"success": True, "message": "Already at target storage", "storage_type": target}

    # R2 operations require a configured service
    needs_r2 = target in ("r2", "both") or current_type in ("r2", "both")
    storage = None
    if needs_r2:
        storage, _ = await _get_r2_service()
        if not storage:
            raise HTTPException(status_code=400, detail="Cloudflare R2 is not configured or not enabled in Settings")

    updates = {"storage_type": target}

    if media_type == "image":
        local_sizes = media.get("local_sizes") or media.get("sizes", {})
        r2_sizes = media.get("r2_sizes", {})

        if target == "r2":
            # Ensure files are on R2
            if current_type == "local":
                r2_sizes = await _upload_sizes_to_r2(storage, local_sizes)
            # Remove from local
            if current_type in ("local", "both") and local_sizes:
                await _delete_local_sizes(local_sizes)
            updates["sizes"] = r2_sizes
            updates["r2_sizes"] = r2_sizes
            updates["local_sizes"] = {}

        elif target == "local":
            # Ensure files are on local
            if current_type == "r2":
                local_sizes = await _download_sizes_from_r2(storage, r2_sizes)
            # Remove from R2
            if current_type in ("r2", "both") and r2_sizes:
                await _delete_r2_sizes(storage, r2_sizes)
            updates["sizes"] = local_sizes
            updates["local_sizes"] = local_sizes
            updates["r2_sizes"] = {}

        elif target == "both":
            # Ensure files are on both
            if current_type == "local":
                r2_sizes = await _upload_sizes_to_r2(storage, local_sizes)
            elif current_type == "r2":
                local_sizes = await _download_sizes_from_r2(storage, r2_sizes)
            # Primary URLs point to R2 (CDN)
            updates["sizes"] = r2_sizes
            updates["local_sizes"] = local_sizes
            updates["r2_sizes"] = r2_sizes

    else:  # video
        local_url = media.get("local_url", media.get("url", ""))
        r2_url = media.get("r2_url", "")

        if target == "r2":
            if current_type == "local" and local_url:
                local_path = MEDIA_DIR / _local_filename_from_url(local_url)
                if local_path.exists():
                    async with aiofiles.open(local_path, "rb") as f:
                        data = await f.read()
                    success, uploaded = await storage.upload_file(
                        data, local_path.name, "video/mp4", folder="media"
                    )
                    r2_url = uploaded if success else r2_url
            if local_url:
                local_path = MEDIA_DIR / _local_filename_from_url(local_url)
                if local_path.exists():
                    local_path.unlink()
            updates["url"] = r2_url
            updates["r2_url"] = r2_url
            updates["local_url"] = ""

        elif target == "local":
            if current_type == "r2" and r2_url:
                key = _r2_key_from_url(r2_url)
                filename = Path(key).name
                success, data = await storage.download_from_r2(key)
                if success and data:
                    local_path = MEDIA_DIR / filename
                    async with aiofiles.open(local_path, "wb") as f:
                        await f.write(data)
                    local_url = f"/media/{filename}"
            if r2_url and current_type in ("r2", "both"):
                await storage.delete_from_r2(_r2_key_from_url(r2_url))
            updates["url"] = local_url
            updates["local_url"] = local_url
            updates["r2_url"] = ""

        elif target == "both":
            if current_type == "local" and local_url:
                local_path = MEDIA_DIR / _local_filename_from_url(local_url)
                if local_path.exists():
                    async with aiofiles.open(local_path, "rb") as f:
                        data = await f.read()
                    success, uploaded = await storage.upload_file(
                        data, local_path.name, "video/mp4", folder="media"
                    )
                    r2_url = uploaded if success else r2_url
            elif current_type == "r2" and r2_url:
                key = _r2_key_from_url(r2_url)
                filename = Path(key).name
                success, data = await storage.download_from_r2(key)
                if success and data:
                    local_path = MEDIA_DIR / filename
                    async with aiofiles.open(local_path, "wb") as f:
                        await f.write(data)
                    local_url = f"/media/{filename}"
            updates["url"] = r2_url or local_url
            updates["local_url"] = local_url
            updates["r2_url"] = r2_url

    await db.media.update_one({"file_id": file_id}, {"$set": updates})
    return {
        "success": True,
        "message": f"Storage migrated to '{target}'",
        "storage_type": target,
    }


@router.delete("/{file_id}")
async def delete_media(file_id: str, current_user: dict = Depends(require_auth)):
    """Delete a media file from all storage locations."""
    try:
        media = await db.media.find_one({"file_id": file_id})
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")

        storage_type = media.get("storage_type", "local")

        if media["type"] == "image":
            # Delete local files
            if storage_type in ("local", "both"):
                sizes = media.get("local_sizes") or media.get("sizes", {})
                for size_data in sizes.values():
                    for fmt in ("webp", "jpeg"):
                        url = size_data.get(fmt, "")
                        if url and not url.startswith("http"):
                            local_path = MEDIA_DIR / _local_filename_from_url(url)
                            if local_path.exists():
                                local_path.unlink()
            # Delete R2 files
            if storage_type in ("r2", "both"):
                r2_storage, _ = await _get_r2_service()
                if r2_storage:
                    r2_sizes = media.get("r2_sizes") or (media.get("sizes", {}) if storage_type == "r2" else {})
                    await _delete_r2_sizes(r2_storage, r2_sizes)
        else:
            # Video
            if storage_type in ("local", "both"):
                local_url = media.get("local_url", media.get("url", ""))
                if local_url and not local_url.startswith("http"):
                    local_path = MEDIA_DIR / _local_filename_from_url(local_url)
                    if local_path.exists():
                        local_path.unlink()
            if storage_type in ("r2", "both"):
                r2_storage, _ = await _get_r2_service()
                r2_url = media.get("r2_url", "")
                if r2_storage and r2_url:
                    await r2_storage.delete_from_r2(_r2_key_from_url(r2_url))

        await db.media.delete_one({"file_id": file_id})
        return {"success": True, "message": "Media deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Media delete failed: {e}")
        raise HTTPException(status_code=500, detail="Delete failed")
