from fastapi import APIRouter
from app.services.ai_service import ai_service
from app.schemas.job_schema import JobAnalyzeRequest, MatchResumeRequest, TailorResumeRequest

router = APIRouter()

@router.post("/analyze")
async def analyze_job(request: JobAnalyzeRequest):
    result = await ai_service.analyze_job(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Job description analyzed successfully.",
        "error": None
    }

@router.post("/match")
async def match_resume(request: MatchResumeRequest):
    result = await ai_service.match_resume(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Resume matched with job description successfully.",
        "error": None
    }

@router.post("/tailor")
async def tailor_resume(request: TailorResumeRequest):
    result = await ai_service.tailor_resume(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Resume tailored suggestions generated successfully.",
        "error": None
    }
