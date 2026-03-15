import logging

# from slowapi.middleware import SlowAPIMiddleware  # Removed - using per-route decorators instead
import os
import uuid
from datetime import UTC, datetime
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware

# Import database
from database import db

# Import network utils
from utils.network import get_real_ipaddr

from routes import activity_routes as activity
from routes import ai_routes as ai
from routes import analytics_proxy_routes as analytics_proxy
from routes import animation_routes as animation
from routes import auth_routes as auth
from routes import contact_routes as contact
from routes import content_query_routes as content_query
from routes import content_routes as content
from routes import feature_routes as feature
from routes import integrations_routes as integrations

# Import route modules
from routes import media_routes as media
from routes import metrics_routes as metrics
from routes import pages_routes as pages
from routes import portfolio_routes as portfolio
from routes import security_routes as security
from routes import settings_routes as settings
from routes import theme_routes as theme
from routes import user_routes as users

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database connection is handled in startup event

# Initialize rate limiter with custom IP detection
limiter = Limiter(key_func=get_real_ipaddr, default_limits=["100/minute"])

# Create the main app without a prefix
app = FastAPI(title="Mantez Reels API", version="1.0.0")

# Set rate limiter for app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom middleware for cache control headers
class CacheControlMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Static assets - aggressive caching (1 year)
        if any(request.url.path.endswith(ext) for ext in
               ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico',
                '.svg', '.woff', '.woff2', '.ttf', '.eot', '.webp']):
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'

        # Media files - cache for 1 week
        elif '/media/' in request.url.path:
            response.headers['Cache-Control'] = 'public, max-age=604800'

        # API responses - no cache but allow revalidation
        elif '/api/' in request.url.path:
            response.headers['Cache-Control'] = 'no-cache, must-revalidate'

        # HTML - short cache with revalidation
        elif request.url.path.endswith('.html') or request.url.path == '/':
            response.headers['Cache-Control'] = 'public, max-age=3600, must-revalidate'

        return response

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # HSTS - Force HTTPS (31536000 seconds = 1 year)
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'

        # Prevent clickjacking
        response.headers['X-Frame-Options'] = 'DENY'

        # Prevent MIME type sniffing
        response.headers['X-Content-Type-Options'] = 'nosniff'

        # XSS Protection (legacy browsers)
        response.headers['X-XSS-Protection'] = '1; mode=block'

        # Referrer Policy
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Cross-Origin-Opener-Policy (COOP) - For better cross-origin isolation
        response.headers['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
        
        # Cross-Origin-Embedder-Policy (COEP)
        response.headers['Cross-Origin-Embedder-Policy'] = 'credentialless'

        # Content Security Policy — derive allowed origins from CORS config
        cors_env = os.environ.get('CORS_ORIGINS', '*')
        connect_origins = ' '.join(
            origin.strip() for origin in cors_env.split(',') if origin.strip() and origin.strip() != '*'
        ) if cors_env != '*' else ''
        csp_directives = [
            "default-src 'self'",
            # TODO: Replace 'unsafe-inline' with nonce-based CSP in production
            "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://d2adkz2s9zrlge.cloudfront.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: https: blob:",
            f"connect-src 'self' {connect_origins}".strip(),
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests"
        ]
        response.headers['Content-Security-Policy'] = "; ".join(csp_directives)

        # Permissions Policy (formerly Feature Policy)
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'

        return response

# Maintenance Mode Middleware
class MaintenanceModeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip maintenance check for admin, auth, and settings endpoints
        if (request.url.path.startswith('/api/auth') or
            request.url.path.startswith('/api/settings') or
            request.url.path == '/login' or
            request.url.path.startswith('/admin')):
            return await call_next(request)

        # Check if maintenance mode is enabled
        try:
            settings_doc = await db.settings.find_one({})
            if settings_doc:
                is_maintenance = settings_doc.get('advanced', {}).get('maintenanceMode', False)
                if is_maintenance:
                    # Return maintenance page for API calls
                    if request.url.path.startswith('/api'):
                        return Response(
                            content='{"error": "Site is currently under maintenance. Please check back soon.", "maintenance": true}',
                            status_code=503,
                            media_type="application/json",
                            headers={"Retry-After": "3600"}
                        )
                    # For regular page requests, let React handle it
                    # (React will fetch settings and show maintenance component)
        except Exception as e:
            # If we can't check settings, log but allow through
            logger.error(f"Maintenance check error: {e}")

        return await call_next(request)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Mantez Reels API - Ready"}

@api_router.get("/health")
async def api_health_check():
    """Health check endpoint for load balancers and monitoring (via /api/health)"""
    try:
        # Check database connectivity
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": "Database connection failed",
                "timestamp": datetime.now(UTC).isoformat()
            }
        )

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate, current_user: dict = Depends(require_auth)):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=list[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).sort("timestamp", -1).limit(100).to_list(100)

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

