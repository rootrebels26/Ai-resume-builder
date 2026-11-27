import json
import re
import logging
import asyncio
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
        raw_model = model_name or settings.AI_MODEL
        if raw_model and not raw_model.lower().startswith("gemini"):
            raw_model = None
        self.model_name = raw_model or "gemini-2.5-flash"
        self.fallback = LocalHeuristicProvider()

    async def _call_gemini(self, prompt: str, schema_class: type = None, timeout_seconds: float = 25.0):
        if not self.api_key:
            return None
        import httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        gen_config = {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        }
        if "2.5" in self.model_name:
            gen_config["thinkingConfig"] = {"thinkingBudget": 0}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": gen_config,
        }
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    res_data = res.json()
                    candidates = res_data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            raw_text = parts[0]["text"].strip()
                            code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw_text)
                            if code_block_match:
                                json_str = code_block_match.group(1).strip()
                            else:
                                json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', raw_text)
                                json_str = json_match.group(1).strip() if json_match else raw_text
                            return json.loads(json_str)
                else:
                    logger.warning("Gemini REST API returned %s: %s", res.status_code, res.text[:200])
        except Exception as e:
            logger.warning("Gemini REST call failed or timed out, falling back to local heuristic: %s", e)
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
        res = await self._call_gemini(prompt, timeout_seconds=35.0)
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
        res = await self._call_gemini(prompt, timeout_seconds=35.0)
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
        res = await self._call_gemini(prompt, timeout_seconds=35.0)
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
        prompt = f"""You are a Senior ATS Algorithm Evaluator.
Evaluate the candidate's resume against the target Job Description.

Job Title: {request.job_title or 'Target Role'}
Job Description:
{request.job_description}

Resume:
{json.dumps(request.resume_data, indent=2)}

Return ONLY valid JSON matching this schema:
{{
  "match_percentage": 85,
  "matched_skills": ["skill1", "skill2"],
  "missing_critical_skills": ["skill3", "skill4"],
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword3", "keyword4"],
  "strengths": ["Strength 1", "Strength 2"],
  "gaps": ["Gap 1", "Gap 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}}"""
        res = await self._call_gemini(prompt, timeout_seconds=35.0)
        if res and "match_percentage" in res:
            try:
                return MatchResumeResponse(**res)
            except Exception as e:
                logger.warning("Failed to parse Gemini match response: %s", e)
        return await self.fallback.match_resume(request)

    async def tailor_resume(self, request: TailorResumeRequest) -> TailorResumeResponse:
        prompt = f"""You are a Principal Software Engineering Bar-Raiser and ATS Optimization Expert.
Analyze the candidate's current resume against the provided Job Description and generate targeted, Senior/Staff Developer caliber improvements.

Target Role / Title: {request.job_title or 'Senior Software Engineer'}
Job Description:
{request.job_description}

Current Candidate Resume:
{json.dumps(request.resume_data, indent=2)}

SENIOR DEVELOPER WRITING STANDARDS:
1. Google XYZ Formula: Formulate bullets strictly as "Accomplished [X] as measured by [Y] by doing [Z]".
2. Quantifiable Senior Impact: Always inject realistic senior-level metrics (e.g., p99 latency reduction, RPS/throughput, concurrency, 99.99% SLA availability, cloud spend reduction, and cross-team velocity gains).
3. Architectural Depth: Highlight architectural decisions, distributed systems trade-offs, CI/CD pipeline modernization, and technical squad mentorship.
4. Professional Summary: Craft an authoritative, executive-ready summary highlighting core domain mastery, scale handled, and leadership.
5. Provide actionable before/after suggestions for Experience, Projects, and Summary sections with clear rationales.

Return ONLY valid JSON matching this schema:
{{
  "tailored_summary": "High-impact 2-3 sentence senior developer professional summary",
  "suggestions": [
    {{
      "section": "summary",
      "target_id": null,
      "original_text": "original summary if any",
      "tailored_text": "tailored senior summary",
      "reason": "Directly incorporates JD keywords with senior-level scale and leadership competencies."
    }},
    {{
      "section": "experience",
      "target_id": null,
      "original_text": "exact original bullet",
      "tailored_text": "senior STAR/XYZ bullet with quantified impact (e.g. latency, scale, RPS) and required stack",
      "reason": "Elevates to Senior Developer standard using Google XYZ formula with concrete engineering metrics."
    }}
  ],
  "recommended_skills_to_add": ["Skill1", "Skill2", "Skill3"],
  "tailored_resume_data": {{}}
}}"""
        res = await self._call_gemini(prompt, timeout_seconds=35.0)
        if res and "tailored_summary" in res:
            try:
                if not res.get("tailored_resume_data"):
                    td = dict(request.resume_data)
                    td["professionalSummary"] = res["tailored_summary"]
                    res["tailored_resume_data"] = td
                return TailorResumeResponse(**res)
            except Exception as e:
                logger.warning("Failed to parse Gemini tailor response: %s", e)
        return await self.fallback.tailor_resume(request)

    async def parse_resume_document(self, text: str, layout_metadata: dict = None) -> dict:
        prompt = f"""You are a Principal Document Intelligence & Resume Parsing Specialist.
Extract all information from the provided raw resume text into a strictly formatted JSON object matching the exact schema below.

CRITICAL EXTRACTION RULES:
1. ZERO HALLUCINATION: Extract only facts explicitly present in the text. Never invent degrees, institutions, summaries, or projects not present in the source text.
2. MULTI-LANGUAGE & ORIGINAL WORDING PRESERVATION: Preserve the exact original language, wording, punctuation, and bullet structure of summaries, job responsibilities, and project descriptions. Do not summarize or shorten descriptions.
3. CANDIDATE NAME & CONTACT DETAILS:
   - Identify the candidate's actual full name at the top of the resume.
   - Extract phone number (preserving international country code e.g. +91, +1, +44), email, city/state/country location.
   - Extract LinkedIn profile URL, GitHub profile URL, GitLab/Behance/Dribbble/StackOverflow URLs, and personal portfolio or website URL (into "portfolio" and "website").
4. PROFESSIONAL SUMMARY (CRITICAL):
   - DO NOT prepend or include contact words or labels ("Email", "Contact", "Phone"), candidate name, links, or contact numbers inside "professionalSummary".
   - "professionalSummary" must ONLY contain pure biographical and career narrative prose, preserving the original paragraph verbatim.
5. PROFESSIONAL TITLE & TARGET ROLE (CRITICAL):
   - Accurately determine the candidate's real professional title across any industry (e.g. "Full Stack Developer", "Registered Nurse", "Chartered Accountant", "Product Manager", "Mechanical Engineer", "Graphic Designer").
   - If a title is explicitly in the header, use it.
   - If not in the header, inspect the most recent job title in their experience. DO NOT default to a generic placeholder like "Engineer".
6. EXPERIENCE, INTERNSHIPS & BULLETS (CRITICAL — DO NOT TRUNCATE):
   - Extract EVERY SINGLE work experience role from the entire document across all pages (if there are 7, 8, 9, or 10+ roles, extract ALL of them from newest to oldest!).
   - Extract internships separately into "internships" when labeled as Internships / Industrial Training / Research Internship / Apprenticeship.
   - For every position, extract exact company name, job title, start/end dates, location, and ALL bullet point responsibilities verbatim.
7. PROJECTS (CRITICAL — DO NOT SUMMARIZE):
   - Locate and extract all technical, academic, research, freelance, and personal projects.
   - CRITICAL: DO NOT dump live demo URLs, GitHub links, or labels like "[Demo]", "[GitHub]", "Live: https://..." into the "description" text or "highlights" bullets!
   - Put live deployment URLs strictly in "liveUrl" (e.g. Render, Vercel, Netlify, AWS, custom domain).
   - Put repository URLs strictly in "githubUrl".
   - Keep "name" as the clean project title, and "description" / "highlights" preserving ALL original project details verbatim.
   - Extract "technologies" as an array of individual technology strings.
8. SKILLS:
   - If the resume explicitly organizes skills into named categories (e.g. "AI & Agents", "Clinical Skills", "Languages", "Tools & Cloud"), PRESERVE those exact category names and items!
   - Otherwise, group skills cleanly without inventing skills not in the text.
9. EDUCATION:
   - Extract institution, full degree (including field of study), start/end dates, original CGPA/GPA/percentage without converting, and coursework in description.
   - If no education is in the document, leave "education" as [].
10. CERTIFICATIONS, LEADERSHIP & CUSTOM SECTIONS:
   - Extract EVERY certification. If multiple certifications are listed on the same bullet line separated by '|', split them into separate certification objects!
   - Extract name, issuer, credentialId (if any), and issue date.
   - Extract any Leadership, Awards, Languages, Publications, Volunteer sections, AND any unrecognized/custom sections (e.g. Patents, Clinical Rotations, Exhibitions, Teaching, Confs, Grants, References) into "achievements", "languages", "publications", "volunteerExperience", or "customSections" (with "sectionTitle" and "items": [{"title", "subtitle", "date", "description"}]) so ZERO information from the uploaded resume is lost.

Return ONLY valid JSON matching this exact structure:
{{
  "personalInfo": {{
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "professionalTitle": "",
    "website": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  }},
  "professionalSummary": "",
  "education": [
    {{
      "institution": "",
      "degree": "",
      "fieldOfStudy": "",
      "startDate": "",
      "endDate": "",
      "cgpa": "",
      "description": ""
    }}
  ],
  "experience": [
    {{
      "company": "",
      "position": "",
      "employmentType": "Full-time",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "responsibilities": [],
      "achievements": []
    }}
  ],
  "internships": [],
  "projects": [
    {{
      "name": "",
      "description": "",
      "technologies": [],
      "githubUrl": "",
      "liveUrl": "",
      "startDate": "",
      "endDate": "",
      "highlights": []
    }}
  ],
  "skills": [
    {{
      "category": "Technical Skills",
      "items": []
    }}
  ],
  "certifications": [],
  "achievements": [],
  "languages": [
    {{
      "name": "English",
      "proficiency": "Proficient"
    }}
  ],
  "publications": [],
  "volunteerExperience": [],
  "customSections": []
}}

RAW RESUME TEXT:
{text[:28000]}
"""
        res = await self._call_gemini(prompt, timeout_seconds=35.0)
        if res and isinstance(res, dict) and ("personalInfo" in res or "experience" in res or "education" in res):
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
        res = await self._call_gemini(prompt, timeout_seconds=12.0)
        if res and isinstance(res, dict):
            existing_w = res.get("warnings") or []
            res["warnings"] = pre_warnings + (existing_w if isinstance(existing_w, list) else [])
            if section_type == "custom" and heading_raw and isinstance(res.get("custom_section"), dict):
                res["custom_section"]["heading"] = res["custom_section"].get("heading") or heading_raw
            return res

        fallback_res = await self.fallback.parse_section(section_type, clean_text, repair_errors=repair_errors, heading_raw=heading_raw)
        fallback_res["warnings"] = pre_warnings + (fallback_res.get("warnings") or [])
        return fallback_res
