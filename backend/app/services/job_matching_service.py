import json
import logging
import math
import re
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings
from app.providers.gemini import GeminiProvider
from app.schemas.job_match import (
    EditableCareerProfile,
    HybridMatchWeights,
    JobMatchBreakdown,
    MatchedJob,
    NormalizedJob,
)
from app.services.career_service import (
    _extract_all_resume_skills,
    _infer_education_level,
    classify_experience_level,
    compute_resume_fingerprint,
    strip_pii_for_career_analysis,
)
from app.utils.job_cache import career_profile_cache

logger = logging.getLogger("job_matching_service")

_TOKEN_RE = re.compile(r"[a-z0-9+#.]{2,}")


def _tokenize(text: str) -> List[str]:
    return _TOKEN_RE.findall((text or "").lower())


def compute_tfidf_cosine(doc_a: str, doc_b: str, corpus: Optional[List[str]] = None) -> float:
    """
    Pure-Python deterministic TF-IDF + cosine similarity (0.0 to 1.0).
    """
    tokens_a = _tokenize(doc_a)
    tokens_b = _tokenize(doc_b)
    if not tokens_a or not tokens_b:
        return 0.0

    docs = [tokens_a, tokens_b]
    if corpus:
        docs.extend(_tokenize(c) for c in corpus[:30] if c)

    n_docs = len(docs)
    df: Counter = Counter()
    for d in docs:
        df.update(set(d))

    def _vec(tokens: List[str]) -> Dict[str, float]:
        tf = Counter(tokens)
        total = max(1, len(tokens))
        return {
            t: (cnt / total) * (math.log((n_docs + 1) / (df[t] + 1)) + 1.0)
            for t, cnt in tf.items()
        }

    va = _vec(tokens_a)
    vb = _vec(tokens_b)
    common = set(va.keys()) & set(vb.keys())
    if not common:
        return 0.0

    dot = sum(va[t] * vb[t] for t in common)
    norm_a = math.sqrt(sum(v * v for v in va.values()))
    norm_b = math.sqrt(sum(v * v for v in vb.values()))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return round(min(1.0, max(0.0, dot / (norm_a * norm_b))), 4)


def _resume_to_text(sanitized: Dict[str, Any]) -> str:
    parts = [
        sanitized.get("headline") or "",
        sanitized.get("professionalSummary") or "",
    ]
    for e in sanitized.get("experience") or []:
        if isinstance(e, dict):
            parts.append(f"{e.get('position', '')} {e.get('company', '')} {' '.join(e.get('responsibilities') or [])}")
    for i in sanitized.get("internships") or []:
        if isinstance(i, dict):
            parts.append(f"{i.get('position', '')} {i.get('company', '')} {' '.join(i.get('responsibilities') or [])}")
    for p in sanitized.get("projects") or []:
        if isinstance(p, dict):
            parts.append(f"{p.get('name', '')} {p.get('description', '')} {' '.join(p.get('technologies') or [])}")
    for ed in sanitized.get("education") or []:
        if isinstance(ed, dict):
            parts.append(f"{ed.get('degree', '')} {ed.get('fieldOfStudy', '')} {ed.get('institution', '')}")
    parts.extend(_extract_all_resume_skills(sanitized))
    return " ".join(str(p) for p in parts if p)


