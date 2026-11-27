import os
import sys
import pytest
from urllib.parse import urlparse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas.career_schema import (
    CareerPreferences,
    MatchScoreWeights,
    CareerAnalysisResponse,
    RoleDetailsRequest,
)
from app.services.job_url_engine import (
    generate_job_search_links,
    SUPPORTED_PLATFORMS,
)
from app.services.job_provider_adapter import NoKeyExternalSearchProvider
from app.services.career_service import (
    strip_pii_for_career_analysis,
    is_resume_meaningfully_empty,
    classify_experience_level,
    compute_role_match_score,
    compute_resume_fingerprint,
    analyze_resume_for_career,
    generate_role_details,
)


def _drive(coro):
    """Run coroutine with no I/O awaits without socketpair in sandbox."""
    try:
        coro.send(None)
    except StopIteration as exc:
        return exc.value
    raise RuntimeError("Unexpected yield")


SAMPLE_STUDENT_RESUME = {
    "personalInfo": {
        "fullName": "Sagnik Sen",
        "email": "sagnik.sen@example.com",
        "phone": "+91 9876543210",
        "location": "Habra, West Bengal, India",
        "professionalTitle": "Software Development Engineer | ML Intern",
        "linkedin": "https://linkedin.com/in/sagnik-sen",
        "github": "https://github.com/hashingsoul",
    },
    "professionalSummary": "IIT Madras BS student building Python backend services and ML applications.",
    "education": [
        {
            "institution": "IIT Madras",
            "degree": "BS in Data Science and Applications",
            "endDate": "Present",
        }
    ],
    "experience": [],
    "internships": [
        {
            "company": "Learn Depth",
            "position": "Machine Learning Engineer Intern",
            "responsibilities": ["Trained Scikit-learn and PyTorch models in Python"],
        }
    ],
    "projects": [
        {
            "name": "AI Interview Preparation System",
            "technologies": ["Python", "Streamlit", "Scikit-learn", "FastAPI"],
            "description": "Built ML interview readiness predictor.",
        }
    ],
    "skills": [
        {"category": "Languages", "items": ["Python", "SQL", "JavaScript"]},
        {"category": "ML & Backend", "items": ["FastAPI", "Scikit-learn", "Docker", "Git"]},
    ],
    "certifications": [
        {"name": "SQL (Basic)", "issuer": "HackerRank", "issueDate": "2026"}
    ],
}


def test_pii_stripping_for_privacy():
    sanitized = strip_pii_for_career_analysis(SAMPLE_STUDENT_RESUME)
    blob = str(sanitized)
    assert "Sagnik Sen" not in blob
    assert "sagnik.sen@example.com" not in blob
    assert "9876543210" not in blob
    assert "linkedin.com/in/sagnik-sen" not in blob
    assert "hashingsoul" not in blob
    assert sanitized["headline"] == "Software Development Engineer | ML Intern"


def test_empty_resume_rejected():
    assert is_resume_meaningfully_empty({}) is True
    assert is_resume_meaningfully_empty({"personalInfo": {"fullName": "Only Name"}}) is True
    assert is_resume_meaningfully_empty(SAMPLE_STUDENT_RESUME) is False
    with pytest.raises(ValueError):
        _drive(analyze_resume_for_career({}, CareerPreferences(), MatchScoreWeights()))


def test_experience_classification_student_and_senior():
    san_student = strip_pii_for_career_analysis(SAMPLE_STUDENT_RESUME)
    assert classify_experience_level(san_student) == "Intern"

    senior_resume = {
        "personalInfo": {"professionalTitle": "Senior Staff Architect"},
        "experience": [
            {"position": "Software Engineer"},
            {"position": "Senior Engineer"},
            {"position": "Lead Engineer"},
            {"position": "Staff Architect"},
        ],
    }
    assert classify_experience_level(strip_pii_for_career_analysis(senior_resume)) == "Senior professional"


def test_match_score_boundaries_and_reproducibility():
    san = strip_pii_for_career_analysis(SAMPLE_STUDENT_RESUME)
    w = MatchScoreWeights()
    s1, b1 = compute_role_match_score(san, ["Python", "FastAPI"], ["Kubernetes"], "Backend Developer", w)
    s2, b2 = compute_role_match_score(san, ["Python", "FastAPI"], ["Kubernetes"], "Backend Developer", w)
    assert s1 == s2
    assert 0 <= s1 <= 100
    assert b1.weights_used["skills"] == 0.4


def test_search_url_generation_all_8_platforms_and_encoding():
    prefs = CareerPreferences(
        location="Bengaluru",
        locationType="city",
        workMode="remote",
        jobType="internship",
    )
    links = generate_job_search_links(
        role_title="Machine Learning Engineer",
        skills=["Python", "C++ & PyTorch"],
        preferences=prefs,
        experience_level="Intern",
    )
    platforms = [l.platform for l in links]
    assert set(platforms) == set(SUPPORTED_PLATFORMS)
    for lnk in links:
        parsed = urlparse(lnk.url)
        assert parsed.scheme == "https"
        assert parsed.netloc
        assert " " not in lnk.url
        assert lnk.is_verified_live_listing is False

    # Missing location -> location-independent query
    no_loc_links = generate_job_search_links("Data Analyst", ["SQL"], CareerPreferences(locationType="none"))
    linkedin_url = next(l.url for l in no_loc_links if l.platform == "linkedin")
    assert "location=" not in linkedin_url


def test_full_career_analysis_pipeline_and_role_details():
    prefs = CareerPreferences(locationType="india", jobType="internship")
    resp: CareerAnalysisResponse = _drive(
        analyze_resume_for_career(SAMPLE_STUDENT_RESUME, prefs, MatchScoreWeights())
    )
    assert isinstance(resp, CareerAnalysisResponse)
    assert 10 <= len(resp.recommendations) <= 20
    assert resp.is_verified_live_vacancies is False
    titles = [r.title.lower() for r in resp.recommendations]
    assert len(titles) == len(set(titles)), "Duplicate recommendations found"
    assert resp.resume_fingerprint == compute_resume_fingerprint(
        strip_pii_for_career_analysis(SAMPLE_STUDENT_RESUME), prefs
    )

    details = _drive(
        generate_role_details(
            RoleDetailsRequest(
                resume_data=SAMPLE_STUDENT_RESUME,
                role=resp.recommendations[0],
                preferences=prefs,
            )
        )
    )
    assert details.title == resp.recommendations[0].title
    assert "no verified live vacancy" in details.salary_note.lower()
    assert len(details.search_links) == 8


def test_future_job_provider_adapter_status():
    adapter = NoKeyExternalSearchProvider()
    status = adapter.get_provider_status()
    assert status["requires_api_key"] is False
    assert status["live_vacancies_enabled"] is False
    assert _drive(adapter.search_jobs("Python Developer")) == []
