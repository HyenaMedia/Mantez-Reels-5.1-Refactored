import logging
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_auth
from database import db
from services.cache_service import cache

router = APIRouter(prefix="/api/pages", tags=["pages"])
logger = logging.getLogger(__name__)

COLLECTION = "pages"


class PageStateModel(BaseModel):
    page: dict[str, Any]


class SectionOrderModel(BaseModel):
    section_ids: list[str]


@router.get("")
async def list_pages(user: dict = Depends(require_auth)):
    """List all pages"""
    try:
        pages = await db[COLLECTION].find(
            {}, {"_id": 0, "id": 1, "name": 1, "updated_at": 1}
        ).to_list(100)

        if not pages:
            return {"pages": [{"id": "home", "name": "Home Page", "updated_at": datetime.now(UTC).isoformat()}]}

        for p in pages:
            if "updated_at" in p and hasattr(p["updated_at"], "isoformat"):
                p["updated_at"] = p["updated_at"].isoformat()

        return {"pages": pages}
    except Exception as e:
        logger.error(f"Error listing pages: {e}")
        raise HTTPException(status_code=500, detail="Failed to list pages")


@router.get("/{page_id}")
async def get_page(page_id: str, user: dict = Depends(require_auth)):
    """Get page by ID (requires auth)"""
    try:
        page_doc = await db[COLLECTION].find_one({"id": page_id}, {"_id": 0})

        if not page_doc:
            # Return default structure for home page
            return _default_home_page()

        return {"page": page_doc.get("data", page_doc)}
    except Exception as e:
        logger.error(f"Error getting page: {e}")
        raise HTTPException(status_code=500, detail="Failed to get page")


@router.get("/{page_id}/public")
async def get_page_public(page_id: str):
    """Get page by ID (public access - no auth required)"""
    cache_key = f"pages:public:{page_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    try:
        page_doc = await db[COLLECTION].find_one({"id": page_id}, {"_id": 0})

        if not page_doc:
            result = _default_home_page()
        else:
            result = {"page": page_doc.get("data", page_doc)}

        cache.set(cache_key, result, 120)
        return result
    except Exception as e:
        logger.error(f"Error getting public page: {e}")
        raise HTTPException(status_code=500, detail="Failed to get page")


@router.put("/{page_id}")
async def update_page(
    page_id: str,
    page_state: PageStateModel,
    user: dict = Depends(require_auth),
):
    """Update page — upserts into MongoDB"""
    try:
        cache.invalidate_pattern("pages:")
        doc = {
            "id": page_id,
            "name": page_state.page.get("meta", {}).get("name", page_id),
            "data": page_state.page,
            "updated_at": datetime.now(UTC),
            "updated_by": user.get("username", "admin"),
        }

        await db[COLLECTION].update_one(
            {"id": page_id}, {"$set": doc}, upsert=True
        )

        return {"success": True, "message": "Page saved"}
    except Exception as e:
        logger.error(f"Error updating page: {e}")
        raise HTTPException(status_code=500, detail="Failed to update page")


