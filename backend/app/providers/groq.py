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
        raw_model = model_name or settings.AI_MODEL
        if raw_model and raw_model.lower().startswith("gemini"):
            raw_model = None
        self.model_name = raw_model or "llama-3.3-70b-versatile"
        self.fallback = LocalHeuristicProvider()

    async def _call_groq(self, prompt: str, timeout_seconds: float = 30.0):
        if not self.api_key:
            return None

        # Build candidate models with auto-fallback if 404 or policy restriction
        candidate_models = [self.model_name]
        for fb in ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "llama-3.1-8b-instant"]:
            if fb not in candidate_models:
                candidate_models.append(fb)

        for model in candidate_models:
            try:
                async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                    res = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": model,
                            "messages": [
                                {"role": "system", "content": "You are a Principal Document Intelligence & Resume Parsing Specialist. You must output only valid raw JSON conforming strictly to the requested schema without markdown."},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.0,
                            "response_format": {"type": "json_object"}
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        content = data["choices"][0]["message"]["content"].strip()
                        # Clean markdown fences if model wraps JSON
                        if content.startswith("```json"):
                            content = content[7:]
                        elif content.startswith("```"):
                            content = content[3:]
                        if content.endswith("```"):
                            content = content[:-3]
                        return json.loads(content.strip())
                    elif res.status_code == 404:
                        logger.warning("Groq model %s returned 404, attempting fallback...", model)
                        continue
                    else:
                        logger.warning("Groq API returned %s for model %s: %s", res.status_code, model, res.text)
            except Exception as e:
                logger.warning("Groq API request error for model %s: %s", model, e)
        return None

    async def generate_summary(self, request: GenerateSummaryRequest) -> GenerateSummaryResponse:
        prompt = f"""Generate 3 professional summaries and a suggested headline for a {request.role} with skills: {', '.join(request.key_skills)}.
Return JSON matching:
{{"summaries": ["..."], "selected_summary": "...", "suggested_headline": "..."}}"""
        res = await self._call_groq(prompt, timeout_seconds=12.0)
        if res and "summaries" in res:
            try:
                return GenerateSummaryResponse(**res)
            except Exception:
                pass
        return await self.fallback.generate_summary(request)

    async def improve_bullet(self, request: ImproveBulletRequest) -> ImproveBulletResponse:
        prompt = f"""Generate 3 distinct professional bullet point improvements for role '{request.role}' using the STAR method for this bullet:
"{request.bullet}"
One focusing on quantifiable metrics/scale, one on cross-functional impact/collaboration, and one on technical/architectural excellence.
Return valid JSON matching:
{{
  "original": "{request.bullet}",
  "options": [
    {{"text": "Option 1...", "rationale": "Quantifiable metric rationale...", "metrics_included": true}},
    {{"text": "Option 2...", "rationale": "Cross-functional impact...", "metrics_included": false}},
    {{"text": "Option 3...", "rationale": "Technical/architectural excellence...", "metrics_included": false}}
  ]
}}"""
        res = await self._call_groq(prompt, timeout_seconds=12.0)
        if res and "options" in res and len(res["options"]) >= 3:
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

    async def parse_resume_document(self, text: str, layout_metadata: dict = None) -> dict:
        prompt = f"""You are a Principal Document Intelligence & Resume Parsing Specialist.
Extract all information from the provided raw resume text into a strictly formatted JSON object matching the exact schema below.

CRITICAL RULES:
1. ZERO HALLUCINATION: Only extract facts explicitly stated in the resume. If a field (e.g. phone, dates, GPA, location) is not present, return empty string "" or empty array []. Never invent missing data.
2. EXTRACT ALL ITEMS: Do NOT truncate. Extract EVERY employment experience, EVERY educational degree, EVERY project, and ALL skills.
3. PROFESSIONAL SUMMARY (CRITICAL):
   - DO NOT include contact labels ("Email", "Contact", "Phone"), candidate name, or URLs inside "professionalSummary".
   - Keep "professionalSummary" strictly as career narrative prose.
4. PROJECTS EXTRACTION (VERY IMPORTANT):
   - Locate and extract ALL projects from sections titled "Projects", "Featured Projects", "Technical Projects", "Key Projects", "Personal Projects", "Academic Projects", "Selected Projects", or "Notable Projects".
   - UNIVERSAL FALLBACK: If the resume lacks an explicit "PROJECTS" section, extract 3-4 major engineering architectures, data platforms, or systems described in the work experience bullets into "projects" so projects are never empty!
   - Extract each project entry into the "projects" array (NOT into "experience").
   - For each project, extract:
     * "name": clean project title WITHOUT [Demo], [GitHub], or raw URLs
     * "description": clean narrative summary of what the project does. CRITICAL: DO NOT put raw URLs or link tags into this field!
     * "technologies": array of tools, languages, and frameworks used (e.g. ["Python", "FastAPI", "React"])
     * "githubUrl": repository link if mentioned
     * "liveUrl": live deployment or demo link if mentioned (e.g. Render, Vercel, Netlify, custom domain)
     * "startDate": start date if available
     * "endDate": end date or completion date if available
     * "highlights": array of bullet points, key features, and accomplishments WITHOUT raw URLs embedded
5. PRESERVE ORIGINAL WORDING: Retain original bullet points, metrics, and details. Do not summarize or rewrite achievements.
6. CONTACT DETAILS:
   - Extract candidate's phone number (preserving international country code e.g. +91, +1, +44), email, city/state/country location.
   - Extract LinkedIn profile URL, GitHub profile URL, and personal portfolio or website URL (into "portfolio" and "website").
7. CATEGORIZED SKILLS: Group skills logically into categories: "Programming Languages", "Frameworks & Libraries", "Databases & Cloud", "Developer Tools", "Core Competencies".
8. Return ONLY valid JSON with this exact schema:
{{
  "personalInfo": {{
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "professionalTitle": "...",
    "website": "...",
    "linkedin": "...",
    "github": "...",
    "portfolio": "..."
  }},
  "professionalSummary": "...",
  "education": [
    {{
      "institution": "...",
      "degree": "...",
      "fieldOfStudy": "...",
      "startDate": "...",
      "endDate": "...",
      "cgpa": "...",
      "description": "..."
    }}
  ],
  "experience": [
    {{
      "company": "...",
      "position": "...",
      "employmentType": "Full-time",
      "location": "...",
      "startDate": "...",
      "endDate": "...",
      "current": false,
      "responsibilities": ["..."],
      "achievements": ["..."]
    }}
  ],
  "internships": [],
  "projects": [
    {{
      "name": "...",
      "description": "...",
      "technologies": ["..."],
      "githubUrl": "...",
      "liveUrl": "...",
      "startDate": "...",
      "endDate": "...",
      "highlights": ["..."]
    }}
  ],
  "skills": [
    {{
      "category": "Programming Languages",
      "items": ["..."]
    }}
  ],
  "certifications": [
    {{
      "name": "...",
      "issuer": "...",
      "issueDate": "...",
      "expiryDate": "...",
      "credentialUrl": ""
    }}
  ],
  "achievements": [],
  "languages": [
    {{
      "name": "...",
      "proficiency": "Proficient"
    }}
  ],
  "publications": [],
  "volunteerExperience": [],
  "customSections": []
}}

RESUME TEXT:
{text[:30000]}
"""
        res = await self._call_groq(prompt, timeout_seconds=12.0)
        if res and isinstance(res, dict) and ("personalInfo" in res or "experience" in res or "education" in res):
            # If professionalTitle was not identified, default to most recent job position
            pinfo = res.get("personalInfo", {})
            if isinstance(pinfo, dict) and not pinfo.get("professionalTitle"):
                exps = res.get("experience", [])
                if exps and isinstance(exps, list) and len(exps) > 0:
                    first_pos = exps[0].get("position")
                    if first_pos:
                        pinfo["professionalTitle"] = first_pos
            return res
        return await self.fallback.parse_resume_document(text, layout_metadata)

    async def parse_section(self, section_type: str, section_text: str, repair_errors: list = None, heading_raw: str = "") -> dict:
        from app.services.section_prompts import build_section_prompt, scan_and_strip_untrusted_lines
        clean_text, pre_warnings = scan_and_strip_untrusted_lines(section_text)
        if not clean_text.strip():
            return {"warnings": pre_warnings, "unmapped": []}

        prompt = build_section_prompt(section_type, clean_text, repair_errors=repair_errors)
        res = await self._call_groq(prompt, timeout_seconds=12.0)
        if res and isinstance(res, dict):
            existing_w = res.get("warnings") or []
            res["warnings"] = pre_warnings + (existing_w if isinstance(existing_w, list) else [])
            if section_type == "custom" and heading_raw and isinstance(res.get("custom_section"), dict):
                res["custom_section"]["heading"] = res["custom_section"].get("heading") or heading_raw
            return res

        fallback_res = await self.fallback.parse_section(section_type, clean_text, repair_errors=repair_errors, heading_raw=heading_raw)
        fallback_res["warnings"] = pre_warnings + (fallback_res.get("warnings") or [])
        return fallback_res
