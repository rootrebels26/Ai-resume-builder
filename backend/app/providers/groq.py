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
        self.model_name = model_name or settings.AI_MODEL or "openai/gpt-oss-120b"
        self.fallback = LocalHeuristicProvider()

    async def _call_groq(self, prompt: str):
        if not self.api_key:
            return None

        # Build candidate models with auto-fallback if 404 or policy restriction
        candidate_models = [self.model_name]
        for fb in ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"]:
            if fb not in candidate_models:
                candidate_models.append(fb)

        for model in candidate_models:
            try:
                async with httpx.AsyncClient(timeout=35.0) as client:
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
                            "temperature": 0.2,
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
        res = await self._call_groq(prompt)
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
        res = await self._call_groq(prompt)
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
3. PROJECTS EXTRACTION (VERY IMPORTANT):
   - Locate and extract ALL projects from sections titled "Projects", "Featured Projects", "Technical Projects", "Key Projects", "Personal Projects", "Academic Projects", "Selected Projects", or "Notable Projects".
   - Extract each project entry into the "projects" array (NOT into "experience").
   - For each project, extract:
     * "name": project title
     * "description": concise summary of what the project does
     * "technologies": array of tools, languages, and frameworks used (e.g. ["Python", "FastAPI", "React"])
     * "githubUrl": repository link if mentioned
     * "liveUrl": live demo link if mentioned
     * "startDate": start date if available
     * "endDate": end date or completion date if available
     * "highlights": array of bullet points, key features, and accomplishments
4. PRESERVE ORIGINAL WORDING: Retain original bullet points, metrics, and details. Do not summarize or rewrite achievements.
5. CONTACT DETAILS: Distinguish the candidate's personal contact info from employers' or references' addresses.
6. CATEGORIZED SKILLS: Group skills logically into categories: "Programming Languages", "Frameworks & Libraries", "Databases & Cloud", "Developer Tools", "Core Competencies".
7. Return ONLY valid JSON with this exact schema:
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
        res = await self._call_groq(prompt)
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
