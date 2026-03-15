import logging
import uuid
from datetime import UTC, datetime, timedelta
from xml.sax.saxutils import escape as xml_escape

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from auth import require_auth

from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/settings", tags=["settings"])

# Simple in-memory TTL cache for public settings (60 second TTL)
_settings_cache = {"data": None, "expires_at": None}

def _invalidate_settings_cache():
    _settings_cache["data"] = None
    _settings_cache["expires_at"] = None

# Database connection managed via database module

# Pydantic Models
class PerformanceSettings(BaseModel):
    cacheStaticAssets: int = Field(default=31536000, description="Cache duration for static assets in seconds")
    cacheMedia: int = Field(default=604800, description="Cache duration for media in seconds")
    cacheAPI: int = Field(default=0, description="Cache duration for API in seconds")
    gzipEnabled: bool = Field(default=True)
    gzipLevel: int = Field(default=6, ge=1, le=9)
    imageLazyLoad: bool = Field(default=True)
    codeSplitting: bool = Field(default=True)

class SEOSettings(BaseModel):
    siteTitle: str = Field(default="Mantez Reels")
    metaDescription: str = Field(default="Professional videographer portfolio")
    metaKeywords: str = Field(default="videographer, photography, video production")
    ogImage: str = Field(default="")
    ogDescription: str = Field(default="")
    googleAnalyticsId: str = Field(default="")
    metaPixelId: str = Field(default="", description="Meta (Facebook) Pixel ID for analytics")
    enableAnalytics: bool = Field(default=False, description="Enable PostHog analytics tracking")
    posthogApiKey: str = Field(default="", description="PostHog API key — set via admin panel")

class SocialSettings(BaseModel):
    instagram: str = Field(default="", description="Instagram profile URL")
    youtube: str = Field(default="", description="YouTube channel URL")
    vimeo: str = Field(default="", description="Vimeo profile URL")
    tiktok: str = Field(default="", description="TikTok profile URL")
    linkedin: str = Field(default="", description="LinkedIn profile URL")
    twitter: str = Field(default="", description="Twitter/X profile URL")
    facebook: str = Field(default="", description="Facebook page URL")

class SeoFiles(BaseModel):
    robotsTxt: str = Field(
        default="""User-agent: *
Allow: /
Disallow: /admin
Disallow: /login

# AI Crawlers — Allow for answer engine visibility
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: cohere-ai
Allow: /

# Sitemap
Sitemap: https://yourdomain.com/sitemap.xml""",
        description="robots.txt content served at /robots.txt"
    )
    llmsTxt: str = Field(
        default="""# Mantez Reels
> Professional videographer and photographer. Cinematic video production, reels, and creative photography.

Mantez Reels is a professional videography and photography portfolio. This site showcases creative work including video production, reels, commercial content, and photography.

## Services
- Video production and cinematography
- Short-form reels and social media content
- Commercial photography
- Event videography
- Post-production and editing

## Portfolio
View work and case studies at /projects

## Contact
For bookings and inquiries, use the contact form.

## Important Links
- [Portfolio](/projects)
- [Contact](/#contact)
- [Sitemap](/sitemap.xml)""",
        description="llms.txt content served at /llms.txt for AI platforms"
    )


class SiteSettings(BaseModel):
    siteName: str = Field(default="Mantez Reels")
    siteUrl: str = Field(default="", description="Full site URL for sitemap and canonical links (e.g. https://yourdomain.com)")
    logoUrl: str = Field(default="", description="Logo URL for navbar and footer")
    faviconUrl: str = Field(default="")
    primaryColor: str = Field(default="#9333ea")
    contactEmail: str = Field(default="hello@mantezreels.com")
    copyrightText: str = Field(default="© 2025 Mantez Reels. All rights reserved.")
    themeSwitcherEnabled: bool = Field(default=False, description="Enable light/dark theme toggle for visitors")

class AdvancedSettings(BaseModel):
    preconnectDomains: list[str] = Field(default_factory=lambda: [
        "https://images.unsplash.com",
        "https://fonts.googleapis.com",
        "https://assets.emergent.sh"
    ])
    customCSS: str = Field(default="")
    customJS: str = Field(default="")
    maintenanceMode: bool = Field(default=False)
    debugMode: bool = Field(default=False)

