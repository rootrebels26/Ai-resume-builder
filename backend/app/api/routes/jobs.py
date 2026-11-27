from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from app.services.ai_service import ai_service
from app.schemas.job_schema import JobAnalyzeRequest, MatchResumeRequest, TailorResumeRequest
from app.schemas.career_schema import CareerPreferences
from app.schemas.job_match import (
    JobSearchRequest,
    JobSearchResponse,
    SingleJobMatchRequest,
)
from app.services.job_source_manager import collect_live_jobs, get_cached_job_by_id
from app.services.job_matching_service import score_resume_against_job
from app.services.job_url_engine import generate_job_search_links

router = APIRouter()


@router.get("/sources")
async def get_job_sources():
    _, statuses, cached = await collect_live_jobs(query="", force_refresh=False)
    return {
        "success": True,
        "data": {
            "sources": [s.model_dump() for s in statuses],
            "cached": cached,
        },
        "message": "Public job sources checked.",
        "error": None,
    }


@router.post("/search")
async def search_and_match_jobs(request: JobSearchRequest):
    query_str = request.query.strip()
    if not query_str and request.career_profile and request.career_profile.target_roles:
        query_str = request.career_profile.target_roles[0]

    raw_jobs, statuses, cached = await collect_live_jobs(query=query_str, force_refresh=False)

    # Apply metadata filters deterministically
    filtered = []
    q_low = query_str.lower()
    loc_low = request.location.strip().lower()
    comp_low = request.company.strip().lower()
    src_low = request.source.strip().lower()

    for j in raw_jobs:
        if q_low:
            haystack = f"{j.title} {j.company} {' '.join(j.required_skills)} {j.description_text[:600]}".lower()
            q_terms = [t for t in q_low.split() if len(t) >= 2]
            if q_terms and not any(t in haystack for t in q_terms):
                continue
        if loc_low and loc_low not in j.location.lower() and loc_low not in j.work_mode.lower():
            continue
        if request.work_mode != "any" and request.work_mode.lower() not in j.work_mode.lower():
            continue
        if request.employment_type != "any" and request.employment_type.lower() not in j.employment_type.lower():
            continue
        if request.experience_level != "any" and request.experience_level.lower() not in j.experience_level.lower():
            continue
        if request.fresher_only and not j.is_fresher_friendly:
            continue
        if comp_low and comp_low not in j.company.lower():
            continue
        if src_low and src_low != "all" and src_low not in j.source.lower():
            continue
        filtered.append(j)

    corpus = [j.description_text[:800] for j in filtered[:30]]
    matched = [
        score_resume_against_job(request.resume_data or {}, j, request.weights, corpus_texts=corpus)
        for j in filtered
    ]
    if request.min_match > 0:
        matched = [m for m in matched if m.match_score >= request.min_match]

    matched.sort(key=lambda m: m.match_score, reverse=True)
    total = len(matched)
    start = (request.page - 1) * request.limit
    paged = matched[start : start + request.limit]

    prefs = CareerPreferences(
        location=request.location,
        locationType="custom" if request.location else "none",
        workMode=request.work_mode if request.work_mode in ("any", "remote", "hybrid", "onsite") else "any",
        jobType=request.employment_type if request.employment_type in ("any", "internship", "full-time", "part-time", "contract") else "any",
    )
    fallback_links = generate_job_search_links(
        role_title=query_str or "Software Developer",
        skills=(request.career_profile.skills[:3] if request.career_profile else []),
        preferences=prefs,
        experience_level=request.experience_level if request.experience_level != "any" else "",
    )

    resp = JobSearchResponse(
        jobs=paged,
        total_count=total,
        page=request.page,
        limit=request.limit,
        sources_status=statuses,
        fallback_search_links=fallback_links,
        cached=cached,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
    return {
        "success": True,
        "data": resp.model_dump(),
        "message": f"Found {total} live job(s) across public sources.",
        "error": None,
    }


@router.get("/recommendations")
async def get_live_job_recommendations(
    query: str = Query(default=""),
    fresher_only: bool = Query(default=False),
    limit: int = Query(default=20, ge=1, le=50),
):
    jobs, statuses, cached = await collect_live_jobs(query=query, force_refresh=False)
    if fresher_only:
        jobs = [j for j in jobs if j.is_fresher_friendly]
    return {
        "success": True,
        "data": {
            "jobs": [j.model_dump() for j in jobs[:limit]],
            "total_count": len(jobs),
            "sources_status": [s.model_dump() for s in statuses],
            "cached": cached,
        },
        "message": "Public job listings retrieved.",
        "error": None,
    }


@router.post("/match-single")
async def match_single_job(request: SingleJobMatchRequest):
    scored = score_resume_against_job(request.resume_data, request.job, request.weights)
    return {
        "success": True,
        "data": scored.model_dump(),
        "message": "Resume-to-job compatibility calculated.",
        "error": None,
    }


@router.get("/{job_id}")
async def get_job_by_id(job_id: str):
    job = get_cached_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found in current session cache. Please run a search first.")
    return {
        "success": True,
        "data": job.model_dump(),
        "message": "Job details retrieved.",
        "error": None,
    }

@router.post("/analyze")
async def analyze_job(request: JobAnalyzeRequest):
    result = await ai_service.analyze_job(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Job description analyzed successfully.",
        "error": None
    }

@router.post("/match")
async def match_resume(request: MatchResumeRequest):
    result = await ai_service.match_resume(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Resume matched with job description successfully.",
        "error": None
    }

@router.post("/tailor")
async def tailor_resume(request: TailorResumeRequest):
    result = await ai_service.tailor_resume(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Resume tailored suggestions generated successfully.",
        "error": None
    }
