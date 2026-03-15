"""
Integrations Routes
Handle third-party service configurations
"""

import logging
import os

# Import service classes
import sys
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from auth import require_auth
from services.email_service import EmailService
from services.storage_service import StorageService

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

from database import db

# Pydantic models
class EmailServiceConfig(BaseModel):
    enabled: bool = False
    provider: str = "smtp"  # smtp, sendgrid, resend
    smtp: dict[str, Any] | None = None
    sendgrid: dict[str, Any] | None = None
    resend: dict[str, Any] | None = None
    fromEmail: EmailStr = "noreply@example.com"
    fromName: str = "Portfolio"
    contactEmail: EmailStr = "admin@example.com"

class StorageServiceConfig(BaseModel):
    enabled: bool = False
    provider: str = "local"  # local, s3, spaces, r2
    s3: dict[str, Any] | None = None

class MonitoringServiceConfig(BaseModel):
    sentry: dict[str, Any] | None = None
    uptimeRobot: dict[str, Any] | None = None

class BackupConfig(BaseModel):
    enabled: bool = False
    schedule: str = "daily"  # daily, weekly, monthly
    retention: int = 7  # days
    destination: str = "local"  # local, s3

class PostHogConfig(BaseModel):
    enabled: bool = False
    apiKey: str = ""
    host: str = "https://app.posthog.com"

# Get current integrations settings
@router.get("/settings")
async def get_integrations_settings(current_user: dict = Depends(require_auth)):
    """Get all integrations settings"""
    settings = await db.settings.find_one({}, {"_id": 0})

    if not settings:
        return {
            "emailService": {},
            "cloudStorage": {},
            "monitoring": {},
            "backup": {},
            "analytics": {}
        }

    return {
        "emailService": settings.get("emailService", {}),
        "cloudStorage": settings.get("cloudStorage", {}),
        "monitoring": settings.get("monitoring", {}),
        "backup": settings.get("backup", {}),
        "analytics": {
            "posthog": settings.get("posthog", {}),
            "enabled": settings.get("analyticsEnabled", False)
        }
    }

# Update email service settings
@router.put("/email")
async def update_email_settings(config: EmailServiceConfig, current_user: dict = Depends(require_auth)):
    """Update email service configuration"""
    try:
        await db.settings.update_one(
            {},
            {
                "$set": {
                    "emailService": config.model_dump(),
                    "contactEmail": config.contactEmail
                }
            },
            upsert=True
        )
        return {"message": "Email settings updated successfully", "config": config.model_dump()}
    except Exception as e:
        logger.error(f"Failed to update email settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update email settings")

# Test email service
@router.post("/email/test")
async def test_email_service(test_email: EmailStr, current_user: dict = Depends(require_auth)):
    """Send test email to verify configuration"""
    settings = await db.settings.find_one({})

    if not settings or not settings.get("emailService"):
        raise HTTPException(status_code=400, detail="Email service not configured")

    email_service = EmailService(settings["emailService"])

    success = await email_service.send_email(
        to_email=test_email,
        subject="Test Email from Portfolio",
        html_content="""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #9333ea;">Email Service Test</h2>
                <p>Congratulations! Your email service is configured correctly.</p>
                <p>This is a test email sent from your portfolio website.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                    If you received this email, your email integration is working properly.
                </p>
            </body>
        </html>
        """,
        text_content="Email Service Test\\n\\nCongratulations! Your email service is configured correctly."
    )

    if success:
        return {"message": f"Test email sent successfully to {test_email}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test email")

# Update storage service settings
@router.put("/storage")
async def update_storage_settings(config: StorageServiceConfig, current_user: dict = Depends(require_auth)):
    """Update cloud storage configuration"""
    try:
        await db.settings.update_one(
            {},
            {"$set": {"cloudStorage": config.model_dump()}},
            upsert=True
        )
        return {"message": "Storage settings updated successfully", "config": config.model_dump()}
    except Exception as e:
        logger.error(f"Failed to update storage settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update storage settings")

# Test storage service
@router.post("/storage/test")
async def test_storage_service(current_user: dict = Depends(require_auth)):
    """Test storage service connectivity"""
    settings = await db.settings.find_one({})

    if not settings or not settings.get("cloudStorage"):
        raise HTTPException(status_code=400, detail="Storage service not configured")

    storage_service = StorageService(settings["cloudStorage"])

    # Try to upload a small test file
    test_data = b"Test file content"
    test_filename = f"test_{datetime.now().timestamp()}.txt"

    success, url = await storage_service.upload_file(
        file_data=test_data,
        filename=test_filename,
        content_type="text/plain",
        folder="test"
    )

    if success:
        # Clean up test file
        await storage_service.delete_file(url)
        return {"message": "Storage service test successful", "provider": storage_service.provider}
    else:
        raise HTTPException(status_code=500, detail="Storage service test failed")

# Update monitoring settings
@router.put("/monitoring")
async def update_monitoring_settings(config: MonitoringServiceConfig, current_user: dict = Depends(require_auth)):
    """Update monitoring service configuration"""
    try:
        await db.settings.update_one(
            {},
            {"$set": {"monitoring": config.model_dump()}},
            upsert=True
        )
        return {"message": "Monitoring settings updated successfully", "config": config.model_dump()}
    except Exception as e:
        logger.error(f"Failed to update monitoring settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update monitoring settings")

# Update backup settings
@router.put("/backup")
async def update_backup_settings(config: BackupConfig, current_user: dict = Depends(require_auth)):
    """Update backup configuration"""
    try:
        await db.settings.update_one(
            {},
            {"$set": {"backup": config.model_dump()}},
            upsert=True
        )
        return {"message": "Backup settings updated successfully", "config": config.model_dump()}
    except Exception as e:
        logger.error(f"Failed to update backup settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update backup settings")

# Update PostHog analytics settings
@router.put("/analytics/posthog")
async def update_posthog_settings(config: PostHogConfig, current_user: dict = Depends(require_auth)):
    """Update PostHog analytics configuration"""
    try:
        await db.settings.update_one(
            {},
            {
                "$set": {
                    "posthog": config.model_dump(),
                    "analyticsEnabled": config.enabled
                }
            },
            upsert=True
        )
        return {"message": "PostHog settings updated successfully", "config": config.model_dump()}
    except Exception as e:
        logger.error(f"Failed to update PostHog settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update PostHog settings")

# Get PostHog events (proxy to PostHog API)
@router.get("/analytics/posthog/events")
async def get_posthog_events(current_user: dict = Depends(require_auth)):
    """Fetch analytics data from PostHog"""
    settings = await db.settings.find_one({})

    if not settings or not settings.get("posthog", {}).get("enabled"):
        raise HTTPException(status_code=400, detail="PostHog not configured")

    raise HTTPException(
        status_code=501,
        detail="PostHog analytics proxy not configured. Use PostHog dashboard directly or configure the API integration."
    )
