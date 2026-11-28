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

FREE_OPENROUTER_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen3-235b-a22b:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "google/gemini-2.0-flash-exp:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "openrouter/free",
]


class OpenRouterProvider(BaseAIProvider):
    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.OPENROUTER_API_KEY
        raw_model = model_name or settings.AI_MODEL
        if raw_model and "/" not in raw_model:
            raw_model = None
        self.model_name = raw_model or FREE_OPENROUTER_MODELS[0]
        self.fallback = LocalHeuristicProvider()

    async def _call_openrouter(self, prompt: str, timeout_seconds: float = 12.0):
        if not self.api_key:
            return None

        candidate_models = [self.model_name]
        for fm in FREE_OPENROUTER_MODELS:
            if fm not in candidate_models:
                candidate_models.append(fm)

        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            for model in candidate_models:
                try:
                    res = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://ai-resume-builder.local",
                            "X-Title": "AI Resume Builder"
                        },
                        json={
                            "model": model,
                            "messages": [
                                {"role": "system", "content": "You are an expert career counselor and resume parser. Return only valid JSON."},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.2
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        choices = data.get("choices") or []
                        if not choices:
                            continue
                        content = (choices[0].get("message", {}).get("content") or "").strip()
                        if content.startswith("```json"):
                            content = content[7:]
                        if content.startswith("```"):
                            content = content[3:]
                        if content.endswith("```"):
                            content = content[:-3]
                        return json.loads(content.strip())
                    logger.warning(
                        "OpenRouter model %s busy/unavailable (%s); shifting to next free model.",
                        model, res.status_code
                    )
                except Exception as e:
                    logger.warning("OpenRouter model %s failed (%s); shifting to next free model.", model, e)
                    if isinstance(e, (httpx.ConnectError, httpx.ConnectTimeout)):
                        break
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

    async def parse_resume_document(self, text: str, layout_metadata: dict = None) -> dict:
        if not self.api_key or not text or len(text.strip()) < 20:
            return await self.fallback.parse_resume_document(text, layout_metadata)

        from app.services.document_extraction import run_document_extraction

        res = await run_document_extraction(
            self._call_openrouter, text, layout_metadata, max_chars=24000, timeout_seconds=20.0
        )
        if res:
            return res
        return await self.fallback.parse_resume_document(text, layout_metadata)

    async def parse_section(self, section_type: str, section_text: str, repair_errors: list = None, heading_raw: str = "") -> dict:
        from app.services.section_prompts import build_section_prompt, scan_and_strip_untrusted_lines
        clean_text, pre_warnings = scan_and_strip_untrusted_lines(section_text)
        if not clean_text.strip():
            return {"warnings": pre_warnings, "unmapped": []}

        prompt = build_section_prompt(section_type, clean_text, repair_errors=repair_errors)
        res = await self._call_openrouter(prompt)
        if res and isinstance(res, dict):
            existing_w = res.get("warnings") or []
            res["warnings"] = pre_warnings + (existing_w if isinstance(existing_w, list) else [])
            if section_type == "custom" and heading_raw and isinstance(res.get("custom_section"), dict):
                res["custom_section"]["heading"] = res["custom_section"].get("heading") or heading_raw
            return res

        fallback_res = await self.fallback.parse_section(section_type, clean_text, repair_errors=repair_errors, heading_raw=heading_raw)
        fallback_res["warnings"] = pre_warnings + (fallback_res.get("warnings") or [])
        return fallback_res
