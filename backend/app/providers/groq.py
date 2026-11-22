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

logger = logging.getLogger("groq_provider")

class GroqProvider(BaseAIProvider):
    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model_name = model_name or settings.AI_MODEL or "llama-3.3-70b-versatile"
        self.fallback = LocalHeuristicProvider()

    async def _call_groq(self, prompt: str):
        if not self.api_key:
            return None
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model_name,
                        "messages": [
                            {"role": "system", "content": "You are a professional resume career counselor. You must output only valid raw JSON without markdown."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.3,
                        "response_format": {"type": "json_object"}
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    logger.warning("Groq API returned %s: %s", res.status_code, res.text)
                    return None
        except Exception as e:
            logger.warning("Groq API request error: %s", e)
            return None

    async def generate_summary(self, request: GenerateSummaryRequest) -> GenerateSummaryResponse:
        prompt = f"""Generate 3 professional summaries and a suggested headline for a {request.role} with skills: {', '.join(request.key_skills)}.
Return JSON matching:
{{"summaries": ["..."], "selected_summary": "...", "suggested_headline": "..."}}"""
        res = await self._call_groq(prompt)
        if res and "summaries" in res:
            try:
                return GenerateSummaryResponse(**res)
            except Exception:
                pass
        return await self.fallback.generate_summary(request)

    async def improve_bullet(self, request: ImproveBulletRequest) -> ImproveBulletResponse:
        prompt = f"""Improve bullet: "{request.bullet}" for role {request.role}.
Return JSON matching:
{{"original": "{request.bullet}", "options": [{{"text": "...", "rationale": "...", "metrics_included": true}}]}}"""
        res = await self._call_groq(prompt)
        if res and "options" in res:
            try:
                return ImproveBulletResponse(**res)
            except Exception:
                pass
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
