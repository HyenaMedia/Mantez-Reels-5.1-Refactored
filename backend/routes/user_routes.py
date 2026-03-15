import logging
from datetime import UTC, datetime

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from auth import require_auth

load_dotenv()

from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MIN_PASSWORD_LENGTH = 8

def _require_admin(current_user: dict):
    """Raise 403 if the authenticated user is not an admin."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

def _validate_password(password: str):
    """Enforce consistent password policy across all endpoints."""
    if len(password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    if not any(c.isupper() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not any(c.isdigit() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one digit")


class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: str | None = "editor"
    permissions: list[str] | None = None


class PasswordChange(BaseModel):
    new_password: str


@router.get("/list")
async def list_users(current_user: dict = Depends(require_auth)):
    """Get all users (admin only)"""
    _require_admin(current_user)
    try:
        users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
        return {"success": True, "users": users}
    except Exception as e:
        logger.error(f"Failed to fetch users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


@router.get("/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(require_auth)):
    """Get a specific user by ID"""
    try:
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"success": True, "user": user}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch user: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user")


@router.put("/{user_id}")
async def update_user(user_id: str, data: UserUpdate, current_user: dict = Depends(require_auth)):
    """Update a user's information (admin only, or self for own profile)"""
    if current_user.get("user_id") != user_id:
        _require_admin(current_user)
    try:
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        update_data = {}

        if data.username:
            # Check if username is taken by another user
            existing = await db.users.find_one({"username": data.username, "id": {"$ne": user_id}})
            if existing:
                raise HTTPException(status_code=400, detail="Username already taken")
            update_data["username"] = data.username

        if data.email:
            # Check if email is taken by another user
            existing = await db.users.find_one({"email": data.email, "id": {"$ne": user_id}})
            if existing:
                raise HTTPException(status_code=400, detail="Email already taken")
            update_data["email"] = data.email

        if data.password:
            _validate_password(data.password)
            update_data["password_hash"] = pwd_context.hash(data.password)

        if data.role:
            # Only admins can change roles
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Only admins can change user roles")
            update_data["role"] = data.role

        if data.permissions is not None:
            update_data["permissions"] = data.permissions

        update_data["updated_at"] = datetime.now(UTC).isoformat()

        if update_data:
            await db.users.update_one({"id": user_id}, {"$set": update_data})

        return {"success": True, "message": "User updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user")


@router.put("/{user_id}/password")
async def change_password(user_id: str, data: PasswordChange, current_user: dict = Depends(require_auth)):
    """Change a user's password (admin only, or self)"""
    if current_user.get("user_id") != user_id:
        _require_admin(current_user)
    try:
        _validate_password(data.new_password)

        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        password_hash = pwd_context.hash(data.new_password)

        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "password_hash": password_hash,
                "password_changed_at": datetime.now(UTC).isoformat()
            }}
        )

        return {"success": True, "message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to change password: {e}")
        raise HTTPException(status_code=500, detail="Failed to change password")


@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_auth)):
    """Delete a user (admin only)"""
    _require_admin(current_user)
    try:
        # Prevent deleting yourself
        if current_user.get("user_id") == user_id:
            raise HTTPException(status_code=400, detail="Cannot delete your own account")

        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await db.users.delete_one({"id": user_id})

        return {"success": True, "message": "User deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete user: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user")


# Security stats endpoint
@router.get("/security/stats")
async def get_security_stats(current_user: dict = Depends(require_auth)):
    """Get security statistics"""
    try:
        # Get scan statistics from media collection
        total_scans = await db.media.count_documents({"scanned": True})
        threats_blocked = await db.media.count_documents({"scan_result": "infected"})

        # Get last scan time
        last_scan = await db.media.find_one(
            {"scanned": True},
            sort=[("uploaded_at", -1)]
        )

        return {
            "totalScans": total_scans,
            "threatsBlocked": threats_blocked,
            "lastScanTime": last_scan.get("uploaded_at") if last_scan else None
        }
    except Exception as e:
        logger.debug(f"Failed to fetch security stats: {e}")
        return {
            "totalScans": 0,
            "threatsBlocked": 0,
            "lastScanTime": None
        }
