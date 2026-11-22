from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_RESUME = {
    "personalInfo": {
        "fullName": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "+1 234 567 8900",
        "location": "New York, NY"
    },
    "professionalSummary": "Experienced Software Engineer with a passion for building scalable web platforms.",
    "experience": [
        {
            "company": "Tech Corp",
            "position": "Software Engineer",
            "startDate": "2020-01",
            "endDate": "2023-01",
            "responsibilities": [
                "Engineered scalable microservices handling 10k requests per second."
            ]
        }
    ],
    "skills": [
        {
            "category": "Technical",
            "items": ["Python", "React", "Docker", "PostgreSQL", "AWS"]
        }
    ]
}

def test_ats_analyze_endpoint():
    payload = {
        "resume_data": SAMPLE_RESUME,
        "job_description": "Looking for a Python and React developer with Docker and AWS experience."
    }
    res = client.post("/api/v1/ats/analyze", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["compatibility_score"] > 60
    assert "Python" in data["matched_keywords"] or "React" in data["matched_keywords"]
    assert "contact" in data["section_feedback"]

def test_job_analyzer_endpoint():
    payload = {
        "job_title": "Full Stack Developer",
        "company": "NextGen AI",
        "job_description": "We are looking for a Senior Developer with 5+ years experience in Python, FastAPI, React, TypeScript, Docker, and PostgreSQL. Must have strong leadership skills."
    }
    res = client.post("/api/v1/jobs/analyze", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert "Python" in data["technical_skills"] or "Fastapi" in data["technical_skills"] or "React" in data["technical_skills"]
    assert len(data["soft_skills"]) > 0
