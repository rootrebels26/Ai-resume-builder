from fastapi import APIRouter
from app.services.jd_analyzer import analyze_job_description
from app.services.ai_service import ai_service
from app.schemas.job_schema import JobAnalyzeRequest, MatchResumeRequest

router = APIRouter()

@router.post("/analyze")
async def analyze_job(request: JobAnalyzeRequest):
    result = await analyze_job_description(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Job description analyzed successfully.",
        "error": None
    }

@router.post("/match-resume")
async def match_resume(request: MatchResumeRequest):
    result = await ai_service.match_resume(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Resume and job description comparison completed successfully.",
        "error": None
    }