def score_resume_against_job(
    resume_data: Dict[str, Any],
    job: NormalizedJob,
    weights: HybridMatchWeights,
    corpus_texts: Optional[List[str]] = None,
) -> MatchedJob:
    sanitized = strip_pii_for_career_analysis(resume_data)
    resume_skills = _extract_all_resume_skills(sanitized)
    resume_skills_lower = {s.lower() for s in resume_skills}
    resume_text = _resume_to_text(sanitized)
    resume_text_lower = resume_text.lower()

    job_text = f"{job.title} {job.company} {job.description_text} {' '.join(job.required_skills)}"
    cosine = compute_tfidf_cosine(resume_text, job_text, corpus=corpus_texts)

    # 1. Required Skill Match (35%)
    req_skills = job.required_skills or []
    matching_skills: List[str] = []
    missing_skills: List[str] = []
    for sk in req_skills:
        sk_low = sk.lower()
        if sk_low in resume_skills_lower or sk_low in resume_text_lower:
            matching_skills.append(sk)
        else:
            missing_skills.append(sk)

    if req_skills:
        skill_ratio = len(matching_skills) / len(req_skills)
    else:
        skill_ratio = min(1.0, 0.4 + cosine)

    # 2. Relevant Experience (20%)
    exps = (sanitized.get("experience") or []) + (sanitized.get("internships") or [])
    user_exp_level = classify_experience_level(sanitized)
    if job.is_fresher_friendly and user_exp_level in ("Student", "Intern", "Fresher", "Entry-level"):
        exp_ratio = 0.90 if exps else 0.72
    elif exps:
        exp_ratio = min(1.0, 0.55 + cosine * 0.65)
    else:
        exp_ratio = 0.45 if job.is_fresher_friendly else 0.25

    # 3. Education Compatibility (15%)
    edus = sanitized.get("education") or []
    edu_ratio = 0.85 if edus else 0.40

    # 4. Project Relevance (15%)
    projs = sanitized.get("projects") or []
    if projs:
        proj_blob = " ".join(f"{p.get('name', '')} {p.get('description', '')} {' '.join(p.get('technologies') or [])}" for p in projs if isinstance(p, dict))
        proj_cos = compute_tfidf_cosine(proj_blob, job_text)
        proj_ratio = min(1.0, 0.45 + proj_cos * 0.85)
    else:
        proj_ratio = 0.25

    # 5. Title & Role Similarity (10%)
    headline = str(sanitized.get("headline") or "").lower()
    title_tokens = set(_tokenize(job.title))
    head_tokens = set(_tokenize(headline))
    if title_tokens and head_tokens:
        overlap = len(title_tokens & head_tokens) / max(1, len(title_tokens))
        title_ratio = min(1.0, 0.25 + overlap * 0.75)
    else:
        title_ratio = min(1.0, 0.30 + cosine)

    # 6. Certifications (5%)
    certs = sanitized.get("certifications") or []
    cert_ratio = min(1.0, 0.40 + 0.25 * len(certs)) if certs else 0.25

    total_w = (
        weights.required_skills
        + weights.experience
        + weights.education
        + weights.projects
        + weights.title_similarity
        + weights.certifications
    ) or 1.0

    weighted = (
        skill_ratio * weights.required_skills
        + exp_ratio * weights.experience
        + edu_ratio * weights.education
        + proj_ratio * weights.projects
        + title_ratio * weights.title_similarity
        + cert_ratio * weights.certifications
    ) / total_w

    # Blend 80% structured rubric + 20% TF-IDF cosine similarity
    blended = (0.80 * weighted) + (0.20 * min(1.0, cosine * 1.8))
    final_score = max(5, min(98, int(round(blended * 100))))

    reasons: List[str] = []
    if matching_skills:
        reasons.append(f"Matches {len(matching_skills)} skill(s) from your resume: {', '.join(matching_skills[:5])}.")
    if job.is_fresher_friendly and user_exp_level in ("Student", "Intern", "Fresher", "Entry-level"):
        reasons.append("Listing indicates fresher/internship/entry-level friendliness matching your career stage.")
    if cosine >= 0.15:
        reasons.append(f"Strong keyword & domain similarity (TF-IDF cosine {cosine:.2f}).")
    if not reasons:
        reasons.append("Partial domain and academic alignment; review missing resume keywords below.")

    improvements: List[str] = []
    if missing_skills:
        improvements.append(
            f"If you have experience with {', '.join(missing_skills[:4])}, add concrete bullet evidence to your resume."
        )
    if not projs:
        improvements.append("Add 1-2 relevant projects demonstrating hands-on implementation for this role.")

    breakdown = JobMatchBreakdown(
        required_skill_match=round(skill_ratio * 100, 1),
        relevant_experience=round(exp_ratio * 100, 1),
        education_compatibility=round(edu_ratio * 100, 1),
        project_relevance=round(proj_ratio * 100, 1),
        title_similarity=round(title_ratio * 100, 1),
        certifications=round(cert_ratio * 100, 1),
        tfidf_cosine_similarity=cosine,
        weights_used={
            "required_skills": round(weights.required_skills / total_w, 2),
            "experience": round(weights.experience / total_w, 2),
            "education": round(weights.education / total_w, 2),
            "projects": round(weights.projects / total_w, 2),
            "title_similarity": round(weights.title_similarity / total_w, 2),
            "certifications": round(weights.certifications / total_w, 2),
        },
    )

    return MatchedJob(
        job=job,
        match_score=final_score,
        breakdown=breakdown,
        matching_skills=matching_skills,
        missing_or_unverified_skills=missing_skills,
        reasons_for_match=reasons,
        improvement_recommendations=improvements,
    )