# Include the main router
app.include_router(api_router)

# Include additional routers
app.include_router(auth.router)
app.include_router(media.router)
app.include_router(portfolio.router)
app.include_router(contact.router)
app.include_router(content.router)
app.include_router(settings.router)
app.include_router(metrics.router)
app.include_router(users.router)
app.include_router(integrations.router)
app.include_router(activity.router)
app.include_router(analytics_proxy.router)
app.include_router(security.router)
app.include_router(theme.router)
app.include_router(pages.router)
app.include_router(content_query.router)
app.include_router(ai.router)
app.include_router(animation.router)
app.include_router(feature.router)

# Serve media files
media_dir = Path(os.environ.get('MEDIA_DIR', '/tmp/backend/media'))
try:
    media_dir.mkdir(parents=True, exist_ok=True)
except (PermissionError, OSError):
    media_dir = Path('/tmp/backend/media')
    media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")

# Add maintenance mode middleware (check before serving content)
app.add_middleware(MaintenanceModeMiddleware)

# Add compression middleware (should be one of the first)
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=6)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add cache control middleware
app.add_middleware(CacheControlMiddleware)

# NOTE: Removed SlowAPIMiddleware - rate limiting is applied per-route using decorators
# This prevents issues with unannotated routes

# Parse CORS origins from environment variable with comprehensive defaults
cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000')
if cors_origins == '*':
    # Development mode - allow all origins
    allow_origins = ['*']
else:
    # Production mode - parse specific origins
    allow_origins = [origin.strip() for origin in cors_origins.split(',')]

# Automatically include any .onrender.com origins from CORS_ORIGINS
# No hardcoded Render URLs — all managed via CORS_ORIGINS env var
if allow_origins != ['*']:
    print(f"🔒 CORS Origins: {', '.join(allow_origins)}")