class MediaSettings(BaseModel):
    maxUploadSizeMB: int = Field(default=10, description="Max upload size in megabytes")
    allowedFileTypes: list[str] = Field(default_factory=lambda: [
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "video/mp4", "video/webm"
    ])
    imageQuality: int = Field(default=80, ge=1, le=100)
    autoOptimizeImages: bool = Field(default=True, description="Auto convert & compress images (WebP, compression)")
    autoOptimizeVideos: bool = Field(default=True, description="Auto optimize videos for web delivery")

class CookieBannerSettings(BaseModel):
    enabled: bool = Field(default=True, description="Show cookie consent banner")
    backgroundColor: str = Field(default="#111827", description="Banner background color")
    textColor: str = Field(default="#9ca3af", description="Banner text color")
    headingColor: str = Field(default="#ffffff", description="Banner heading color")
    acceptButtonColor: str = Field(default="#9333ea", description="Accept button background color")
    acceptButtonTextColor: str = Field(default="#ffffff", description="Accept button text color")
    rejectButtonColor: str = Field(default="#374151", description="Reject button background color")
    rejectButtonTextColor: str = Field(default="#ffffff", description="Reject button text color")
    manageButtonColor: str = Field(default="transparent", description="Manage cookies button background")
    manageButtonTextColor: str = Field(default="#d1d5db", description="Manage cookies button text color")
    manageButtonBorderColor: str = Field(default="#4b5563", description="Manage cookies button border color")
    toggleActiveColor: str = Field(default="#9333ea", description="Toggle switch active color")
    toggleInactiveColor: str = Field(default="#4b5563", description="Toggle switch inactive color")

class MarketingSettings(BaseModel):
    gtmEnabled: bool = Field(default=False, description="Enable Google Tag Manager")
    gtmContainerId: str = Field(default="", description="GTM Container ID (GTM-XXXXXXX)")
    ga4Enabled: bool = Field(default=False, description="Enable Google Analytics 4")
    ga4MeasurementId: str = Field(default="", description="GA4 Measurement ID (G-XXXXXXXXXX)")
    ga4EnhancedMeasurement: bool = Field(default=True, description="Enable GA4 enhanced measurement")
    fbPixelEnabled: bool = Field(default=False, description="Enable Facebook Pixel")
    fbPixelId: str = Field(default="", description="Facebook Pixel ID")
    linkedinEnabled: bool = Field(default=False, description="Enable LinkedIn Insight Tag")
    linkedinPartnerId: str = Field(default="", description="LinkedIn Partner ID")
    twitterPixelEnabled: bool = Field(default=False, description="Enable Twitter/X Pixel")
    twitterPixelId: str = Field(default="", description="Twitter Pixel ID")
    tiktokPixelEnabled: bool = Field(default=False, description="Enable TikTok Pixel")
    tiktokPixelId: str = Field(default="", description="TikTok Pixel ID")
    customHeadScripts: str = Field(default="", description="Custom scripts for <head>")
    customBodyStartScripts: str = Field(default="", description="Custom scripts after <body>")
    customFooterScripts: str = Field(default="", description="Custom scripts before </body>")
    jsonLdSchema: str = Field(default="", description="JSON-LD structured data for SEO")

class CloudflareSettings(BaseModel):
    enabled: bool = Field(default=False, description="Enable Cloudflare WAF integration")
    apiToken: str = Field(default="", description="Cloudflare API token")
    zoneId: str = Field(default="", description="Cloudflare Zone ID")


class R2Config(BaseModel):
    accountId: str = Field(default="", description="Cloudflare Account ID")
    accessKeyId: str = Field(default="", description="R2 API Token Access Key ID")
    secretAccessKey: str = Field(default="", description="R2 API Token Secret Access Key")
    bucket: str = Field(default="", description="R2 bucket name")
    publicDomain: str = Field(default="", description="Public domain e.g. https://pub-xxx.r2.dev or https://files.yourdomain.com")


class CloudStorageSettings(BaseModel):
    enabled: bool = Field(default=False, description="Enable Cloudflare R2 cloud storage")
    defaultStorage: str = Field(default="local", description="Default storage for new uploads: 'local', 'r2', or 'both'")
    r2: R2Config = Field(default_factory=R2Config)

