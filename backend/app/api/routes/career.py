from fastapi import APIRouter, HTTPException
from app.schemas.career_schema import (
    CareerAnalysisRequest,
    CareerAnalysisResponse,
    RoleDetailsRequest,
    RoleDetailsResponse,
)
from app.services.career_service import analyze_resume_for_career, generate_role_details
from app.services.job_provider_adapter import NoKeyExternalSearchProvider

router = APIRouter()
_job_provider = NoKeyExternalSearchProvider()


@router.get("/health")
async def career_health():
    return {
        "success": True,
        "status": "operational",
        "provider_status": _job_provider.get_provider_status(),
    }


@router.post("/analyze-resume")
async def analyze_resume(request: CareerAnalysisRequest):
    try:
        result: CareerAnalysisResponse = await analyze_resume_for_career(
            resume_data=request.resume_data,
            preferences=request.preferences,
            weights=request.weights,
        )
        return {
            "success": True,
            "data": result.model_dump(),
            "message": "Career profile and job recommendations generated successfully.",
            "error": None,
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Career analysis failed: {str(exc)}")


@router.post("/recommendations")
async def get_recommendations(request: CareerAnalysisRequest):
    try:
        result: CareerAnalysisResponse = await analyze_resume_for_career(
            resume_data=request.resume_data,
            preferences=request.preferences,
            weights=request.weights,
        )
        return {
            "success": True,
            "data": result.model_dump(),
            "message": "Job recommendations refreshed successfully.",
            "error": None,
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(exc)}")


@router.post("/role-details")
async def role_details(request: RoleDetailsRequest):
    try:
        result: RoleDetailsResponse = await generate_role_details(request)
        return {
            "success": True,
            "data": result.model_dump(),
            "message": "Role details generated successfully.",
            "error": None,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate role details: {str(exc)}")
