import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from httpx import AsyncClient, ASGITransport

async def run_all_tests():
    print("Initializing test client...", flush=True)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        print("Calling health endpoint...", flush=True)
        r = await client.get("/api/v1/health")
        print("Health status code:", r.status_code, flush=True)
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        print("✓ Health check passed:", data["data"]["status"])

        print("Testing summary generation...", flush=True)
        summary_payload = {
            "role": "Full Stack Engineer",
            "experience_level": "experienced",
            "key_skills": ["React", "FastAPI", "PostgreSQL", "Docker"]
        }
        r = await client.post("/api/v1/ai/generate-summary", json=summary_payload)
        assert r.status_code == 200
        assert len(r.json()["data"]["summaries"]) >= 3
        print("✓ AI Summary generation passed")

        print("Testing bullet improvement...", flush=True)
        bullet_payload = {
            "bullet": "built backend rest apis and connected react frontend with postgres",
            "role": "Full Stack Developer"
        }
        r = await client.post("/api/v1/ai/improve-bullet", json=bullet_payload)
        assert r.status_code == 200
        assert len(r.json()["data"]["options"]) >= 3
        print("✓ AI Bullet improvement passed")

        print("Testing job analyzer...", flush=True)
        job_payload = {
            "job_title": "Senior Software Engineer",
            "company": "TechNova Corp",
            "job_description": "We are seeking a Senior Software Engineer with 5+ years of experience in Python, FastAPI, React, TypeScript, Docker, and PostgreSQL. Must possess strong leadership, communication, and agile skills."
        }
        r = await client.post("/api/v1/jobs/analyze", json=job_payload)
        assert r.status_code == 200
        assert len(r.json()["data"]["technical_skills"]) > 0
        print("✓ Job analyzer passed")

        print("Testing ATS analyzer...", flush=True)
        sample_resume = {
            "personalInfo": {
                "fullName": "Alex Rivera",
                "email": "alex.rivera@example.com",
                "phone": "+1 (555) 234-5678",
                "location": "San Francisco, CA"
            },
            "professionalSummary": "Results-driven Senior Full Stack Engineer with 6+ years of experience architecting and delivering high-scale web platforms.",
            "experience": [
                {
                    "company": "Apex Cloud Solutions",
                    "position": "Senior Full Stack Engineer",
                    "startDate": "2021-06",
                    "endDate": "Present",
                    "responsibilities": [
                        "Architected and deployed a multi-tenant telemetry dashboard serving 250,000+ daily active users."
                    ]
                }
            ],
            "skills": [
                {
                    "category": "Technical",
                    "items": ["Python", "React", "FastAPI", "Docker", "PostgreSQL"]
                }
            ]
        }
        ats_payload = {
            "resume_data": sample_resume,
            "job_description": "We need an engineer with Python, React, FastAPI, Docker, and PostgreSQL experience."
        }
        r = await client.post("/api/v1/ats/analyze", json=ats_payload)
        assert r.status_code == 200
        assert r.json()["data"]["compatibility_score"] > 60
        print("✓ ATS analyzer passed")

        print("Testing resume tailor...", flush=True)
        tailor_payload = {
            "resume_data": sample_resume,
            "job_description": "We need a Senior Full Stack Engineer proficient in Python and React.",
            "job_title": "Lead Software Engineer"
        }
        r = await client.post("/api/v1/resume/tailor", json=tailor_payload)
        assert r.status_code == 200
        assert len(r.json()["data"]["tailored_summary"]) > 20
        print("✓ Resume tailoring passed")

    print("\nALL BACKEND API TESTS COMPLETED AND PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
