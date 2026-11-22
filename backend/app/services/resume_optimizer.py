from app.schemas.job_schema import TailorResumeRequest, TailorResumeResponse
from app.services.ai_service import ai_service

async def tailor_resume_to_job(request: TailorResumeRequest) -> TailorResumeResponse:
    return await ai_service.tailor_resume(request)
