import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.utils.url_validation import validate_external_url, strip_html_safely
from app.services.job_normalizer import (
    normalize_freehire_job,
    normalize_remotive_job,
    normalize_arbeitnow_job,
)
from app.services.job_deduplication import deduplicate_jobs
from app.services.job_matching_service import (
    compute_tfidf_cosine,
    score_resume_against_job,
    generate_editable_career_profile,
)
from app.schemas.job_match import HybridMatchWeights


def _drive(coro):
    try:
        coro.send(None)
    except StopIteration as exc:
        return exc.value
    raise RuntimeError("Unexpected yield")


SAMPLE_RESUME = {
    "personalInfo": {"professionalTitle": "Junior Python & ML Engineer"},
    "professionalSummary": "Fresher building FastAPI backends and Scikit-learn ML pipelines.",
    "education": [{"degree": "B.Tech CSE", "institution": "IIIT"}],
    "internships": [{"position": "ML Intern", "company": "TechLab", "responsibilities": ["Built Python NLP APIs"]}],
    "projects": [{"name": "Interview AI", "technologies": ["Python", "FastAPI", "Scikit-learn"], "description": "ML readiness classifier."}],
    "skills": [{"category": "Tech", "items": ["Python", "FastAPI", "SQL", "Docker", "Scikit-learn"]}],
    "certifications": [{"name": "SQL Basic", "issuer": "HackerRank"}],
}


def test_url_validation_and_html_sanitization():
    assert validate_external_url("https://freehire.me/jobs/123") == "https://freehire.me/jobs/123"
    assert validate_external_url("javascript:alert(1)") == ""
    assert validate_external_url("http://localhost:8000/admin") == ""
    assert validate_external_url("http://127.0.0.1/secret") == ""
    assert validate_external_url("http://10.0.0.1/internal") == ""

    cleaned = strip_html_safely("<script>alert(1)</script><h2>Role</h2><p>Python &amp; FastAPI\xad Dev</p>")
    assert "alert" not in cleaned
    assert "Python & FastAPI Dev" in cleaned


def test_normalizers_and_deduplication():
    fh = normalize_freehire_job({
        "title": "Py\xadthon ML Intern",
        "company": "Acme AI",
        "apply_url": "https://freehire.me/api/v1/go/acme-ml",
        "description": "<p>Build Python and FastAPI microservices.</p>",
        "work_mode": "remote",
        "skills": ["Python", "FastAPI"],
        "source": "greenhouse",
    })
    rem = normalize_remotive_job({
        "title": "Python ML Intern",
        "company_name": "Acme AI",
        "url": "https://remotive.com/remote-jobs/acme-ml",
        "description": "<p>Build Python and FastAPI microservices with Docker and SQL.</p>",
        "tags": ["Python", "FastAPI", "Docker", "SQL"],
        "job_type": "internship",
    })
    arb = normalize_arbeitnow_job({
        "title": "Data Analyst",
        "company_name": "DataCorp",
        "url": "https://www.arbeitnow.com/jobs/datacorp",
        "description": "<p>SQL and Power BI analytics.</p>",
        "remote": True,
        "tags": ["SQL"],
        "job_types": ["full-time"],
    })
    assert fh is not None and rem is not None and arb is not None
    assert "\xad" not in fh.title
    assert fh.is_fresher_friendly is True

    deduped = deduplicate_jobs([fh, rem, arb])
    assert len(deduped) == 2  # fh and rem share (title, company), richer one kept
    kept = next(j for j in deduped if j.company == "Acme AI")
    assert "Docker" in kept.required_skills


def test_tfidf_and_hybrid_scoring():
    sim_high = compute_tfidf_cosine("Python FastAPI Docker machine learning", "Python FastAPI developer with Docker")
    sim_low = compute_tfidf_cosine("Python FastAPI Docker", "Registered Nurse ICU hospital")
    assert sim_high > sim_low

    job = normalize_remotive_job({
        "title": "Junior Python & ML Engineer",
        "company_name": "AI Labs",
        "url": "https://remotive.com/remote-jobs/ai-labs",
        "description": "<p>Looking for Fresher / Intern with Python, FastAPI, Scikit-learn, Kubernetes.</p>",
        "tags": ["Python", "FastAPI", "Scikit-learn", "Kubernetes"],
        "job_type": "internship",
    })
    scored = score_resume_against_job(SAMPLE_RESUME, job, HybridMatchWeights())
    assert 0 <= scored.match_score <= 100
    assert "Python" in scored.matching_skills
    assert "Kubernetes" in scored.missing_or_unverified_skills
    assert scored.breakdown.weights_used["required_skills"] == 0.35


def test_editable_career_profile_generation():
    prof = _drive(generate_editable_career_profile(SAMPLE_RESUME))
    assert prof.experience_level in ("Student", "Intern", "Fresher", "Entry-level")
    assert "Python" in prof.skills
    assert len(prof.target_roles) >= 3
