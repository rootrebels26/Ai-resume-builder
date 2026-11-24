import logging
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.exceptions import setup_exception_handlers
from app.core.middleware import (
    RequestContextMiddleware,
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
)
from app.api.routes import health, resume, ai, ats, auth, jobs

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("ai_resume_builder")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Starting %s v%s (env=%s, ai_provider=%s)",
        settings.APP_NAME, settings.APP_VERSION, settings.APP_ENV, settings.AI_PROVIDER,
    )
    if settings.is_production and settings.allow_wildcard_origin:
        logger.warning(
            "ALLOWED_ORIGINS contains '*' in production. Restrict it to your "
            "frontend origin(s) before going live."
        )
    yield
    logger.info("Shutting down %s", settings.APP_NAME)


class NormalizePathASGIMiddleware:
    """Collapses consecutive duplicate slashes (e.g. //api/v1 -> /api/v1) before routing or CORS."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket") and "//" in scope.get("path", ""):
            scope["path"] = re.sub(r"/+", "/", scope["path"])
        await self.app(scope, receive, send)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Privacy-First, Database-Free AI Resume Builder API with ATS analysis and document parsing.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Middleware is applied outermost-last; the order below yields the runtime
# execution order: NormalizePath -> RequestContext -> CORS -> SecurityHeaders -> RateLimit -> GZip.
app.add_middleware(GZipMiddleware, minimum_size=settings.GZIP_MINIMUM_SIZE)
app.add_middleware(
    RateLimitMiddleware,
    max_requests=settings.RATE_LIMIT_PER_MINUTE,
    window_seconds=60,
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_origin_regex=r"^https?:\/\/(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|.*\.vercel\.app|.*\.nityacloudtech\.com)$",
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(NormalizePathASGIMiddleware)

# Custom exception handling
setup_exception_handlers(app)

# Include health routes at root level for cloud runtime booters / health checkers (/health, /health/live, /health/ready)
app.include_router(health.router, tags=["Health"])

# Include routers under /api/v1
app.include_router(health.router, prefix=settings.API_V1_PREFIX, tags=["Health"])
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Auth"])
app.include_router(resume.router, prefix=f"{settings.API_V1_PREFIX}/resume", tags=["Resume"])
app.include_router(ai.router, prefix=f"{settings.API_V1_PREFIX}/ai", tags=["AI"])
app.include_router(ats.router, prefix=f"{settings.API_V1_PREFIX}/ats", tags=["ATS"])
app.include_router(jobs.router, prefix=f"{settings.API_V1_PREFIX}/jobs", tags=["Jobs"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "documentation": "/docs"
    }