app.add_middleware(
    CORSMiddleware,
    # allow_credentials must be False when allow_origins is ['*'] per CORS spec
    allow_credentials=(allow_origins != ['*']),
    allow_origins=allow_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    expose_headers=["Content-Disposition"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database indexes setup
async def setup_indexes():
    """Create MongoDB indexes for optimal query performance"""
    try:
        # Users collection indexes
        await db.users.create_index("username", unique=True)
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id")

        # Portfolio collection indexes
        await db.portfolio.create_index("id")
        await db.portfolio.create_index("category")
        await db.portfolio.create_index("featured")
        await db.portfolio.create_index([("created_at", -1)])

        # Contacts collection indexes
        await db.contacts.create_index("id")
        await db.contacts.create_index("status")
        await db.contacts.create_index([("created_at", -1)])

        # Content collection indexes
        await db.content.create_index("section")

        # Settings collection index
        await db.settings.create_index("id")

        logger.info("MongoDB indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation warning (may already exist): {e}")

async def _keep_alive_loop():
    """
    Self-ping every 10 minutes to prevent Render free-tier from sleeping.
    Render spins down services after 15 min of inactivity; 10 min gives a 5-min safety buffer.
    """
    import asyncio
    import httpx

    INTERVAL = 10 * 60  # 10 minutes in seconds

    # Give the server a moment to fully start before the first ping
    await asyncio.sleep(30)

    while True:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get("http://localhost:8001/health")
                logger.info(f"[keep-alive] Self-ping OK — HTTP {resp.status_code}")
        except Exception as e:
            logger.warning(f"[keep-alive] Self-ping failed: {e}")
        await asyncio.sleep(INTERVAL)


@app.on_event("startup")
async def startup_event():
    """Run startup tasks"""
    import asyncio
    max_retries = 30
    retry_delay = 1

    for attempt in range(max_retries):
        try:
            # Initialize database connection
            await db.connect()
            logger.info(f"MongoDB connected successfully on attempt {attempt + 1}")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"MongoDB not ready (attempt {attempt + 1}/{max_retries}): {e}")
                await asyncio.sleep(retry_delay)
            else:
                logger.error("Failed to connect to MongoDB after all retries")
                raise

    # Setup indexes
    await setup_indexes()

    # Seed default data if database is empty
    await seed_default_data()

    # Start keep-alive background task (only meaningful on Render free tier)
    asyncio.create_task(_keep_alive_loop())
    logger.info("[keep-alive] Self-ping task started (every 10 min)")

    logger.info("Application startup complete")


async def seed_default_data():
    """Seed default admin user and settings if they don't exist"""
    try:
        # Check if admin user exists
        admin_user = await db.users.find_one({"username": "admin"})
        if not admin_user:
            import secrets
            from auth import auth_handler
            # Generate a secure random password for the initial admin account
            initial_password = os.environ.get("ADMIN_INITIAL_PASSWORD") or secrets.token_urlsafe(16)
            admin_doc = {
                "id": str(uuid.uuid4()),
                "username": "admin",
                "email": os.environ.get("ADMIN_EMAIL", "admin@example.com"),
                "password_hash": auth_handler.hash_password(initial_password),
                "role": "admin",
                "is_active": True,
                "must_change_password": True,
                "created_at": datetime.now(UTC),
                "updated_at": datetime.now(UTC)
            }
            await db.users.insert_one(admin_doc)
            # Write initial password to a file that should be read once and deleted
            password_file = ROOT_DIR / '.initial_admin_password'
            password_file.write_text(initial_password)
            masked_password = initial_password[:4] + '****' if len(initial_password) > 4 else '****'
            logger.warning("=== DEFAULT ADMIN CREATED ===")
            logger.warning(f"Username: admin | Password: {masked_password} (full password written to {password_file})")
            logger.warning("Read the password file, then DELETE it immediately!")
            logger.warning("Set ADMIN_INITIAL_PASSWORD env var to control the initial password.")

        # Check if settings exist
        settings_doc = await db.settings.find_one({})
        if not settings_doc:
            default_settings = {
                "id": str(uuid.uuid4()),
                "siteName": "Mantez Reels",
                "tagline": "Video Production & Editing",
                "description": "Professional video editing and production services",
                "contactEmail": "contact@example.com",
                "socialLinks": {
                    "instagram": "",
                    "youtube": "",
                    "twitter": "",
                    "linkedin": ""
                },
                "branding": {
                    "primaryColor": "#8B5CF6",
                    "accentColor": "#EC4899"
                },
                "advanced": {
                    "maintenanceMode": False,
                    "analyticsEnabled": True
                },
                "created_at": datetime.now(UTC),
                "updated_at": datetime.now(UTC)
            }
            await db.settings.insert_one(default_settings)
            logger.info("Default settings created")

    except Exception as e:
        logger.warning(f"Seed data warning: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.close()

# Health check endpoint for monitoring at root level (for direct access)
@app.get("/health")
async def root_health_check():
    """Health check endpoint for load balancers and monitoring"""
    try:
        # Check database connectivity
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now(UTC).isoformat()
        }


@app.get("/robots.txt", include_in_schema=False)
async def robots_txt(request: Request):
    """Serve robots.txt for search engines — URL derived from request"""
    from fastapi.responses import PlainTextResponse
    
    site_url = str(request.base_url).rstrip('/')
    content = f"""User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /api/

Sitemap: {site_url}/sitemap.xml
"""
    return PlainTextResponse(content=content)
