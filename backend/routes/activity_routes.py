"""
Activity Log Routes
Track all admin actions for audit purposes
"""

import logging
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from auth import require_auth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/activity", tags=["activity"])

from database import db

class ActivityLog(BaseModel):
    user_id: str
    user_email: str
    action_type: str  # create, update, delete, publish, unpublish
    resource_type: str  # portfolio, media, user, settings, etc.
    resource_id: str | None = None
    resource_name: str | None = None
    details: dict | None = None
    ip_address: str | None = None
    user_agent: str | None = None

async def log_activity(
    user_id: str,
    user_email: str,
    action_type: str,
    resource_type: str,
    resource_id: str | None = None,
    resource_name: str | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None
):
    """Log an activity to the database"""
    try:
        log_entry = {
            "user_id": user_id,
            "user_email": user_email,
            "action_type": action_type,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "resource_name": resource_name,
            "details": details or {},
            "ip_address": ip_address,
            "user_agent": user_agent,
            "timestamp": datetime.now(UTC).isoformat(),
        }
        await db.activity_log.insert_one(log_entry)
    except Exception as e:
        logger.error(f"Failed to log activity: {e}")

@router.get("/list")
async def list_recent_activities(
    limit: int = Query(10, le=50),
    user: dict = Depends(require_auth)
):
    """Get recent activities for notifications"""
    try:
        # Get recent activities
        activities = await db.activity_log.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)

        # Transform for notification format
        notifications = []
        for activity in activities:
            action_text = f"{activity.get('action_type', 'action')} on {activity.get('resource_type', 'resource')}"
            if activity.get('resource_name'):
                action_text += f" '{activity.get('resource_name')}'"

            notifications.append({
                "id": activity.get("timestamp", ""),  # Use timestamp as ID
                "action": action_text,
                "details": activity.get("details", {}).get("message", ""),
                "timestamp": activity.get("timestamp", ""),
                "read": False,  # Default to unread
                "user_email": activity.get("user_email", "")
            })

        return {
            "success": True,
            "activities": notifications,
            "count": len(notifications)
        }
    except Exception as e:
        logger.error(f"Failed to list recent activities: {e}")
        raise HTTPException(status_code=500, detail="Failed to list activities")

@router.get("/logs")
async def get_activity_logs(
    limit: int = Query(50, le=100),
    skip: int = Query(0, ge=0),
    user_id: str | None = None,
    action_type: str | None = None,
    resource_type: str | None = None,
    days: int = Query(30, le=365),
    current_user: dict = Depends(require_auth),
):
    """Get activity logs with filters"""
    try:
        # Build query
        query = {}

        # Filter by date range
        cutoff_date = datetime.now(UTC) - timedelta(days=days)
        query["timestamp"] = {"$gte": cutoff_date.isoformat()}

        if user_id:
            query["user_id"] = user_id
        if action_type:
            query["action_type"] = action_type
        if resource_type:
            query["resource_type"] = resource_type

        # Get logs
        logs = await db.activity_log.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
        total = await db.activity_log.count_documents(query)

        return {
            "logs": logs,
            "total": total,
            "page": skip // limit + 1,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Failed to get activity logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get activity logs")

@router.get("/stats")
async def get_activity_stats(days: int = Query(7, le=365), current_user: dict = Depends(require_auth)):
    """Get activity statistics"""
    try:
        cutoff_date = datetime.now(UTC) - timedelta(days=days)

        # Get activity by type
        pipeline = [
            {"$match": {"timestamp": {"$gte": cutoff_date.isoformat()}}},
            {"$group": {"_id": "$action_type", "count": {"$sum": 1}}}
        ]
        activity_by_type = await db.activity_log.aggregate(pipeline).to_list(None)

        # Get activity by user
        pipeline = [
            {"$match": {"timestamp": {"$gte": cutoff_date.isoformat()}}},
            {"$group": {"_id": "$user_email", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        activity_by_user = await db.activity_log.aggregate(pipeline).to_list(None)

        # Get recent activity count
        total = await db.activity_log.count_documents(
            {"timestamp": {"$gte": cutoff_date.isoformat()}}
        )

        return {
            "total_activities": total,
            "by_type": activity_by_type,
            "by_user": activity_by_user,
            "period_days": days
        }
    except Exception as e:
        logger.error(f"Failed to get activity stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get activity stats")

@router.delete("/logs")
async def clear_old_logs(days: int = Query(90, le=365), current_user: dict = Depends(require_auth)):
    """Delete logs older than specified days"""
    try:
        cutoff_date = datetime.now(UTC) - timedelta(days=days)
        result = await db.activity_log.delete_many(
            {"timestamp": {"$lt": cutoff_date.isoformat()}}
        )
        return {
            "message": f"Deleted {result.deleted_count} old log entries",
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        logger.error(f"Failed to clear old logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear old logs")
