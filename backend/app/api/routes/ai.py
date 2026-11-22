from fastapi import APIRouter
from app.services.ai_service import ai_service
from app.schemas.ai_schema import (
    GenerateSummaryRequest, ImproveBulletRequest,
    ImproveProjectRequest, ReviewResumeRequest
)

router = APIRouter()

@router.post("/generate-summary")
async def generate_summary(request: GenerateSummaryRequest):
    result = await ai_service.generate_summary(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Professional summary generated successfully.",
        "error": None
    }

@router.post("/improve-bullet")
async def improve_bullet(request: ImproveBulletRequest):
    result = await ai_service.improve_bullet(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Experience bullet point enhanced successfully.",
        "error": None
    }

@router.post("/improve-project")
async def improve_project(request: ImproveProjectRequest):
    result = await ai_service.improve_project(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Project description enhanced successfully.",
        "error": None
    }

@router.post("/review-resume")
async def review_resume(request: ReviewResumeRequest):
    result = await ai_service.review_resume(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Resume review completed successfully.",
        "error": None
    }
