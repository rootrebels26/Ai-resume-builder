import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api.routes import health, ai, ats, resume
from app.schemas.ai_schema import GenerateSummaryRequest, ImproveBulletRequest
from app.schemas.job_schema import ATSAnalyzeRequest, TailorResumeRequest

async def test_direct_routes():
    print("Direct route execution test starting...", flush=True)

    # 1. Health
    h = await health.health_check()
    assert h["success"] is True
    print("✓ Health route works directly:", h["data"])

    # 2. Summary
    req_summary = GenerateSummaryRequest(role="Frontend Lead", key_skills=["React", "Tailwind"])
    s = await ai.generate_summary(req_summary)
    assert s["success"] is True
    assert len(s["data"]["summaries"]) >= 3
    print("✓ AI Summary route works directly:", s["data"]["selected_summary"][:60])

    # 3. Bullet
    req_bullet = ImproveBulletRequest(bullet="led frontend migration to react", role="Frontend Lead")
    b = await ai.improve_bullet(req_bullet)
    assert b["success"] is True
    print("✓ AI Bullet route works directly:", len(b["data"]["options"]), "options")

    # 4. ATS
    req_ats = ATSAnalyzeRequest(
        resume_data={"personalInfo": {"fullName": "Test User", "email": "test@test.com"}},
        job_description="Python React"
    )
    a = await ats.analyze_ats(req_ats)
    assert a["success"] is True
    print("✓ ATS analyze route works directly, score:", a["data"]["compatibility_score"])

    # 6. Tailor
    req_tailor = TailorResumeRequest(
        resume_data={"personalInfo": {"fullName": "Test User"}, "professionalSummary": "Experienced dev."},
        job_description="Python React developer",
        job_title="Senior Python Dev"
    )
    t = await resume.tailor_resume(req_tailor)
    assert t["success"] is True
    print("✓ Tailor route works directly:", t["data"]["tailored_summary"][:60])

    print("\nALL DIRECT BACKEND ROUTES VERIFIED AND FULLY FUNCTIONAL!")

if __name__ == "__main__":
    asyncio.run(test_direct_routes())