class Settings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    performance: PerformanceSettings = Field(default_factory=PerformanceSettings)
    seo: SEOSettings = Field(default_factory=SEOSettings)
    site: SiteSettings = Field(default_factory=SiteSettings)
    social: SocialSettings = Field(default_factory=SocialSettings)
    seoFiles: SeoFiles = Field(default_factory=SeoFiles)
    advanced: AdvancedSettings = Field(default_factory=AdvancedSettings)
    media: MediaSettings = Field(default_factory=MediaSettings)
    cookieBanner: CookieBannerSettings = Field(default_factory=CookieBannerSettings)
    marketing: MarketingSettings = Field(default_factory=MarketingSettings)
    cloudflare: CloudflareSettings = Field(default_factory=CloudflareSettings)
    cloudStorage: CloudStorageSettings = Field(default_factory=CloudStorageSettings)
    themeSwitcherEnabled: bool = Field(default=False, description="Enable light/dark theme toggle (site-wide)")
    languageSelectorEnabled: bool = Field(default=False, description="Enable language selector dropdown (site-wide)")
    updatedAt: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())

class SettingsUpdate(BaseModel):
    performance: PerformanceSettings | None = None
    seo: SEOSettings | None = None
    site: SiteSettings | None = None
    social: SocialSettings | None = None
    seoFiles: SeoFiles | None = None
    advanced: AdvancedSettings | None = None
    media: MediaSettings | None = None
    cookieBanner: CookieBannerSettings | None = None
    marketing: MarketingSettings | None = None
    cloudflare: CloudflareSettings | None = None
    cloudStorage: CloudStorageSettings | None = None
    themeSwitcherEnabled: bool | None = None
    languageSelectorEnabled: bool | None = None


@router.get("/", response_model=Settings)
async def get_settings():
    """Get settings (public - returns only safe fields for frontend)"""
    # Serve from cache if still valid
    now = datetime.now(UTC)
    if _settings_cache["data"] and _settings_cache["expires_at"] and now < _settings_cache["expires_at"]:
        return _settings_cache["data"]

    settings = await db.settings.find_one({}, {"_id": 0})

    if not settings:
        default_settings = Settings()
        settings_dict = default_settings.model_dump()
        await db.settings.insert_one(settings_dict)
        result = default_settings
    else:
        full_settings = Settings(**settings)

        # Sanitize sensitive fields for public access
        if full_settings.seo:
            full_settings.seo.googleAnalyticsId = ""
            full_settings.seo.metaPixelId = ""
            full_settings.seo.posthogApiKey = ""
        if full_settings.advanced:
            full_settings.advanced.customJS = ""
            full_settings.advanced.debugMode = False
        if full_settings.cloudStorage:
            full_settings.cloudStorage.r2.accessKeyId = ""
            full_settings.cloudStorage.r2.secretAccessKey = ""

        result = full_settings

    # Cache for 60 seconds
    _settings_cache["data"] = result
    _settings_cache["expires_at"] = now + timedelta(seconds=60)

    return result


@router.put("/", response_model=Settings)
async def update_settings(
    settings_update: SettingsUpdate,
    current_user: dict = Depends(require_auth)
):
    """Update settings (admin only)"""
    # Get existing settings
    existing = await db.settings.find_one({}, {"_id": 0})

    if not existing:
        # Create default if none exist
        existing = Settings().model_dump()

    # Update only provided fields
    update_data = settings_update.model_dump(exclude_unset=True)

    # Merge updates with existing settings
    for category, values in update_data.items():
        if values is not None:
            if isinstance(values, dict) and category in existing and isinstance(existing[category], dict):
                existing[category].update(values)
            else:
                existing[category] = values

    # Update timestamp
    existing['updatedAt'] = datetime.now(UTC).isoformat()
    existing['_type'] = 'site_settings'

    # Save to database — use atomic replace_one to avoid race condition
    await db.settings.replace_one({"_type": "site_settings"}, existing, upsert=True)
    _invalidate_settings_cache()

    return Settings(**existing)


@router.post("/reset")
async def reset_settings(current_user: dict = Depends(require_auth)):
    """Reset all settings to defaults (admin only)"""
    default_settings = Settings()
    settings_dict = default_settings.model_dump()

    settings_dict['_type'] = 'site_settings'
    # Atomic replace to avoid race condition
    await db.settings.replace_one({"_type": "site_settings"}, settings_dict, upsert=True)
    _invalidate_settings_cache()

    return {"message": "Settings reset to defaults", "settings": default_settings}


