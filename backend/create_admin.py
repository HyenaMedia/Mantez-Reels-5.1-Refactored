#!/usr/bin/env python3
"""
Script to create the first admin user for Mantez Reels
"""

import asyncio
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from auth import AuthHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_admin_user():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]

    logger.info("=" * 50)
    logger.info("Create Admin User for Mantez Reels")
    logger.info("=" * 50)

    # Get user input
    username = input("\nEnter username: ").strip()
    if not username:
        logger.error("❌ Username cannot be empty")
        return

    # Check if user exists
    existing = await db.users.find_one({'username': username})
    if existing:
        logger.error(f"❌ User '{username}' already exists")
        return

    email = input("Enter email: ").strip()
    if not email:
        logger.error("❌ Email cannot be empty")
        return

    password = input("Enter password: ").strip()
    if not password or len(password) < 6:
        logger.error("❌ Password must be at least 6 characters")
        return

    # Create user
    auth_handler = AuthHandler()
    password_hash = auth_handler.hash_password(password)

    import uuid
    from datetime import datetime, timezone

    user_doc = {
        'id': str(uuid.uuid4()),
        'username': username,
        'email': email,
        'password_hash': password_hash,
        'created_at': datetime.now(timezone.utc),
        'last_login': None
    }

    await db.users.insert_one(user_doc)

    logger.info("\n✅ Admin user created successfully!")
    logger.info(f"   Username: {username}")
    logger.info(f"   Email: {email}")
    logger.info("\n🔐 You can now login at: /login")

    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
