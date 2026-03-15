import logging
import os
import re

import httpx
from fastapi import APIRouter, Request, Response

logger = logging.getLogger(__name__)
router = APIRouter()

POSTHOG_HOST = "https://app.posthog.com"

# Only allow specific PostHog API paths to prevent SSRF
ALLOWED_PATH_PATTERN = re.compile(r'^(e|decide|engage|capture|batch|static|array)(/.*)?$')

@router.api_route("/proxy/stats/{path:path}", methods=["GET", "POST", "OPTIONS"])
async def proxy_analytics(request: Request, path: str):
    """
    Proxy analytics requests through backend to bypass ad blockers.
    
    Uses a neutral endpoint name (/proxy/stats) to avoid triggering blockers.
    This endpoint forwards all analytics requests to PostHog while making them
    appear to come from your own domain.
    """
    try:
        # Validate path to prevent SSRF — only allow known PostHog endpoints
        if not ALLOWED_PATH_PATTERN.match(path):
            return Response(
                content='{"error": "Path not allowed"}',
                status_code=403,
                headers={"Content-Type": "application/json"}
            )

        # Build target URL
        target_url = f"{POSTHOG_HOST}/{path}"

        # Get request body if POST
        body = None
        if request.method == "POST":
            body = await request.body()

        # Only forward safe headers — do NOT forward auth/cookie headers
        SAFE_FORWARD_HEADERS = {"content-type", "accept", "user-agent", "origin", "referer"}
        headers = {}
        for key, value in request.headers.items():
            if key.lower() in SAFE_FORWARD_HEADERS:
                headers[key] = value

        # Forward request to PostHog
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=dict(request.query_params)
            )

        # Prepare response headers (exclude some headers)
        response_headers = {}
        excluded_headers = ["content-encoding", "content-length", "transfer-encoding", "connection"]
        for key, value in response.headers.items():
            if key.lower() not in excluded_headers:
                response_headers[key] = value

        # Add CORS headers
        cors_origin = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
        response_headers["Access-Control-Allow-Origin"] = cors_origin
        response_headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response_headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"

        # Return response
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers
        )

    except Exception as e:
        logger.error(f"Proxy request failed: {str(e)}")
        return Response(
            content='{"error": "Proxy request failed"}',
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

# Keep old endpoint for backward compatibility
@router.api_route("/analytics-proxy/{path:path}", methods=["GET", "POST", "OPTIONS"])
async def legacy_proxy_analytics(request: Request, path: str):
    """Legacy endpoint - redirects to new neutral endpoint"""
    return await proxy_analytics(request, path)
