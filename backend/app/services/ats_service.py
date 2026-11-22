import re
from typing import Dict, Any, List
from app.schemas.job_schema import (
    ATSAnalyzeRequest, ATSAnalyzeResponse, ATSSectionFeedback
)
from app.utils.text_utils import extract_matching_skills, extract_tokens, KNOWN_SKILLS

ACTION_VERBS = {
    "spearheaded", "architected", "engineered", "designed", "developed",
    "implemented", "led", "managed", "optimized", "accelerated", "built", "created"
}

async def analyze_ats_compatibility(request: ATSAnalyzeRequest) -> ATSAnalyzeResponse:
    resume = request.resume_data
    personal = resume.get("personalInfo", {})
    summary = resume.get("professionalSummary", "")
    experience = resume.get("experience", [])
    education = resume.get("education", [])
    skills = resume.get("skills", [])
    projects = resume.get("projects", [])

    section_feedback: Dict[str, ATSSectionFeedback] = {}
    critical_issues = []
    recommendations = []

    # 1. Contact info audit
    contact_score = 100
    contact_details = []
    if not personal.get("fullName"):
        contact_score -= 40
        contact_details.append("Missing full name.")
        critical_issues.append("Resume is missing candidate full name.")
    if not personal.get("email"):
        contact_score -= 30
        contact_details.append("Missing professional email.")
        critical_issues.append("Missing contact email address.")
    if not personal.get("phone"):
        contact_score -= 15
        contact_details.append("Missing telephone number.")
    if not personal.get("location"):
        contact_score -= 10
        contact_details.append("Location (City, Country) is recommended for location-based ATS filtering.")

    section_feedback["contact"] = ATSSectionFeedback(
        status="good" if contact_score >= 80 else ("warning" if contact_score >= 50 else "danger"),
        score=max(0, contact_score),
        message="Contact info is complete." if contact_score >= 80 else "Contact section needs attention.",
        details=contact_details or ["Name, email, and phone verified."]
    )

    # 2. Section completeness
    exp_score = 100
    exp_details = []
    if not experience and not projects:
        exp_score = 20
        exp_details.append("Neither work experience nor technical projects found.")
        critical_issues.append("Missing work experience and projects.")
    else:
        # Check action verbs
        has_action_verbs = False
        for exp in experience:
            for resp in exp.get("responsibilities", []):
                words = resp.lower().split()
                if words and words[0] in ACTION_VERBS:
                    has_action_verbs = True
                    break
        if not has_action_verbs:
            exp_score -= 15
            exp_details.append("Use strong action verbs (e.g., Engineered, Spearheaded) to lead your bullet points.")
            recommendations.append("Lead bullet points with high-impact action verbs.")

    section_feedback["experience"] = ATSSectionFeedback(
        status="good" if exp_score >= 80 else "warning",
        score=exp_score,
        message="Experience section demonstrates practical impact." if exp_score >= 80 else "Experience bullets can be enhanced.",
        details=exp_details or ["Experience formatting adheres to ATS standards."]
    )

    # 3. Skills audit
    skills_score = 100
    skills_details = []
    total_skills_count = sum(len(cat.get("items", [])) for cat in skills) if skills else 0
    if total_skills_count == 0:
        skills_score = 30
        skills_details.append("No categorized skills detected.")
        critical_issues.append("No technical or domain skills listed.")
    elif total_skills_count < 5:
        skills_score = 70
        skills_details.append("Only a few skills listed. Target 8-15 core competencies.")
    else:
        skills_details.append(f"{total_skills_count} skills properly categorized.")

    section_feedback["skills"] = ATSSectionFeedback(
        status="good" if skills_score >= 80 else "warning",
        score=skills_score,
        message="Skills section formatted clearly." if skills_score >= 80 else "Expand your skills portfolio.",
        details=skills_details
    )

    # 4. Keyword & Job Matching
    matched_kw = []
    missing_kw = []
    keyword_score = 85

    if request.job_description:
        jd_skills = extract_matching_skills(request.job_description)
        resume_str = str(resume).lower()
        for s in jd_skills:
            if s.lower() in resume_str:
                matched_kw.append(s)
            else:
                missing_kw.append(s)
        total_jd = max(1, len(jd_skills))
        keyword_score = int((len(matched_kw) / total_jd) * 100)
        if missing_kw:
            recommendations.append(f"Consider integrating key missing skills: {', '.join(missing_kw[:5])}")
    else:
        matched_kw = [s.title() for cat in skills for s in cat.get("items", [])][:8]

    # Overall calculation
    readability_score = 90
    formatting_score = 95
    compatibility_score = int((contact_score * 0.2) + (exp_score * 0.3) + (skills_score * 0.25) + (keyword_score * 0.25))

    return ATSAnalyzeResponse(
        compatibility_score=compatibility_score,
        readability_score=readability_score,
        keyword_score=keyword_score,
        formatting_score=formatting_score,
        matched_keywords=matched_kw,
        missing_keywords=missing_kw,
        section_feedback=section_feedback,
        critical_issues=critical_issues,
        recommendations=recommendations or ["Ensure consistent chronological dates across all jobs and education."],
        is_ats_friendly=compatibility_score >= 75
    )
