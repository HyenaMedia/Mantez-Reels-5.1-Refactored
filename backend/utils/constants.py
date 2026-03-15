"""Shared constants and defaults."""
from datetime import UTC, datetime

# Cache TTLs (seconds)
CACHE_SHORT = 60        # 1 minute
CACHE_MEDIUM = 300      # 5 minutes
CACHE_LONG = 3600       # 1 hour
CACHE_DAY = 86400       # 24 hours

# Pagination defaults
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Date helper
def utcnow():
    """Return timezone-aware UTC datetime."""
    return datetime.now(UTC)
