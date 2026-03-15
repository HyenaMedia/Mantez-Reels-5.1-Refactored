"""
Security Routes
Handles security-related endpoints including Cloudflare WAF integration
"""

import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from auth import require_auth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/security", tags=["security"])

@router.get("/stats")
async def get_security_stats(current_user: dict = Depends(require_auth)):
    """Get security statistics"""
    # Placeholder for future implementation
    return {
        "totalScans": 0,
        "threatsBlocked": 0,
        "lastScanTime": None
    }

@router.get("/cloudflare/status")
async def get_cloudflare_waf_status(
    apiToken: str = Query(..., description="Cloudflare API Token"),
    zoneId: str = Query(..., description="Cloudflare Zone ID"),
    current_user: dict = Depends(require_auth)
):
    """
    Fetch Cloudflare WAF status
    
    This endpoint acts as a proxy to Cloudflare API to avoid exposing API tokens on frontend
    """
    try:
        headers = {
            "Authorization": f"Bearer {apiToken}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            # Get zone settings
            zone_response = await client.get(
                f"https://api.cloudflare.com/client/v4/zones/{zoneId}",
                headers=headers
            )

            if zone_response.status_code != 200:
                logger.error(f"Cloudflare API error: {zone_response.status_code}")
                raise HTTPException(
                    status_code=zone_response.status_code,
                    detail="Failed to fetch zone information from Cloudflare"
                )

            zone_data = zone_response.json()

            if not zone_data.get("success"):
                errors = zone_data.get("errors", [])
                error_msg = errors[0].get("message", "Unknown error") if errors else "Unknown error"
                raise HTTPException(status_code=400, detail=f"Cloudflare API error: {error_msg}")

            zone_info = zone_data.get("result", {})

            # Get zone settings for security
            settings_response = await client.get(
                f"https://api.cloudflare.com/client/v4/zones/{zoneId}/settings",
                headers=headers
            )

            settings_data = {}
            if settings_response.status_code == 200:
                settings_json = settings_response.json()
                if settings_json.get("success"):
                    # Extract relevant settings
                    settings_list = settings_json.get("result", [])
                    for setting in settings_list:
                        setting_id = setting.get("id")
                        if setting_id in ["security_level", "challenge_ttl", "browser_check", "waf"]:
                            settings_data[setting_id] = setting.get("value")

            return {
                "success": True,
                "zone_name": zone_info.get("name"),
                "paused": zone_info.get("paused", False),
                "status": zone_info.get("status"),
                "name_servers": zone_info.get("name_servers", []),
                "settings": settings_data
            }

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Cloudflare API request timed out")
    except httpx.RequestError as e:
        logger.error(f"Cloudflare API request error: {e}")
        raise HTTPException(status_code=502, detail="Failed to connect to Cloudflare API")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in Cloudflare WAF status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