async def generate_editable_career_profile(resume_data: Dict[str, Any]) -> EditableCareerProfile:
    sanitized = strip_pii_for_career_analysis(resume_data)
    fp = compute_resume_fingerprint(sanitized)
    cached = career_profile_cache.get(fp)
    if isinstance(cached, EditableCareerProfile):
        return cached

    skills = _extract_all_resume_skills(sanitized)
    exp_level = classify_experience_level(sanitized)
    edu_level = _infer_education_level(sanitized)
    certs = [str(c.get("name") or "").strip() for c in (sanitized.get("certifications") or []) if isinstance(c, dict) and c.get("name")]
    projs = [str(p.get("name") or "").strip() for p in (sanitized.get("projects") or []) if isinstance(p, dict) and p.get("name")]

    use_gemini = (
        (settings.AI_PROVIDER or "auto").lower().strip() in ("auto", "gemini")
        and bool(settings.GEMINI_API_KEY)
    )
    if use_gemini:
        prompt = f"""Generate a concise, factual JSON career profile strictly from this anonymized resume.
Never invent qualifications, experience, or skills.
Return ONLY valid JSON:
{{
  "career_summary": "",
  "experience_level": "{exp_level}",
  "target_roles": ["role1", "role2", "role3", "role4", "role5"],
  "skills": [],
  "preferred_industry": "",
  "employment_types": ["Internship", "Full-time"]
}}
RESUME:
{json.dumps(sanitized, ensure_ascii=False)[:12000]}"""
        try:
            gemini = GeminiProvider()
            res = await gemini._call_gemini(prompt, timeout_seconds=20.0)
            if isinstance(res, dict) and res.get("target_roles"):
                prof = EditableCareerProfile(
                    career_summary=str(res.get("career_summary") or sanitized.get("professionalSummary") or f"{exp_level} candidate").strip(),
                    experience_level=str(res.get("experience_level") or exp_level),
                    target_roles=[str(r).strip() for r in res.get("target_roles", []) if str(r).strip()][:10],
                    skills=[str(s).strip() for s in (res.get("skills") or skills) if str(s).strip()][:25],
                    preferred_locations=[],
                    preferred_work_modes=["Remote", "Hybrid", "On-site"],
                    employment_types=[str(t).strip() for t in (res.get("employment_types") or ["Internship", "Full-time"])],
                    preferred_industry=str(res.get("preferred_industry") or "").strip(),
                    education_summary=edu_level,
                    certifications=certs[:8],
                    projects_summary=projs[:6],
                )
                career_profile_cache.set(fp, prof)
                return prof
        except Exception as exc:
            logger.warning("Gemini editable career profile fallback: %s", exc)

    headline = sanitized.get("headline") or ""
    default_roles = [headline] if headline else []
    if any(k in " ".join(skills).lower() for k in ("python", "scikit", "pytorch", "ml", "ai")):
        default_roles.extend(["Machine Learning Engineer", "Data Scientist", "AI Engineer", "Python Developer", "Data Analyst"])
    else:
        default_roles.extend(["Software Engineer", "Backend Developer", "Full Stack Developer", "Analyst"])

    prof = EditableCareerProfile(
        career_summary=sanitized.get("professionalSummary") or f"{exp_level} candidate with skills in {', '.join(skills[:5]) or 'core domain fundamentals'}.",
        experience_level=exp_level,
        target_roles=list(dict.fromkeys(r for r in default_roles if r))[:8],
        skills=skills[:25],
        preferred_locations=[],
        preferred_work_modes=["Remote", "Hybrid", "On-site"],
        employment_types=["Internship", "Full-time"] if exp_level in ("Student", "Intern", "Fresher") else ["Full-time"],
        preferred_industry="",
        education_summary=edu_level,
        certifications=certs[:8],
        projects_summary=projs[:6],
    )
    career_profile_cache.set(fp, prof)
    return prof
