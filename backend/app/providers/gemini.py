import json
import re
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
        self.model_name = model_name or settings.AI_MODEL or "gemini-2.5-flash"
        self.fallback = LocalHeuristicProvider()

    async def _call_gemini(self, prompt: str, schema_class: type = None):
        if not self.api_key:
            return None
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model_name)
            response = await model.generate_content_async(prompt)
            raw_text = response.text.strip()

            # Clean markdown code block if present
            code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw_text)
            if code_block_match:
                json_str = code_block_match.group(1).strip()
            else:
                json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', raw_text)
                json_str = json_match.group(1).strip() if json_match else raw_text

            data = json.loads(json_str)
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
        res = await self._call_gemini(prompt)
        if res and "match_percentage" in res:
            try:
                return MatchResumeResponse(**res)
            except Exception as e:
                logger.warning("Failed to parse Gemini match response: %s", e)
        return await self.fallback.match_resume(request)

    async def tailor_resume(self, request: TailorResumeRequest) -> TailorResumeResponse:
        prompt = f"""You are a Principal Tech Recruiter and ATS Optimization Expert.
Analyze the candidate's current resume against the provided Job Description and generate targeted, section-by-section improvements.

Target Role / Title: {request.job_title or 'Target Role'}
Job Description:
{request.job_description}

Current Candidate Resume:
{json.dumps(request.resume_data, indent=2)}

INSTRUCTIONS:
1. Tailor the professional summary to directly address the key requirements, technologies, and responsibilities in the Job Description.
2. Review candidate experience bullets. Identify specific bullets that can be rewritten to highlight keywords and metrics relevant to the JD. Provide section, target_id (if available), original_text, tailored_text, and why it improves ATS ranking.
3. Identify missing critical skills mentioned in the JD that the candidate should add.
4. Provide concrete suggestions for projects if relevant.

Return ONLY valid JSON matching this schema:
{{
  "tailored_summary": "Tailored 3-4 sentence professional summary",
  "suggestions": [
    {{
      "section": "summary",
      "target_id": null,
      "original_text": "original summary if any",
      "tailored_text": "tailored summary",
      "reason": "Directly incorporates JD keywords and core competencies."
    }},
    {{
      "section": "experience",
      "target_id": null,
      "original_text": "exact original bullet",
      "tailored_text": "improved STAR bullet with JD keywords",
      "reason": "Quantifies results and includes required stack."
    }}
  ],
  "recommended_skills_to_add": ["Skill1", "Skill2", "Skill3"],
  "tailored_resume_data": {{}}
}}"""
        res = await self._call_gemini(prompt)
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
1. ZERO HALLUCINATION: Extract only facts explicitly present in the text.
2. CANDIDATE NAME:
   - Identify the candidate's actual full name at the top of the resume.
3. PROFESSIONAL TITLE & TARGET ROLE (CRITICAL):
   - Accurately determine the candidate's real professional title (e.g. "Full Stack Developer", "Backend Engineer", "Data Scientist", "Software Engineer", "DevOps Engineer").
   - If a title is explicitly in the header, use it.
   - If not in the header, inspect the most recent job title in their experience or primary technologies and set an accurate title. DO NOT default to a generic placeholder.
4. EXPERIENCE & BULLETS:
   - Extract EVERY position with exact company name, job title, start/end dates, location, and bullet point responsibilities.
5. PROJECTS:
   - Locate and extract all technical and personal projects with name, description, tech stack array, and links.
6. SKILLS:
   - Group skills into structured categories: "Programming Languages", "Frameworks & Libraries", "Cloud & DevOps", "Databases & Tools", "Core Competencies".
7. EDUCATION:
   - Extract institution, degree, field of study, dates, and GPA/honors if available.

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
        res = await self._call_gemini(prompt)
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
