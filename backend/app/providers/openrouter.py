import json
import logging
import httpx
from app.providers.base import BaseAIProvider
from app.providers.local_heuristic import LocalHeuristicProvider
from app.core.config import settings
from app.schemas.ai_schema import (
    GenerateSummaryRequest, GenerateSummaryResponse,
    ImproveBulletRequest, ImproveBulletResponse,
    ImproveProjectRequest, ImproveProjectResponse,
    ReviewResumeRequest, ReviewResumeResponse
)
from app.schemas.job_schema import (
    JobAnalyzeRequest, JobAnalyzeResponse,
    MatchResumeRequest, MatchResumeResponse,
    ATSAnalyzeRequest, ATSAnalyzeResponse,
    TailorResumeRequest, TailorResumeResponse
)

logger = logging.getLogger("openrouter_provider")

class OpenRouterProvider(BaseAIProvider):
    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.OPENROUTER_API_KEY
        self.model_name = model_name or settings.AI_MODEL or "meta-llama/llama-3.3-70b-instruct"
        self.fallback = LocalHeuristicProvider()

    async def _call_openrouter(self, prompt: str):
        if not self.api_key:
            return None
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://ai-resume-builder.local",
                        "X-Title": "AI Resume Builder"
                    },
                    json={
                        "model": self.model_name,
                        "messages": [
                            {"role": "system", "content": "You are an expert career counselor. Return only valid JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.3
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    if content.startswith("```json"):
                        content = content[7:]
                    if content.startswith("```"):
                        content = content[3:]
                    if content.endswith("```"):
                        content = content[:-3]
                    return json.loads(content.strip())
                return None
        except Exception as e:
            logger.warning("OpenRouter API request failed: %s", e)
            return None

    async def generate_summary(self, request: GenerateSummaryRequest) -> GenerateSummaryResponse:
        prompt = f"""Generate 3 professional summaries for {request.role}. Return JSON: {{"summaries": [...], "selected_summary": "...", "suggested_headline": "..."}}"""
        res = await self._call_openrouter(prompt)
        if res and "summaries" in res:
            try:
                return GenerateSummaryResponse(**res)
            except Exception:
                pass
        return await self.fallback.generate_summary(request)

    async def improve_bullet(self, request: ImproveBulletRequest) -> ImproveBulletResponse:
        return await self.fallback.improve_bullet(request)

    async def improve_project(self, request: ImproveProjectRequest) -> ImproveProjectResponse:
        return await self.fallback.improve_project(request)

    async def review_resume(self, request: ReviewResumeRequest) -> ReviewResumeResponse:
        return await self.fallback.review_resume(request)

    async def analyze_job(self, request: JobAnalyzeRequest) -> JobAnalyzeResponse:
        return await self.fallback.analyze_job(request)

    async def match_resume(self, request: MatchResumeRequest) -> MatchResumeResponse:
        return await self.fallback.match_resume(request)

    async def tailor_resume(self, request: TailorResumeRequest) -> TailorResumeResponse:
        return await self.fallback.tailor_resume(request)
