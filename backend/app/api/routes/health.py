import time
from datetime import datetime, timezone
from typing import Dict, Any

from fastapi import APIRouter, Response
from app.core.config import settings

router = APIRouter()

_STARTED_AT = time.time()

# In-memory cache for timestamp route
_TIMESTAMP_CACHE: Dict[str, Any] = {
    "iso": None,
    "unix": None,
    "cached_at": 0.0
}
TIMESTAMP_CACHE_TTL_SECONDS = 10.0


def _ai_configured() -> bool:
    if settings.AI_PROVIDER == "local":
        return True
    provider_keys = {
        "gemini": settings.GEMINI_API_KEY,
        "groq": settings.GROQ_API_KEY,
        "openrouter": settings.OPENROUTER_API_KEY,
    }
    return bool(provider_keys.get(settings.AI_PROVIDER))


@router.get("/health")
async def health_check():
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
            "uptime_seconds": round(time.time() - _STARTED_AT, 1),
            "ai_provider": settings.AI_PROVIDER,
            "ai_configured": _ai_configured(),
            "storage_mode": "browser_indexeddb_privacy_first"
        },
        "message": "Application is healthy and operational.",
        "error": None
    }


@router.get("/health/live")
async def liveness():
    """Kubernetes-style liveness probe: the process is up and serving."""
    return {"success": True, "data": {"status": "alive"}, "message": None, "error": None}


@router.get("/health/ready")
async def readiness():
    """Readiness probe: dependencies required to serve traffic are available."""
    checks = {"ai_provider": settings.AI_PROVIDER, "ai_configured": _ai_configured()}
    return {
        "success": True,
        "data": {"status": "ready", "checks": checks},
        "message": None,
        "error": None
    }


@router.get("/timestamp")
async def get_current_timestamp(response: Response):
    """
    Returns current UTC timestamp with 10-second server-side caching 
    and standard HTTP Cache-Control headers.
    """
    now = time.time()
    cache_age = now - _TIMESTAMP_CACHE["cached_at"]

    if _TIMESTAMP_CACHE["iso"] is None or cache_age >= TIMESTAMP_CACHE_TTL_SECONDS:
        now_dt = datetime.now(timezone.utc)
        _TIMESTAMP_CACHE["iso"] = now_dt.isoformat()
        _TIMESTAMP_CACHE["unix"] = now_dt.timestamp()
        _TIMESTAMP_CACHE["cached_at"] = now
        is_cache_hit = False
        remaining_ttl = int(TIMESTAMP_CACHE_TTL_SECONDS)
    else:
        is_cache_hit = True
        remaining_ttl = max(0, int(TIMESTAMP_CACHE_TTL_SECONDS - cache_age))

    # Add standard HTTP cache headers
    response.headers["Cache-Control"] = f"public, max-age={remaining_ttl}"
    response.headers["X-Cache"] = "HIT" if is_cache_hit else "MISS"

    return {
        "success": True,
        "data": {
            "timestamp": _TIMESTAMP_CACHE["iso"],
            "unix_timestamp": _TIMESTAMP_CACHE["unix"],
            "cached": is_cache_hit,
            "cache_ttl_seconds": TIMESTAMP_CACHE_TTL_SECONDS,
            "remaining_ttl_seconds": remaining_ttl
        },
        "message": "Timestamp retrieved successfully.",
        "error": None
    }