@router.get("/admin", response_model=Settings)
async def get_settings_admin(current_user: dict = Depends(require_auth)):
    """Get full settings including sensitive fields (admin only)"""
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        default_settings = Settings()
        settings_dict = default_settings.model_dump()
        await db.settings.insert_one(settings_dict)
        return default_settings
    return Settings(**settings)


@router.post("/test-storage")
async def test_storage_connection(current_user: dict = Depends(require_auth)):
    """Test Cloudflare R2 connection with current saved settings"""
    import boto3
    from botocore.exceptions import ClientError as BotoClientError

    settings_doc = await db.settings.find_one({}, {"_id": 0})
    cloud_settings = (settings_doc or {}).get("cloudStorage", {})

    if not cloud_settings.get("enabled", False):
        return {"success": False, "message": "Cloud storage is not enabled in settings"}

    r2 = cloud_settings.get("r2", {})
    account_id = r2.get("accountId", "")
    access_key = r2.get("accessKeyId", "")
    secret_key = r2.get("secretAccessKey", "")
    bucket = r2.get("bucket", "")

    if not all([account_id, access_key, secret_key, bucket]):
        return {"success": False, "message": "Missing R2 configuration — fill in all fields and save first"}

    try:
        client = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name='auto',
            endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com"
        )
        client.head_bucket(Bucket=bucket)
        return {"success": True, "message": f"Successfully connected to R2 bucket '{bucket}'"}
    except BotoClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        if error_code in ('403', 'Forbidden'):
            return {"success": False, "message": "Access denied — check your Access Key ID and Secret Access Key"}
        if error_code in ('404', 'NoSuchBucket'):
            return {"success": False, "message": f"Bucket '{bucket}' not found — check the bucket name"}
        return {"success": False, "message": f"Connection failed: {error_code}"}
    except Exception as e:
        logger.error(f"R2 connection test failed: {e}")
        return {"success": False, "message": "Connection failed"}


@router.post("/generate-sitemap")
async def generate_sitemap(current_user: dict = Depends(require_auth)):
    """Generate a dynamic sitemap.xml based on live content"""
    from fastapi.responses import JSONResponse

    settings = await db.settings.find_one({}, {"_id": 0})
    site_url = (settings or {}).get("site", {}).get("siteUrl", "https://yourdomain.com").rstrip("/")

    now = datetime.now(UTC).strftime("%Y-%m-%d")

    # Fetch published portfolio items
    portfolio_items = await db.portfolio.find(
        {"published": True}, {"_id": 0, "slug": 1, "updatedAt": 1, "createdAt": 1}
    ).to_list(length=500)

    urls = [
        {"loc": f"{site_url}/", "lastmod": now, "changefreq": "weekly", "priority": "1.0"},
        {"loc": f"{site_url}/projects", "lastmod": now, "changefreq": "weekly", "priority": "0.9"},
        {"loc": f"{site_url}/privacy", "lastmod": now, "changefreq": "yearly", "priority": "0.3"},
        {"loc": f"{site_url}/#services", "lastmod": now, "changefreq": "monthly", "priority": "0.8"},
        {"loc": f"{site_url}/#about", "lastmod": now, "changefreq": "monthly", "priority": "0.8"},
        {"loc": f"{site_url}/#contact", "lastmod": now, "changefreq": "monthly", "priority": "0.8"},
    ]

    for item in portfolio_items:
        slug = item.get("slug")
        if slug:
            item_date = item.get("updatedAt") or item.get("createdAt") or now
            if hasattr(item_date, "strftime"):
                item_date = item_date.strftime("%Y-%m-%d")
            elif isinstance(item_date, str) and "T" in item_date:
                item_date = item_date[:10]
            urls.append({
                "loc": f"{site_url}/projects/{slug}",
                "lastmod": item_date,
                "changefreq": "monthly",
                "priority": "0.7",
            })

    url_entries = "\n".join(
        f"""  <url>
    <loc>{xml_escape(u['loc'])}</loc>
    <lastmod>{xml_escape(str(u['lastmod']))}</lastmod>
    <changefreq>{xml_escape(u['changefreq'])}</changefreq>
    <priority>{xml_escape(str(u['priority']))}</priority>
  </url>"""
        for u in urls
    )

    sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{url_entries}
