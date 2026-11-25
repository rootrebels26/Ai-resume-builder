from fastapi.testclient import TestClient
from app.core.config import settings
# Force local provider during unit tests to avoid network timeouts in sandboxed environments
settings.AI_PROVIDER = "local"
from app.main import app

client = TestClient(app)

def test_generate_summary_endpoint():
    payload = {
        "role": "Full Stack Engineer",
        "experience_level": "experienced",
        "key_skills": ["React", "FastAPI", "PostgreSQL", "Docker"]
    }
    res = client.post("/api/v1/ai/generate-summary", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert len(body["data"]["summaries"]) >= 1
    assert "Full Stack Engineer" in body["data"]["selected_summary"]

def test_improve_bullet_endpoint():
    payload = {
        "bullet": "worked on optimizing database queries and frontend api calls",
        "role": "Backend Engineer"
    }
    res = client.post("/api/v1/ai/improve-bullet", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert len(body["data"]["options"]) >= 3
