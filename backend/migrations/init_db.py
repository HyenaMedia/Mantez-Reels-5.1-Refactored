#!/usr/bin/env python3
"""
Database Initialization and Migration Script
Run this after deploying to set up initial data and indexes
"""

import asyncio
import logging
import os
import sys
from datetime import UTC, datetime, timezone
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Get MongoDB URL from environment (required)
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ.get('DB_NAME', 'portfolio_db')

async def init_database():
    """Initialize database with indexes and default data"""
    logger.info("🚀 Starting database initialization...")

    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]

        logger.info("✅ Connected to MongoDB")

        # Create indexes
        logger.info("📊 Creating indexes...")

        # Users collection indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        await db.users.create_index("created_at")
        logger.info("  ✓ Users indexes created")

        # Portfolio collection indexes
        await db.portfolio.create_index("published")
        await db.portfolio.create_index("featured")
        await db.portfolio.create_index("category")
        await db.portfolio.create_index("created_at")
        await db.portfolio.create_index([("title", "text"), ("description", "text")])
        logger.info("  ✓ Portfolio indexes created")

        # Media collection indexes
        await db.media.create_index("file_type")
        await db.media.create_index("uploaded_at")
        await db.media.create_index("filename")
        logger.info("  ✓ Media indexes created")

        # Messages collection indexes
        await db.contact_messages.create_index("created_at")
        await db.contact_messages.create_index("status")
        await db.contact_messages.create_index("email")
        logger.info("  ✓ Messages indexes created")

        # Settings collection (only one document)
        await db.settings.create_index("_id", unique=True)
        logger.info("  ✓ Settings indexes created")

        # Activity log indexes
        await db.activity_log.create_index("timestamp")
        await db.activity_log.create_index("user_id")
        await db.activity_log.create_index("action_type")
        logger.info("  ✓ Activity log indexes created")

        # Check if admin user exists
        admin_exists = await db.users.find_one({"role": "admin"})

        if not admin_exists:
            import secrets
            logger.info("👤 Creating default admin user...")
            initial_password = os.environ.get("ADMIN_INITIAL_PASSWORD") or secrets.token_urlsafe(16)
            admin_user = {
                "id": str(uuid4()),
                "username": "admin",
                "email": os.environ.get("ADMIN_EMAIL", "admin@mantezreels.com"),
                "password_hash": pwd_context.hash(initial_password),
                "role": "admin",
                "permissions": ["all"],
                "must_change_password": True,
                "created_at": datetime.now(UTC).isoformat(),
            }
            await db.users.insert_one(admin_user)
            logger.info("  ✓ Admin user created")
            logger.info(f"  📧 Email: {admin_user['email']}")
            logger.info(f"  🔑 Password: {initial_password}")
            logger.warning("  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!")
        else:
            logger.info("  ℹ️  Admin user already exists")

        # Check if settings document exists
        settings_exists = await db.settings.find_one()

        if not settings_exists:
            logger.info("⚙️  Creating default settings...")
            default_settings = {
                "siteTitle": "Mantez Reels",
                "siteDescription": "Professional videographer and photographer",
                "contactEmail": "admin@mantezreels.com",
                "primaryColor": "#9333ea",
                "logoUrl": "",
                "faviconUrl": "",
                "staticAssetsCacheDuration": 31536000,
                "mediaCacheDuration": 604800,
                "gzipEnabled": True,
                "imageLazyLoading": True,
                "codeSplitting": True,
                "metaTitle": "Mantez Reels | Professional Videographer & Photographer",
                "metaDescription": "Creating cinematic visuals and complete creative direction. Based in Greece, working worldwide.",
                "metaKeywords": "videographer, photographer, videography, photography, cinematic videos",
                "ogImage": "/og-image.png",
                "twitterHandle": "@mantezreels",
                "analyticsEnabled": False,
                "cookieBanner": {
                    "text": "We use cookies to enhance your experience.",
                    "acceptButtonText": "Accept All",
                    "rejectButtonText": "Reject All",
                    "manageButtonText": "Manage Cookies",
                    "backgroundColor": "#1a1a24",
                    "primaryColor": "#9333ea",
                    "textColor": "#ffffff"
                },
                "maxImageSize": 10485760,
                "maxVideoSize": 104857600,
                "allowedImageTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"],
                "allowedVideoTypes": ["video/mp4", "video/webm", "video/quicktime"],
                "emailService": {
                    "enabled": False,
                    "provider": "smtp",
                    "smtp": {
                        "host": "",
                        "port": 587,
                        "secure": False,
                        "user": "",
                        "password": ""
                    },
                    "sendgrid": {
                        "apiKey": ""
                    },
                    "fromEmail": "noreply@mantezreels.com",
                    "fromName": "Mantez Reels"
                },
                "cloudStorage": {
                    "enabled": False,
                    "provider": "local",
                    "s3": {
                        "accessKeyId": "",
                        "secretAccessKey": "",
                        "region": "us-east-1",
                        "bucket": "",
                        "endpoint": ""
                    }
                },
                "backup": {
                    "enabled": False,
                    "schedule": "daily",
                    "retention": 7,
                    "destination": "local"
                },
                "monitoring": {
                    "sentry": {
                        "enabled": False,
                        "dsn": ""
                    },
                    "uptimeRobot": {
                        "enabled": False,
                        "apiKey": ""
                    }
                }
            }
            await db.settings.insert_one(default_settings)
            logger.info("  ✓ Default settings created")
        else:
            logger.info("  ℹ️  Settings already exist")

        logger.info("\n✅ Database initialization complete!")
        logger.info("\n📝 Next steps:")
        logger.info("  1. Login to admin panel")
        logger.info("  2. Change default admin password")
        logger.info("  3. Configure settings (email, storage, etc.)")
        logger.info("  4. Upload your first portfolio item")

    except Exception as e:
        logger.info(f"\n❌ Error during initialization: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    logger.info("="*60)
    logger.info("  Mantez Reels - Database Initialization")
    logger.info("="*60)
    logger.info()
    asyncio.run(init_database())
