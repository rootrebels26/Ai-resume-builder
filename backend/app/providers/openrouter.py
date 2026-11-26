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

    async def parse_resume_document(self, text: str, layout_metadata: dict = None) -> dict:
        if not self.api_key or not text or len(text.strip()) < 20:
            return await self.fallback.parse_resume_document(text, layout_metadata)

        prompt = f"""You are a Principal Document Intelligence & Resume Parsing Specialist.
Extract ALL information from the provided full resume text and organize it professionally into a strictly formatted JSON object.

RULES:
1. ZERO HALLUCINATION: Extract only facts explicitly present in the resume text.
2. EXTRACT EVERY SECTION COMPLETELY: Do not truncate jobs, bullets, projects, skills, certifications, or education.
3. PROFESSIONAL SUMMARY: Keep only clean career narrative prose (no contact info, phone, email, or headers).
4. PROJECTS: If the resume has no separate Projects section, extract 3-4 major systems/platforms from experience into "projects".
5. SKILLS: Preserve explicit skill category names if present; otherwise group cleanly into "Programming Languages", "Frameworks & Libraries", "Cloud & DevOps", "Databases & Tools", "Core Competencies".
6. Return ONLY valid JSON with this exact schema:
{{
  "personalInfo": {{
    "fullName": "", "email": "", "phone": "", "location": "",
    "professionalTitle": "", "website": "", "linkedin": "", "github": "", "portfolio": ""
  }},
  "professionalSummary": "",
  "education": [{{ "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "", "cgpa": "", "description": "" }}],
  "experience": [{{ "company": "", "position": "", "employmentType": "Full-time", "location": "", "startDate": "", "endDate": "", "current": false, "responsibilities": [], "achievements": [] }}],
  "internships": [],
  "projects": [{{ "name": "", "description": "", "technologies": [], "githubUrl": "", "liveUrl": "", "startDate": "", "endDate": "", "highlights": [] }}],
  "skills": [{{ "category": "", "items": [] }}],
  "certifications": [{{ "name": "", "issuer": "", "date": "" }}],
  "achievements": [],
  "languages": [{{ "name": "", "proficiency": "" }}]
}}

FULL EXTRACTED RESUME TEXT:
\"\"\"
{text[:24000]}
\"\"\"
"""
        res = await self._call_openrouter(prompt)
        if isinstance(res, dict) and (res.get("personalInfo") or res.get("experience") or res.get("skills")):
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
