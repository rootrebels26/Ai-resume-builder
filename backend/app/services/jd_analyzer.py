from app.schemas.job_schema import JobAnalyzeRequest, JobAnalyzeResponse
from app.services.ai_service import ai_service

async def analyze_job_description(request: JobAnalyzeRequest) -> JobAnalyzeResponse:
    return await ai_service.analyze_job(request)