@router.post("")
async def create_page(
    page_state: PageStateModel,
    user: dict = Depends(require_auth),
):
    """Create new page"""
    try:
        page_id = page_state.page.get("meta", {}).get("id", f"page-{datetime.now(UTC).timestamp()}")

        existing = await db[COLLECTION].find_one({"id": page_id})
        if existing:
            raise HTTPException(status_code=409, detail="Page already exists")

        doc = {
            "id": page_id,
            "name": page_state.page.get("meta", {}).get("name", page_id),
            "data": page_state.page,
            "created_at": datetime.now(UTC),
            "updated_at": datetime.now(UTC),
            "updated_by": user.get("username", "admin"),
        }

        await db[COLLECTION].insert_one(doc)

        return {"success": True, "pageId": page_id, "message": "Page created"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating page: {e}")
        raise HTTPException(status_code=500, detail="Failed to create page")


@router.delete("/{page_id}")
async def delete_page(page_id: str, user: dict = Depends(require_auth)):
    """Delete page"""
    try:
        result = await db[COLLECTION].delete_one({"id": page_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Page not found")

        return {"success": True, "message": "Page deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting page: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete page")


@router.put("/{page_id}/sections/order")
async def update_section_order(
    page_id: str,
    order: SectionOrderModel,
    user: dict = Depends(require_auth),
):
    """Update section order for a page"""
    try:
        page_doc = await db[COLLECTION].find_one({"id": page_id})
        if not page_doc:
            raise HTTPException(status_code=404, detail="Page not found")

        page_data = page_doc.get("data", {})
        sections = page_data.get("sections", [])

        section_map = {s["id"]: s for s in sections}
        reordered = [section_map[sid] for sid in order.section_ids if sid in section_map]

        page_data["sections"] = reordered
        await db[COLLECTION].update_one(
            {"id": page_id},
            {"$set": {"data": page_data, "updated_at": datetime.now(UTC)}},
        )

        return {"success": True, "message": "Section order updated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating section order: {e}")
        raise HTTPException(status_code=500, detail="Failed to update section order")


## ── Version History ──────────────────────────────────────────────────────


VERSIONS_COLLECTION = "page_versions"
MAX_VERSIONS = 50  # keep last 50 versions per page


class VersionLabelModel(BaseModel):
    label: str = ""


@router.get("/{page_id}/versions")
async def list_versions(
    page_id: str,
    limit: int = 20,
    offset: int = 0,
    user: dict = Depends(require_auth),
):
    """List saved versions for a page (newest first, paginated).

    Query params:
      - limit  (int, 1-100, default 20): versions per page
      - offset (int, default 0): versions to skip
    Returns total count and has_more flag for client-side pagination.
    """
    try:
        limit  = max(1, min(limit, 100))
        offset = max(0, offset)

        total = await db[VERSIONS_COLLECTION].count_documents({"page_id": page_id})
        docs = await db[VERSIONS_COLLECTION].find(
            {"page_id": page_id},
            {"_id": 0, "id": 1, "label": 1, "timestamp": 1, "saved_by": 1, "section_count": 1},
        ).sort("timestamp", -1).skip(offset).limit(limit).to_list(limit)

        for d in docs:
            if "timestamp" in d and hasattr(d["timestamp"], "isoformat"):
                d["timestamp"] = d["timestamp"].isoformat()

        return {
            "versions": docs,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + len(docs)) < total,
        }
    except Exception as e:
        logger.error(f"Error listing versions: {e}")
        raise HTTPException(status_code=500, detail="Failed to list versions")


@router.post("/{page_id}/versions")
async def save_version(
    page_id: str,
    body: VersionLabelModel,
    user: dict = Depends(require_auth),
):
    """Create a named version snapshot of the current page"""
    try:
        page_doc = await db[COLLECTION].find_one({"id": page_id}, {"_id": 0})
        if not page_doc:
            raise HTTPException(status_code=404, detail="Page not found")

        now = datetime.now(UTC)
        version_id = f"{page_id}-v-{int(now.timestamp() * 1000)}"
        page_data = page_doc.get("data", {})

        snap = {
            "id": version_id,
            "page_id": page_id,
            "label": body.label or f"Version {now.strftime('%b %d, %H:%M')}",
            "timestamp": now,
            "saved_by": user.get("username", "admin"),
            "section_count": len(page_data.get("sections", [])),
            "state": page_data,
        }

        await db[VERSIONS_COLLECTION].insert_one(snap)

        # Prune old versions beyond MAX_VERSIONS
        all_versions = await db[VERSIONS_COLLECTION].find(
            {"page_id": page_id}, {"_id": 1}
        ).sort("timestamp", -1).to_list(None)

        if len(all_versions) > MAX_VERSIONS:
            old_ids = [v["_id"] for v in all_versions[MAX_VERSIONS:]]
            await db[VERSIONS_COLLECTION].delete_many({"_id": {"$in": old_ids}})

        return {"success": True, "versionId": version_id, "label": snap["label"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving version: {e}")
        raise HTTPException(status_code=500, detail="Failed to save version")


@router.get("/{page_id}/versions/{version_id}")
async def get_version(page_id: str, version_id: str, user: dict = Depends(require_auth)):
    """Get full state of a specific version"""
    try:
        doc = await db[VERSIONS_COLLECTION].find_one(
            {"id": version_id, "page_id": page_id}, {"_id": 0}
        )
        if not doc:
            raise HTTPException(status_code=404, detail="Version not found")

        if "timestamp" in doc and hasattr(doc["timestamp"], "isoformat"):
            doc["timestamp"] = doc["timestamp"].isoformat()

        return {"version": doc}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting version: {e}")
        raise HTTPException(status_code=500, detail="Failed to get version")


@router.post("/{page_id}/versions/{version_id}/restore")
async def restore_version(page_id: str, version_id: str, user: dict = Depends(require_auth)):
    """Restore a page to a specific version (saves current as auto-backup first)"""
    try:
        ver_doc = await db[VERSIONS_COLLECTION].find_one(
            {"id": version_id, "page_id": page_id}, {"_id": 0, "state": 1, "label": 1}
        )
        if not ver_doc:
            raise HTTPException(status_code=404, detail="Version not found")

        # Save current state as auto-backup before restoring
        current = await db[COLLECTION].find_one({"id": page_id}, {"_id": 0, "data": 1})
        if current:
            now = datetime.now(UTC)
            backup_id = f"{page_id}-v-auto-{int(now.timestamp() * 1000)}"
            await db[VERSIONS_COLLECTION].insert_one({
                "id": backup_id,
                "page_id": page_id,
                "label": f"Auto-backup before restore ({ver_doc.get('label', '')})",
                "timestamp": now,
                "saved_by": user.get("username", "admin"),
                "section_count": len(current.get("data", {}).get("sections", [])),
                "state": current.get("data", {}),
            })

        # Restore
        await db[COLLECTION].update_one(
            {"id": page_id},
            {"$set": {"data": ver_doc["state"], "updated_at": datetime.now(UTC), "updated_by": user.get("username", "admin")}},
        )

        return {"success": True, "message": f"Restored to '{ver_doc.get('label', version_id)}'"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring version: {e}")
        raise HTTPException(status_code=500, detail="Failed to restore version")


@router.delete("/{page_id}/versions/{version_id}")
async def delete_version(page_id: str, version_id: str, user: dict = Depends(require_auth)):
    """Delete a specific version"""
    try:
        result = await db[VERSIONS_COLLECTION].delete_one({"id": version_id, "page_id": page_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Version not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting version: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete version")


def _default_home_page():
    """Return default home page structure"""
    return {
        "page": {
            "meta": {
                "id": "home",
                "name": "Home Page",
                "settings": {
                    "seo": {"title": "Welcome", "description": ""},
                    "globalStyles": {
                        "colors": {"primary": "#8b5cf6", "secondary": "#7c3aed"},
                        "typography": {"headingFont": "Inter", "bodyFont": "Inter"},
                    },
                },
            },
            "sections": [],
            "components": {},
        }
    }
