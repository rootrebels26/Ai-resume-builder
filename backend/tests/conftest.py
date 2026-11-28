import pytest
from app.core.config import settings

@pytest.fixture(autouse=True)
def disable_external_network_in_tests(monkeypatch):
    """Ensure all automated tests use deterministic local processing with zero external API calls or timeouts."""
    monkeypatch.setattr(settings, "APP_ENV", "testing")
    monkeypatch.setattr(settings, "AI_PROVIDER", "local")
    monkeypatch.setattr(settings, "GROQ_API_KEY", None)
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", None)
    monkeypatch.setenv("APP_ENV", "testing")
    monkeypatch.setenv("AI_PROVIDER", "local")
