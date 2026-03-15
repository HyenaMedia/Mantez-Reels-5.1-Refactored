import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from slowapi import Limiter

from auth import auth_handler, require_auth
from database import db
from utils.network import get_real_ipaddr

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Initialize limiter for auth routes with custom IP detection
limiter = Limiter(key_func=get_real_ipaddr)


class UserLogin(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    password: str
    email: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")  # Strict rate limit for login attempts
async def login(request: Request, credentials: UserLogin):
    """Login endpoint - returns JWT token"""
    try:
        # Find user by username
        user = await db.users.find_one({'username': credentials.username})

        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        # Verify password
        if not auth_handler.verify_password(credentials.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        # Create access token
        token = auth_handler.create_access_token(user['id'], user['username'])

        # Update last login
        await db.users.update_one(
            {'id': user['id']},
            {'$set': {'last_login': datetime.now(timezone.utc)}}
        )

        return {
            'access_token': token,
            'token_type': 'bearer',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/register")
@limiter.limit("3/hour")  # Strict rate limit for user registration
async def register(request: Request, user_data: UserCreate, current_user: dict = Depends(require_auth)):
    """Register a new admin user - PROTECTED: Only authenticated admins can create new users"""
    try:
        # Check if username already exists
        existing_user = await db.users.find_one({'username': user_data.username})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        # Check if email already exists
        existing_email = await db.users.find_one({'email': user_data.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Hash password
        password_hash = auth_handler.hash_password(user_data.password)

        # Create user document
        user_doc = {
            'id': str(uuid.uuid4()),
            'username': user_data.username,
            'email': user_data.email,
            'password_hash': password_hash,
            'created_at': datetime.now(timezone.utc),
            'last_login': None,
            'created_by': current_user['user_id']  # Track who created this user
        }

        await db.users.insert_one(user_doc)

        return {
            'success': True,
            'message': 'User created successfully',
            'user_id': user_doc['id']
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User creation failed: {e}")
        raise HTTPException(status_code=500, detail="User creation failed")


@router.get("/me")
async def get_current_user(current_user: dict = Depends(require_auth)):
    """Get current authenticated user info"""
    try:
        user = await db.users.find_one({'id': current_user['user_id']})

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'created_at': user.get('created_at')
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user info")


@router.post("/change-password")
async def change_password(
    request_data: ChangePasswordRequest,
    current_user: dict = Depends(require_auth)
):
    """Change password for the current authenticated user"""
    try:
        user = await db.users.find_one({'id': current_user['user_id']})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not auth_handler.verify_password(request_data.current_password, user['password_hash']):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        if len(request_data.new_password) < 8:
            raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

        new_hash = auth_handler.hash_password(request_data.new_password)
        await db.users.update_one(
            {'id': current_user['user_id']},
            {'$set': {
                'password_hash': new_hash,
                'password_changed_at': datetime.now(timezone.utc).isoformat()
            }}
        )
        return {'success': True, 'message': 'Password changed successfully'}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to change password: {e}")
        raise HTTPException(status_code=500, detail="Failed to change password")


@router.get("/security-check")
async def security_check(current_user: dict = Depends(require_auth)):
    """Check if the current user is still using the default password"""
    try:
        user = await db.users.find_one({'id': current_user['user_id']})
        if not user:
            return {'is_default_password': False}
        # Once password_changed_at is set, no longer default
        if user.get('password_changed_at'):
            return {'is_default_password': False}
        is_default = auth_handler.verify_password('admin123', user.get('password_hash', ''))
        return {'is_default_password': is_default}
    except Exception as e:
        logger.debug(f"Security check failed for user {current_user.get('user_id', 'unknown')}: {e}")
        return {'is_default_password': False}


@router.post("/logout")
async def logout(current_user: dict = Depends(require_auth)):
    """Logout endpoint (client should discard token)"""
    return {
        'success': True,
        'message': 'Logged out successfully'
    }
