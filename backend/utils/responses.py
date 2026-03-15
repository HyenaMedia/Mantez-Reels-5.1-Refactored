"""Standardized response helpers."""
from fastapi.responses import JSONResponse


def success_response(data=None, message=None, **extra):
    """Return a standard success response."""
    body = {"success": True}
    if message:
        body["message"] = message
    if data is not None:
        if isinstance(data, dict):
            body.update(data)
        else:
            body["data"] = data
    body.update(extra)
    return body


def error_json(detail: str, status_code: int = 400):
    """Return a JSONResponse with error details."""
    return JSONResponse(status_code=status_code, content={"success": False, "detail": detail})
