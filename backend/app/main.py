from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import setup_exception_handlers
from app.api.routes import health, resume, ai, jobs, ats

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Privacy-First, Database-Free AI Resume Builder API with ATS analysis and document parsing.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handling
setup_exception_handlers(app)

# Include routers under /api/v1
app.include_router(health.router, prefix=settings.API_V1_PREFIX, tags=["Health"])
app.include_router(resume.router, prefix=f"{settings.API_V1_PREFIX}/resume", tags=["Resume"])
app.include_router(ai.router, prefix=f"{settings.API_V1_PREFIX}/ai", tags=["AI"])
app.include_router(jobs.router, prefix=f"{settings.API_V1_PREFIX}/jobs", tags=["Jobs"])
app.include_router(ats.router, prefix=f"{settings.API_V1_PREFIX}/ats", tags=["ATS"])

@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "documentation": "/docs"
    }
