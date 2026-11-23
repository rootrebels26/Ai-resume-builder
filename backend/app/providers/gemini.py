import json
import logging
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

logger = logging.getLogger("gemini_provider")

class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.AI_MODEL or "gemini-1.5-flash"
        self.fallback = LocalHeuristicProvider()

    async def _call_gemini(self, prompt: str, schema_class: type = None):
        if not self.api_key:
            return None
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model_name)
            response = await model.generate_content_async(prompt)
            text = response.text.strip()
            # Clean possible markdown json code block
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            data = json.loads(text.strip())
            return data
        except Exception as e:
            logger.warning("Gemini API call failed, falling back to local heuristic: %s", e)
            return None

    async def generate_summary(self, request: GenerateSummaryRequest) -> GenerateSummaryResponse:
        prompt = f"""You are an expert career coach. Given this profile, generate 3 distinct professional resume summaries and 1 headline.
Role: {request.role}
Target Role: {request.target_role or request.role}
Level: {request.experience_level}
Key Skills: {', '.join(request.key_skills)}
Existing Summary: {request.existing_summary or ''}

Return ONLY valid JSON matching this schema:
{{
  "summaries": ["summary 1", "summary 2", "summary 3"],
  "selected_summary": "summary 1",
  "suggested_headline": "Headline string"
}}"""
        res = await self._call_gemini(prompt)
        if res and "summaries" in res:
            try:
                return GenerateSummaryResponse(**res)
            except Exception:
                pass
        return await self.fallback.generate_summary(request)

    async def improve_bullet(self, request: ImproveBulletRequest) -> ImproveBulletResponse:
        prompt = f"""You are an executive resume writer. Improve the following work experience bullet point using the STAR method, action verbs, and quantified impact.
Original Bullet: "{request.bullet}"
Role: {request.role or 'Professional'}
Target Role: {request.target_role or 'Professional'}

Return ONLY valid JSON matching this schema:
{{
  "original": "{request.bullet}",
  "options": [
    {{"text": "bullet 1 with metrics", "rationale": "reason 1", "metrics_included": true}},
    {{"text": "bullet 2 focused on leadership", "rationale": "reason 2", "metrics_included": false}},
    {{"text": "bullet 3 focused on technical depth", "rationale": "reason 3", "metrics_included": false}}
  ]
}}"""
        res = await self._call_gemini(prompt)
        if res and "options" in res:
            try:
                return ImproveBulletResponse(**res)
            except Exception:
                pass
        return await self.fallback.improve_bullet(request)

    async def improve_project(self, request: ImproveProjectRequest) -> ImproveProjectResponse:
        prompt = f"""You are an expert technical resume writer. Enhance this technical project description.
Project Name: {request.name}
Description: {request.description}
Technologies: {', '.join(request.technologies)}

Return ONLY valid JSON matching this schema:
{{
  "improved_description": "2 sentence overview",
  "bullet_points": ["bullet 1", "bullet 2", "bullet 3"],
  "suggested_technologies": ["tech 1", "tech 2"]
}}"""
        res = await self._call_gemini(prompt)
        if res and "improved_description" in res:
            try:
                return ImproveProjectResponse(**res)
            except Exception:
                pass
        return await self.fallback.improve_project(request)

    async def review_resume(self, request: ReviewResumeRequest) -> ReviewResumeResponse:
        return await self.fallback.review_resume(request)

    async def analyze_job(self, request: JobAnalyzeRequest) -> JobAnalyzeResponse:
        return await self.fallback.analyze_job(request)

    async def match_resume(self, request: MatchResumeRequest) -> MatchResumeResponse:
        return await self.fallback.match_resume(request)

    async def tailor_resume(self, request: TailorResumeRequest) -> TailorResumeResponse:
        return await self.fallback.tailor_resume(request)

    async def parse_resume_document(self, text: str, layout_metadata: dict = None) -> dict:
        return await self.fallback.parse_resume_document(text, layout_metadata)
