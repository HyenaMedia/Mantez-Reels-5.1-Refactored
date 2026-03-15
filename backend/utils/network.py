import os

from fastapi import Request

# Number of trusted proxies between the internet and this server.
# Render/Heroku = 1, AWS ALB + CloudFront = 2, etc.
# Set via TRUSTED_PROXY_COUNT env var. Default 1 for Render.
TRUSTED_PROXY_COUNT = int(os.environ.get("TRUSTED_PROXY_COUNT", "1"))

def get_real_ipaddr(request: Request) -> str:
    """
    Get the real client IP address, accounting for proxies and load balancers.

    Uses the rightmost untrusted IP from X-Forwarded-For.  The rightmost N IPs
    are added by trusted proxies (where N = TRUSTED_PROXY_COUNT), so we take
    the one just before them.  This is more spoof-resistant than reading the
    leftmost IP (which is entirely client-controlled).
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        ips = [ip.strip() for ip in forwarded.split(",") if ip.strip()]
        # Pick the IP just before the trusted proxies
        idx = max(0, len(ips) - TRUSTED_PROXY_COUNT)
        client_ip = ips[idx] if idx < len(ips) else ips[0]
    else:
        # Fallback to direct connection IP (for local development)
        client_ip = request.client.host if request.client else "unknown"

    return client_ip
