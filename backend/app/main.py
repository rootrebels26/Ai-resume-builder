import logging
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
from app.api.routes import health, resume, ai, jobs, ats

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


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Privacy-First, Database-Free AI Resume Builder API with ATS analysis and document parsing.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Middleware is applied outermost-last; the order below yields the runtime
# execution order: RequestContext -> CORS -> SecurityHeaders -> RateLimit -> GZip.
app.add_middleware(GZipMiddleware, minimum_size=settings.GZIP_MINIMUM_SIZE)
app.add_middleware(
    RateLimitMiddleware,
    max_requests=settings.RATE_LIMIT_PER_MINUTE,
    window_seconds=60,
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)
app.add_middleware(RequestContextMiddleware)

# Custom exception handling
setup_exception_handlers(app)

# Include routers under /api/v1
app.include_router(health.router, prefix=settings.API_V1_PREFIX, tags=["Health"])
app.include_router(resume.router, prefix=f"{settings.API_V1_PREFIX}/resume", tags=["Resume"])
app.include_router(ai.router, prefix=f"{settings.API_V1_PREFIX}/ai", tags=["AI"])
app.include_router(jobs.router, prefix=f"{settings.API_V1_PREFIX}/jobs", tags=["Jobs"])
app.include_router(ats.router, prefix=f"{settings.API_V1_PREFIX}/ats", tags=["ATS"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "documentation": "/docs"
    }
