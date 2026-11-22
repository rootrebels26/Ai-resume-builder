from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    ai_configured = bool(
        (settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY) or
        (settings.AI_PROVIDER == "groq" and settings.GROQ_API_KEY) or
        (settings.AI_PROVIDER == "openrouter" and settings.OPENROUTER_API_KEY) or
        (settings.AI_PROVIDER == "local")
    )
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
            "ai_provider": settings.AI_PROVIDER,
            "ai_configured": ai_configured,
            "storage_mode": "browser_indexeddb_privacy_first"
        },
        "message": "Application is healthy and operational.",
        "error": None
    }
