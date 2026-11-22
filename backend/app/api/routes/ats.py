from fastapi import APIRouter
from app.services.ats_service import analyze_ats_compatibility
from app.schemas.job_schema import ATSAnalyzeRequest

router = APIRouter()

@router.post("/analyze")
async def analyze_ats(request: ATSAnalyzeRequest):
    result = await analyze_ats_compatibility(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "ATS compatibility analysis completed successfully.",
        "error": None
    }
