"""Route handler decorators."""
import functools
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)


def handle_exceptions(operation: str):
    """Decorator that wraps an async route handler with standard error handling.

    Usage:
        @router.get("/items")
        @handle_exceptions("fetch items")
        async def get_items():
            ...
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Failed to {operation}: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to {operation}")
        return wrapper
    return decorator
