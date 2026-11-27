import hashlib
import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings
from app.providers.gemini import GeminiProvider
from app.schemas.career_schema import (
    CareerAnalysisResponse,
    CareerPreferences,
    CareerProfile,
    MatchScoreWeights,
    RecommendedRole,
    RoleDetailsRequest,
    RoleDetailsResponse,
    ScoreFactorBreakdown,
    SkillsGapSummary,
)
from app.services.job_url_engine import generate_job_search_links

logger = logging.getLogger("career_service")

CAREER_PROMPT_VERSION = "1.0.0"

ALLOWED_EXPERIENCE_LEVELS = {
    "Student",
    "Fresher",
    "Intern",
    "Entry-level",
    "Junior professional",
    "Mid-level professional",
    "Senior professional",
}


def strip_pii_for_career_analysis(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Privacy guard: strip contact details, full name, email, phone, address,
    and personal profile URLs before sending resume content to Gemini.
    """
    pinfo = resume_data.get("personalInfo") or {}
    return {
        "headline": str(pinfo.get("professionalTitle") or pinfo.get("headline") or "").strip(),
        "professionalSummary": str(resume_data.get("professionalSummary") or "").strip(),
        "education": resume_data.get("education") or [],
        "experience": resume_data.get("experience") or [],
        "internships": resume_data.get("internships") or [],
        "projects": resume_data.get("projects") or [],
        "skills": resume_data.get("skills") or [],
        "certifications": resume_data.get("certifications") or [],
        "achievements": resume_data.get("achievements") or [],
        "publications": resume_data.get("publications") or [],
        "volunteerExperience": resume_data.get("volunteerExperience") or [],
        "languages": resume_data.get("languages") or [],
        "customSections": resume_data.get("customSections") or [],
    }


def is_resume_meaningfully_empty(resume_data: Dict[str, Any]) -> bool:
    if not isinstance(resume_data, dict):
        return True
    pinfo = resume_data.get("personalInfo") or {}
    has_text = any([
        str(pinfo.get("professionalTitle") or "").strip(),
        str(resume_data.get("professionalSummary") or "").strip(),
        bool(resume_data.get("experience")),
        bool(resume_data.get("internships")),
        bool(resume_data.get("education")),
        bool(resume_data.get("projects")),
        bool(resume_data.get("skills")),
        bool(resume_data.get("certifications")),
        bool(resume_data.get("customSections")),
    ])
    return not has_text


def compute_resume_fingerprint(
    sanitized_resume: Dict[str, Any], preferences: Optional[CareerPreferences] = None
) -> str:
    payload = {
        "resume": sanitized_resume,
        "preferences": preferences.model_dump() if preferences else {},
        "prompt_version": CAREER_PROMPT_VERSION,
    }
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]


def _extract_all_resume_skills(sanitized: Dict[str, Any]) -> List[str]:
    seen = set()
    skills: List[str] = []

    def _add(item: str):
        s = str(item or "").strip()
        if s and s.lower() not in seen and len(s) <= 45:
            seen.add(s.lower())
            skills.append(s)

    for cat in sanitized.get("skills") or []:
        if isinstance(cat, dict):
            for it in cat.get("items") or []:
                _add(it)
        elif isinstance(cat, str):
            _add(cat)

    for proj in sanitized.get("projects") or []:
        if isinstance(proj, dict):
            for t in proj.get("technologies") or []:
                _add(t)

    return skills


def classify_experience_level(sanitized: Dict[str, Any]) -> str:
    """
    Classify the user strictly from actual resume evidence.
    """
    exps = sanitized.get("experience") or []
    interns = sanitized.get("internships") or []
    edus = sanitized.get("education") or []
    headline = str(sanitized.get("headline") or "").lower()
    summary = str(sanitized.get("professionalSummary") or "").lower()

    full_time_exps = [
        e for e in exps
        if isinstance(e, dict)
        and "intern" not in str(e.get("position") or "").lower()
        and "trainee" not in str(e.get("position") or "").lower()
    ]
    intern_exps = [
        e for e in exps
        if isinstance(e, dict)
        and ("intern" in str(e.get("position") or "").lower() or "trainee" in str(e.get("position") or "").lower())
    ] + list(interns)

    is_current_student = any(
        isinstance(ed, dict)
        and any(k in str(ed.get("endDate") or "").lower() for k in ("present", "expected", "pursuing", "2026", "2027", "2028"))
        for ed in edus
    ) or "student" in headline or "undergraduate" in summary

    if len(full_time_exps) == 0:
        if is_current_student and intern_exps:
            return "Intern"
        if is_current_student:
            return "Student"
        if intern_exps:
            return "Fresher"
        return "Entry-level" if not edus else "Fresher"

    senior_kw = ("senior", "staff", "principal", "lead", "head ", "director", "vp ", "chief", "architect")
    if len(full_time_exps) >= 4 or any(k in headline for k in senior_kw):
        return "Senior professional"
    if len(full_time_exps) >= 2:
        return "Mid-level professional"
    if len(full_time_exps) == 1:
        pos = str(full_time_exps[0].get("position") or "").lower()
        if any(k in pos for k in senior_kw):
            return "Mid-level professional"
        return "Junior professional"
    return "Entry-level"


def _infer_education_level(sanitized: Dict[str, Any]) -> str:
    edus = sanitized.get("education") or []
    if not edus:
        return "Unknown"
    joined = " ".join(
        f"{e.get('degree', '')} {e.get('fieldOfStudy', '')}" for e in edus if isinstance(e, dict)
    ).lower()
    if any(k in joined for k in ("ph.d", "phd", "doctorate")):
        return "Doctorate / PhD"
    if any(k in joined for k in ("master", "m.sc", "msc", "m.tech", "mtech", "mba", "m.s.", "mca", "m.ed")):
        return "Master's Degree"
    if any(k in joined for k in ("bachelor", "b.tech", "btech", "b.e", "b.sc", "bsc", "bs ", "ba ", "bcom", "bba", "bca", "jd", "bsn")):
        return "Bachelor's Degree"
    if any(k in joined for k in ("diploma", "polytechnic", "certificate")):
        return "Diploma / Certificate"
    return str(edus[0].get("degree") or "Unknown").strip() or "Unknown"


def compute_role_match_score(
    sanitized: Dict[str, Any],
    role_matched_skills: List[str],
    role_missing_skills: List[str],
    role_title: str,
    weights: MatchScoreWeights,
) -> Tuple[int, ScoreFactorBreakdown]:
    """
    Reproducible, transparent Estimated Resume-to-Role Match score (0-100).
    """
    total_w = weights.skills + weights.education + weights.experience + weights.projects + weights.certifications
    if total_w <= 0:
        total_w = 1.0

    # 1. Skills factor (0..1)
    m_cnt = len(role_matched_skills)
    miss_cnt = len(role_missing_skills)
    if m_cnt + miss_cnt > 0:
        skills_ratio = min(1.0, (m_cnt + 0.5) / max(1.0, m_cnt + miss_cnt * 0.85))
    else:
        skills_ratio = 0.55

    # 2. Education relevance (0..1)
    edus = sanitized.get("education") or []
    edu_ratio = 0.85 if edus else 0.35

    # 3. Experience relevance (0..1)
    exps = sanitized.get("experience") or []
    interns = sanitized.get("internships") or []
    exp_text = " ".join(
        f"{e.get('position', '')} {' '.join(e.get('responsibilities') or [])}"
        for e in (exps + interns) if isinstance(e, dict)
    ).lower()
    title_tokens = [t for t in re.findall(r'[a-z]{3,}', role_title.lower()) if t not in ("and", "the", "for", "intern")]
    title_overlap = sum(1 for t in title_tokens if t in exp_text)
    if exps or interns:
        exp_ratio = min(1.0, 0.55 + 0.15 * title_overlap)
    else:
        exp_ratio = 0.40

    # 4. Project relevance (0..1)
    projs = sanitized.get("projects") or []
    proj_ratio = min(1.0, 0.40 + 0.25 * len(projs)) if projs else 0.25

    # 5. Certification relevance (0..1)
    certs = sanitized.get("certifications") or []
    cert_ratio = min(1.0, 0.40 + 0.20 * len(certs)) if certs else 0.25

    raw_score = (
        (skills_ratio * weights.skills)
        + (edu_ratio * weights.education)
        + (exp_ratio * weights.experience)
        + (proj_ratio * weights.projects)
        + (cert_ratio * weights.certifications)
    ) / total_w

    final_score = max(15, min(98, int(round(raw_score * 100))))

    breakdown = ScoreFactorBreakdown(
        skills_score=round(skills_ratio * 100, 1),
        education_score=round(edu_ratio * 100, 1),
        experience_score=round(exp_ratio * 100, 1),
        projects_score=round(proj_ratio * 100, 1),
        certifications_score=round(cert_ratio * 100, 1),
        weights_used={
            "skills": round(weights.skills / total_w, 2),
            "education": round(weights.education / total_w, 2),
            "experience": round(weights.experience / total_w, 2),
            "projects": round(weights.projects / total_w, 2),
            "certifications": round(weights.certifications / total_w, 2),
        },
    )
    return final_score, breakdown


# Domain-aware role catalog for deterministic offline/quota fallback
_ROLE_CATALOG: List[Dict[str, Any]] = [
    {"title": "Software Engineer", "category": "Software Development", "industry": "Technology", "skills": ["Python", "Java", "JavaScript", "SQL", "Git", "REST API"], "learn": ["System Design", "CI/CD", "Unit Testing"]},
    {"title": "Backend Developer", "category": "Software Development", "industry": "Technology", "skills": ["Python", "FastAPI", "Flask", "Node.js", "PostgreSQL", "SQL", "Docker"], "learn": ["Distributed Caching", "Message Queues", "OpenTelemetry"]},
    {"title": "Full Stack Developer", "category": "Software Development", "industry": "Technology", "skills": ["React", "JavaScript", "TypeScript", "Node.js", "Python", "SQL", "HTML", "CSS"], "learn": ["Next.js", "GraphQL", "Cloud Deployment"]},
    {"title": "Frontend Developer", "category": "Software Development", "industry": "Technology", "skills": ["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML", "CSS"], "learn": ["Web Accessibility", "Performance Profiling", "Testing Library"]},
    {"title": "Data Analyst", "category": "Data Analytics", "industry": "Analytics & BI", "skills": ["SQL", "Python", "Pandas", "Power BI", "Tableau", "Excel", "Data Visualization"], "learn": ["A/B Testing", "dbt", "Statistical Inference"]},
    {"title": "Business Intelligence Analyst", "category": "Business Analytics", "industry": "Analytics & BI", "skills": ["SQL", "Power BI", "Tableau", "Excel", "Data Modeling"], "learn": ["DAX", "Snowflake", "Stakeholder Storytelling"]},
    {"title": "Data Scientist", "category": "Data Science", "industry": "AI & Data", "skills": ["Python", "SQL", "Pandas", "NumPy", "Scikit-learn", "Statistics", "Machine Learning"], "learn": ["Causal Inference", "Experimentation", "Feature Stores"]},
    {"title": "Machine Learning Engineer", "category": "Machine Learning", "industry": "AI & Data", "skills": ["Python", "Scikit-learn", "PyTorch", "TensorFlow", "Docker", "FastAPI"], "learn": ["MLOps", "Model Serving", "ONNX / Triton"]},
    {"title": "AI / Generative AI Engineer", "category": "Generative AI", "industry": "Artificial Intelligence", "skills": ["Python", "LLMs", "Generative AI", "NLP", "FastAPI", "RAG", "LangChain"], "learn": ["LLM Evaluation", "Vector Databases", "Prompt Guardrails"]},
    {"title": "NLP Engineer", "category": "Artificial Intelligence", "industry": "Artificial Intelligence", "skills": ["Python", "NLP", "PyTorch", "Transformers", "LLMs"], "learn": ["Fine-tuning LoRA", "Information Retrieval", "Tokenization"]},
    {"title": "Data Engineer", "category": "Data Science", "industry": "Data Infrastructure", "skills": ["Python", "SQL", "Spark", "Kafka", "PostgreSQL", "AWS", "Azure", "ETL"], "learn": ["Apache Airflow", "Lakehouse Architecture", "Data Quality"]},
    {"title": "Cloud / DevOps Engineer", "category": "Cloud and DevOps", "industry": "Cloud Infrastructure", "skills": ["AWS", "Azure", "Docker", "Kubernetes", "Linux", "Git", "CI/CD", "Terraform"], "learn": ["Prometheus & Grafana", "IaC Security", "Multi-region Failover"]},
    {"title": "Site Reliability Engineer", "category": "Cloud and DevOps", "industry": "Cloud Infrastructure", "skills": ["Linux", "Docker", "Kubernetes", "Python", "AWS", "Monitoring"], "learn": ["SLO/SLI Error Budgets", "Incident Automation", "eBPF"]},
    {"title": "Cybersecurity Analyst", "category": "Cybersecurity", "industry": "Information Security", "skills": ["Security", "Linux", "Networking", "Python", "IAM", "SIEM"], "learn": ["Threat Modeling", "Cloud Posture Management", "Incident Response"]},
    {"title": "Product Analyst", "category": "Product and Project Management", "industry": "Product & Tech", "skills": ["SQL", "Analytics", "Python", "Excel", "Product Metrics"], "learn": ["Funnel Cohort Analysis", "PRD Writing", "User Research"]},
    {"title": "Technical Product Manager", "category": "Product and Project Management", "industry": "Product & Tech", "skills": ["Product Management", "Agile", "SQL", "System Design", "Stakeholder"], "learn": ["Pricing Strategy", "API Productization", "OKRs"]},
    {"title": "UI/UX Designer", "category": "UI/UX and Design", "industry": "Design & Creative", "skills": ["Figma", "Prototyping", "User Research", "Design Systems", "UI/UX", "Accessibility"], "learn": ["Design Tokens", "Usability Testing", "Motion Micro-interactions"]},
    {"title": "Research Assistant / Associate", "category": "Research and Academia", "industry": "Research & Higher Education", "skills": ["Research", "Python", "Statistics", "Writing", "Publications", "Data Analysis"], "learn": ["LaTeX", "Reproducible Pipelines", "Grant Writing"]},
    {"title": "Healthcare Clinical Specialist", "category": "Healthcare & Clinical", "industry": "Healthcare", "skills": ["Patient Care", "Triage", "EHR", "Clinical", "BLS", "ACLS", "Nursing"], "learn": ["Clinical Informatics", "Quality Improvement", "Telehealth Workflows"]},
    {"title": "Financial & Audit Analyst", "category": "Finance & Accounting", "industry": "Financial Services", "skills": ["IFRS", "Audit", "Financial Modeling", "Excel", "SAP", "Accounting", "Tax"], "learn": ["Python for Finance", "FP&A Automation", "ESG Reporting"]},
]


def _heuristic_career_analysis(
    sanitized: Dict[str, Any],
    preferences: CareerPreferences,
    weights: MatchScoreWeights,
) -> Dict[str, Any]:
    resume_skills = _extract_all_resume_skills(sanitized)
    resume_skills_lower = {s.lower() for s in resume_skills}
    exp_level = preferences.experienceLevelOverride or classify_experience_level(sanitized)
    edu_level = _infer_education_level(sanitized)
    full_blob = json.dumps(sanitized).lower()

    scored_roles: List[Tuple[int, Dict[str, Any], List[str], List[str]]] = []
    for role in _ROLE_CATALOG:
        matched = []
        missing = []
        for sk in role["skills"]:
            if sk.lower() in resume_skills_lower or sk.lower() in full_blob:
                matched.append(sk)
            else:
                missing.append(sk)
        # Rank by overlap + domain relevance
        overlap_bonus = len(matched) * 15
        if any(w in str(sanitized.get("headline") or "").lower() for w in role["title"].lower().split()):
            overlap_bonus += 20
        scored_roles.append((overlap_bonus, role, matched, missing))

    scored_roles.sort(key=lambda x: x[0], reverse=True)
    selected = scored_roles[:14]

    is_intern_pref = preferences.jobType == "internship" or exp_level in ("Student", "Intern")
    recommendations = []
    for idx, (_, role, matched, missing) in enumerate(selected):
        title = role["title"]
        if is_intern_pref and "intern" not in title.lower() and idx < 6:
            display_title = f"{title} Intern"
            role_exp = "Intern"
        else:
            display_title = title
            role_exp = exp_level

        score, breakdown = compute_role_match_score(
            sanitized, matched, missing, display_title, weights
        )
        evidence = []
        if matched:
            evidence.append(f"Skills matched from resume: {', '.join(matched[:4])}")
        if sanitized.get("projects"):
            evidence.append(f"{len(sanitized['projects'])} project(s) listed in resume")
        if sanitized.get("experience") or sanitized.get("internships"):
            evidence.append("Work / internship history in resume")
        if sanitized.get("education"):
            evidence.append(f"Education: {edu_level}")

        why_matches = []
        if matched:
            why_matches.append(f"Aligns with your documented skills in {', '.join(matched[:4])}.")
        if sanitized.get("projects"):
            why_matches.append("Supported by hands-on projects in your resume.")
        if not why_matches:
            why_matches.append("Transferable academic and analytical foundation.")

        recommendations.append({
            "id": f"role_{idx + 1}",
            "title": display_title,
            "category": role["category"],
            "industry": role["industry"],
            "experience_level": role_exp,
            "estimated_match_score": score,
            "score_breakdown": breakdown.model_dump(),
            "why_matches": why_matches,
            "matched_skills": matched,
            "missing_from_resume_skills": missing,
            "recommended_learning_topics": role["learn"],
            "alternative_titles": [title, f"Junior {title}" if "Intern" not in display_title else title],
            "search_keywords": [display_title] + matched[:3],
            "search_relevance_score": min(99, max(50, score + 4)),
            "evidence": evidence,
        })

    top_cats = []
    for r in recommendations[:5]:
        if r["category"] not in top_cats:
            top_cats.append(r["category"])

    primary_domain = top_cats[0] if top_cats else "General Professional"
    secondary_domains = top_cats[1:4]

    missing_freq: List[str] = []
    for r in recommendations[:8]:
        for ms in r["missing_from_resume_skills"]:
            if ms not in missing_freq and ms.lower() not in resume_skills_lower:
                missing_freq.append(ms)

    return {
        "career_profile": {
            "primary_domain": primary_domain,
            "secondary_domains": secondary_domains,
            "recommended_job_titles": [r["title"] for r in recommendations[:6]],
            "technical_strengths": resume_skills[:8],
            "transferable_skills": ["Problem Solving", "Technical Communication", "Collaboration"],
            "experience_level": exp_level,
            "education_level": edu_level,
            "relevant_industries": list(dict.fromkeys(r["industry"] for r in recommendations[:5])),
            "preferred_work_type": preferences.workMode.title() if preferences.workMode != "any" else "Any",
            "potential_career_paths": [f"{primary_domain} Specialist", f"{primary_domain} Lead"],
            "missing_or_underrepresented_skills": missing_freq[:10],
            "top_skills": resume_skills[:10],
        },
        "recommendations": recommendations,
    }


def _deduplicate_recommendations(recs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    unique = []
    for r in recs:
        key = re.sub(r"\s+", " ", str(r.get("title") or "").strip().lower())
        if not key or key in seen:
            continue
        seen.add(key)
        unique.append(r)
    return unique


async def analyze_resume_for_career(
    resume_data: Dict[str, Any],
    preferences: CareerPreferences,
    weights: MatchScoreWeights,
) -> CareerAnalysisResponse:
    if is_resume_meaningfully_empty(resume_data):
        raise ValueError("Resume data is empty. Please add or upload your resume before requesting job recommendations.")

    sanitized = strip_pii_for_career_analysis(resume_data)
    fingerprint = compute_resume_fingerprint(sanitized, preferences)
    exp_level = preferences.experienceLevelOverride or classify_experience_level(sanitized)
    edu_level = _infer_education_level(sanitized)
    resume_skills = _extract_all_resume_skills(sanitized)

    provider_used = "local_heuristic"
    ai_payload: Optional[Dict[str, Any]] = None

    use_gemini = (
        (settings.AI_PROVIDER or "auto").lower().strip() in ("auto", "gemini")
        and bool(settings.GEMINI_API_KEY)
    )

    if use_gemini:
        prompt = f"""You are a Senior AI Career Architect.
Analyze the anonymized structured resume below and generate a career profile plus 12 to 18 personalized job role recommendations.

STRICT RULES:
1. ZERO FABRICATION: Base every claim on actual evidence from the resume. Do not invent skills, degrees, companies, salaries, or live job vacancies.
2. EXPERIENCE LEVEL: Use "{exp_level}" unless resume evidence clearly dictates one of: Student, Fresher, Intern, Entry-level, Junior professional, Mid-level professional, Senior professional.
3. CATEGORIES: Only recommend categories supported by the profile (e.g., Software Development, Data Analytics, Data Science, Artificial Intelligence, Machine Learning, Generative AI, Cloud and DevOps, Cybersecurity, Business Analytics, Product and Project Management, UI/UX and Design, Research and Academia, or domain-matched industries).
4. PREFERENCES: Job Type="{preferences.jobType}", Work Mode="{preferences.workMode}", Location="{preferences.location or preferences.locationType}".
5. Return ONLY valid JSON matching this schema:
{{
  "career_profile": {{
    "primary_domain": "",
    "secondary_domains": [],
    "recommended_job_titles": [],
    "technical_strengths": [],
    "transferable_skills": [],
    "experience_level": "{exp_level}",
    "education_level": "{edu_level}",
    "relevant_industries": [],
    "preferred_work_type": "{preferences.workMode}",
    "potential_career_paths": [],
    "missing_or_underrepresented_skills": [],
    "top_skills": []
  }},
  "recommendations": [
    {{
      "title": "",
      "category": "",
      "industry": "",
      "experience_level": "",
      "why_matches": [],
      "matched_skills": [],
      "missing_from_resume_skills": [],
      "recommended_learning_topics": [],
      "alternative_titles": [],
      "search_keywords": [],
      "evidence": []
    }}
  ]
}}

ANONYMIZED RESUME JSON:
{json.dumps(sanitized, ensure_ascii=False)[:18000]}
"""
        try:
            gemini = GeminiProvider()
            res = await gemini._call_gemini(prompt, timeout_seconds=25.0)
            if isinstance(res, dict) and isinstance(res.get("recommendations"), list) and len(res["recommendations"]) >= 5:
                ai_payload = res
                provider_used = "gemini"
        except Exception as exc:
            logger.warning("Gemini career analysis fallback triggered: %s", exc)

    if not ai_payload:
        ai_payload = _heuristic_career_analysis(sanitized, preferences, weights)
        provider_used = "local_heuristic"

    raw_profile = ai_payload.get("career_profile") or {}
    if raw_profile.get("experience_level") not in ALLOWED_EXPERIENCE_LEVELS:
        raw_profile["experience_level"] = exp_level

    career_profile = CareerProfile(
        primary_domain=str(raw_profile.get("primary_domain") or "General").strip(),
        secondary_domains=list(raw_profile.get("secondary_domains") or [])[:5],
        recommended_job_titles=list(raw_profile.get("recommended_job_titles") or [])[:8],
        technical_strengths=list(raw_profile.get("technical_strengths") or resume_skills[:8]),
        transferable_skills=list(raw_profile.get("transferable_skills") or [])[:6],
        experience_level=str(raw_profile.get("experience_level") or exp_level),
        education_level=str(raw_profile.get("education_level") or edu_level),
        relevant_industries=list(raw_profile.get("relevant_industries") or [])[:6],
        preferred_work_type=str(raw_profile.get("preferred_work_type") or preferences.workMode),
        potential_career_paths=list(raw_profile.get("potential_career_paths") or [])[:5],
        missing_or_underrepresented_skills=list(raw_profile.get("missing_or_underrepresented_skills") or [])[:12],
        top_skills=list(raw_profile.get("top_skills") or resume_skills[:10]),
    )

    deduped_raw = _deduplicate_recommendations(ai_payload.get("recommendations") or [])[:20]
    # Ensure 10-20 recommendations by supplementing from heuristic catalog if Gemini returned < 10
    if len(deduped_raw) < 10:
        fallback_recs = _heuristic_career_analysis(sanitized, preferences, weights)["recommendations"]
        existing_titles = {r["title"].lower() for r in deduped_raw if r.get("title")}
        for fr in fallback_recs:
            if fr["title"].lower() not in existing_titles:
                deduped_raw.append(fr)
                existing_titles.add(fr["title"].lower())
            if len(deduped_raw) >= 12:
                break

    recommendations: List[RecommendedRole] = []
    for idx, r in enumerate(deduped_raw):
        title = str(r.get("title") or "").strip()
        if not title:
            continue
        matched = [str(s).strip() for s in (r.get("matched_skills") or []) if str(s).strip()]
        missing = [str(s).strip() for s in (r.get("missing_from_resume_skills") or []) if str(s).strip()]
        role_exp = str(r.get("experience_level") or exp_level).strip()

        score, breakdown = compute_role_match_score(sanitized, matched, missing, title, weights)
        links = generate_job_search_links(
            role_title=title,
            skills=matched or resume_skills[:3],
            preferences=preferences,
            experience_level=role_exp,
        )

        recommendations.append(
            RecommendedRole(
                id=str(r.get("id") or f"role_{idx + 1}"),
                title=title,
                category=str(r.get("category") or career_profile.primary_domain).strip(),
                industry=str(r.get("industry") or "Technology").strip(),
                experience_level=role_exp,
                estimated_match_score=score,
                score_breakdown=breakdown,
                why_matches=[str(w).strip() for w in (r.get("why_matches") or []) if str(w).strip()],
                matched_skills=matched,
                missing_from_resume_skills=missing,
                recommended_learning_topics=[str(t).strip() for t in (r.get("recommended_learning_topics") or []) if str(t).strip()],
                alternative_titles=[str(a).strip() for a in (r.get("alternative_titles") or []) if str(a).strip()],
                search_keywords=[str(k).strip() for k in (r.get("search_keywords") or [title]) if str(k).strip()],
                search_relevance_score=min(99, max(50, score + 3)),
                evidence=[str(ev).strip() for ev in (r.get("evidence") or []) if str(ev).strip()],
                search_links=links,
            )
        )

    recommendations.sort(key=lambda x: x.estimated_match_score, reverse=True)

    frequently_requested: List[str] = []
    missing_from_resume: List[str] = []
    learning_priorities: List[str] = []
    resume_skills_lower = {s.lower() for s in resume_skills}

    for rec in recommendations[:10]:
        for s in rec.matched_skills + rec.missing_from_resume_skills:
            if s not in frequently_requested:
                frequently_requested.append(s)
        for ms in rec.missing_from_resume_skills:
            if ms.lower() not in resume_skills_lower and ms not in missing_from_resume:
                missing_from_resume.append(ms)
        for lp in rec.recommended_learning_topics:
            if lp not in learning_priorities:
                learning_priorities.append(lp)

    skills_gap = SkillsGapSummary(
        existing_skills=resume_skills[:20],
        frequently_requested_skills=frequently_requested[:16],
        missing_from_resume=missing_from_resume[:14],
        learning_priorities=learning_priorities[:10],
    )

    return CareerAnalysisResponse(
        career_profile=career_profile,
        recommendations=recommendations,
        skills_gap=skills_gap,
        is_verified_live_vacancies=False,
        provider_used=provider_used,
        prompt_version=CAREER_PROMPT_VERSION,
        generated_at=datetime.now(timezone.utc).isoformat(),
        resume_fingerprint=fingerprint,
    )


async def generate_role_details(req: RoleDetailsRequest) -> RoleDetailsResponse:
    sanitized = strip_pii_for_career_analysis(req.resume_data)
    role = req.role
    projs = [
        str(p.get("name") or "").strip()
        for p in (sanitized.get("projects") or [])
        if isinstance(p, dict) and str(p.get("name") or "").strip()
    ]
    edus = [
        f"{e.get('degree', '')} — {e.get('institution', '')}".strip(" —")
        for e in (sanitized.get("education") or [])
        if isinstance(e, dict) and (e.get("degree") or e.get("institution"))
    ]

    links = generate_job_search_links(
        role_title=role.title,
        skills=role.matched_skills or role.search_keywords,
        preferences=req.preferences,
        experience_level=role.experience_level,
    )

    missing_kw = role.missing_from_resume_skills[:8]
    learn_topics = role.recommended_learning_topics[:6]

    return RoleDetailsResponse(
        title=role.title,
        category=role.category,
        industry=role.industry,
        experience_level=role.experience_level,
        typical_responsibilities=[
            f"Design, build, and maintain production solutions aligned with {role.title} workflows.",
            f"Collaborate cross-functionally on architecture, quality reviews, and delivery milestones.",
            f"Measure performance, reliability, and business impact using domain-standard metrics.",
        ],
        common_qualifications=[
            f"Foundational competence in {', '.join((role.matched_skills or role.missing_from_resume_skills)[:4]) or role.category}.",
            f"Relevant degree, portfolio projects, or practical experience for {role.experience_level} level.",
        ],
        matched_skills=role.matched_skills,
        relevant_projects=projs[:5],
        relevant_education=edus[:3],
        missing_resume_keywords=missing_kw,
        areas_to_strengthen=[
            f"Highlight measurable outcomes when showcasing {sk}." for sk in (role.matched_skills[:2] or [role.category])
        ] + [f"Consider adding evidence of {kw} if you have worked with it." for kw in missing_kw[:2]],
        suggested_projects=[
            f"End-to-end {role.title} capstone incorporating {', '.join(missing_kw[:2]) or role.category} with documented benchmarks.",
            f"Open-source or portfolio case study demonstrating real-world problem solving for {role.industry}.",
        ],
        skills_to_learn=learn_topics or missing_kw[:4],
        interview_preparation_topics=[
            f"Core {role.category} fundamentals and trade-off discussions",
            f"Deep-dive walkthrough of your projects ({projs[0] if projs else 'portfolio work'})",
            "Scenario-based debugging, system/workflow design, and behavioral STAR stories",
        ],
        portfolio_improvements=[
            "Include architecture diagrams, live demos or screenshots, and clear READMEs for top projects.",
            "Quantify latency, accuracy, cost, or user-impact improvements where genuinely achieved.",
        ],
        resume_improvements=[
            f"Tailor your headline and summary to reflect {role.title} alignment.",
            f"Surface missing resume keywords ({', '.join(missing_kw[:4])}) only if you actually possess them.",
        ],
        certifications_to_consider=[
            f"Industry-recognized {role.category} credential aligned with {role.experience_level} roles."
        ],
        search_links=links,
    )