</urlset>"""

    return {
        "success": True,
        "sitemap": sitemap_xml,
        "url_count": len(urls),
        "generated_at": datetime.now(UTC).isoformat(),
    }


@router.get("/robots.txt")
async def get_robots_txt():
    """Serve robots.txt dynamically from settings"""
    from fastapi.responses import PlainTextResponse
    settings = await db.settings.find_one({}, {"_id": 0})
    seo_files = SeoFiles(**(((settings or {}).get("seoFiles")) or {}))
    return PlainTextResponse(content=seo_files.robotsTxt, headers={"Cache-Control": "public, max-age=3600"})


@router.get("/llms.txt")
async def get_llms_txt():
    """Serve llms.txt dynamically from settings (AI platform discoverability)"""
    from fastapi.responses import PlainTextResponse
    settings = await db.settings.find_one({}, {"_id": 0})
    seo_files = SeoFiles(**(((settings or {}).get("seoFiles")) or {}))
    return PlainTextResponse(content=seo_files.llmsTxt, headers={"Cache-Control": "public, max-age=3600"})


@router.get("/sitemap.xml")
async def get_sitemap_xml():
    """Serve dynamic sitemap.xml (public, no auth)"""
    from fastapi.responses import Response
    settings = await db.settings.find_one({}, {"_id": 0})
    site_url = (settings or {}).get("site", {}).get("siteUrl", "").rstrip("/")
    if not site_url:
        site_url = "https://yourdomain.com"

    now = datetime.now(UTC).strftime("%Y-%m-%d")
    portfolio_items = await db.portfolio.find(
        {"published": True}, {"_id": 0, "slug": 1, "updatedAt": 1, "createdAt": 1}
    ).to_list(length=500)

    urls = [
        {"loc": f"{site_url}/", "lastmod": now, "changefreq": "weekly", "priority": "1.0"},
        {"loc": f"{site_url}/projects", "lastmod": now, "changefreq": "weekly", "priority": "0.9"},
        {"loc": f"{site_url}/privacy", "lastmod": now, "changefreq": "yearly", "priority": "0.3"},
        {"loc": f"{site_url}/#services", "lastmod": now, "changefreq": "monthly", "priority": "0.8"},
        {"loc": f"{site_url}/#about", "lastmod": now, "changefreq": "monthly", "priority": "0.8"},
        {"loc": f"{site_url}/#contact", "lastmod": now, "changefreq": "monthly", "priority": "0.8"},
    ]
    for item in portfolio_items:
        slug = item.get("slug")
        if slug:
            item_date = item.get("updatedAt") or item.get("createdAt") or now
            if isinstance(item_date, str) and "T" in item_date:
                item_date = item_date[:10]
            urls.append({"loc": f"{site_url}/projects/{slug}", "lastmod": item_date, "changefreq": "monthly", "priority": "0.7"})

    url_entries = "\n".join(
        f"""  <url>\n    <loc>{xml_escape(u['loc'])}</loc>\n    <lastmod>{xml_escape(str(u['lastmod']))}</lastmod>\n    <changefreq>{xml_escape(u['changefreq'])}</changefreq>\n    <priority>{xml_escape(str(u['priority']))}</priority>\n  </url>"""
        for u in urls
    )
    sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{url_entries}\n</urlset>"""
    return Response(content=sitemap_xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=3600"})

@router.post("/flush-cache")
async def flush_cache(current_user: dict = Depends(require_auth)):
    """Flush all caches (admin only)"""
    try:
        # Update a timestamp to invalidate browser caches
        settings = await db.settings.find_one({})
        if settings:
            settings['cacheFlushTimestamp'] = datetime.now(UTC).isoformat()
            await db.settings.update_one(
                {'id': settings.get('id')},
                {'$set': {'cacheFlushTimestamp': settings['cacheFlushTimestamp']}}
            )

        return {
            "success": True,
            "message": "Cache flushed successfully. Browser caches will be invalidated on next request.",
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Cache flush failed: {e}")
        return {
            "success": False,
            "message": "Cache flush completed with warnings",
            "timestamp": datetime.now(UTC).isoformat()
        }
