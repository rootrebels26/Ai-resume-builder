import time

from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

_STARTED_AT = time.time()


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
