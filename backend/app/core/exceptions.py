from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("ai_resume_builder")

class AppException(Exception):
    def __init__(self, message: str, code: str = "APP_ERROR", status_code: int = status.HTTP_400_BAD_REQUEST, details: any = None):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

class FileValidationError(AppException):
    def __init__(self, message: str, details: any = None):
        super().__init__(message=message, code="FILE_VALIDATION_ERROR", status_code=status.HTTP_400_BAD_REQUEST, details=details)

class AIProviderError(AppException):
    def __init__(self, message: str, details: any = None):
        super().__init__(message=message, code="AI_PROVIDER_ERROR", status_code=status.HTTP_502_BAD_GATEWAY, details=details)

def setup_exception_handlers(app):
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "data": None,
                "message": exc.message,
                "error": {
                    "code": exc.code,
                    "details": exc.details
                }
            }
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "data": None,
                "message": exc.detail if isinstance(exc.detail, str) else "HTTP Error occurred",
                "error": {
                    "code": f"HTTP_{exc.status_code}",
                    "details": exc.detail
                }
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled server exception: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "data": None,
                "message": "An unexpected internal server error occurred",
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "details": str(exc) if settings_is_debug() else None
                }
            }
        )

def settings_is_debug():
    from app.core.config import settings
    return settings.APP_ENV == "development"
