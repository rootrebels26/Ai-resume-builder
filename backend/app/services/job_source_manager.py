import asyncio
from typing import Dict, List, Optional, Tuple

from app.integrations.public_job_sources import (
    fetch_arbeitnow_jobs,
    fetch_freehire_jobs,
    fetch_remotive_jobs,
)
from app.schemas.job_match import JobSourceStatus, NormalizedJob
from app.services.job_deduplication import deduplicate_jobs
from app.utils.job_cache import job_feed_cache


# Index of recently fetched jobs by ID so GET /api/jobs/{job_id} can resolve details
_RECENT_JOBS_BY_ID: Dict[str, NormalizedJob] = {}


async def collect_live_jobs(query: str = "", force_refresh: bool = False) -> Tuple[List[NormalizedJob], List[JobSourceStatus], bool]:
    """
    Query all public job connectors concurrently with independent error isolation,
    normalize, deduplicate, and cache for 10 minutes.
    """
    cache_key = f"feed::{query.strip().lower()}"
    if not force_refresh:
        cached = job_feed_cache.get(cache_key)
        if cached is not None:
            jobs, statuses = cached
            return jobs, statuses, True

    results = await asyncio.gather(
        fetch_freehire_jobs(query=query, limit=40),
        fetch_remotive_jobs(query=query, limit=40),
        fetch_arbeitnow_jobs(limit=40),
        return_exceptions=True,
    )

    all_jobs: List[NormalizedJob] = []
    statuses: List[JobSourceStatus] = []

    source_names = [("freehire", "FreeHire Public API"), ("remotive", "Remotive Public API"), ("arbeitnow", "Arbeitnow Public API")]
    for idx, res in enumerate(results):
        if isinstance(res, Exception):
            sid, sname = source_names[idx]
            statuses.append(
                JobSourceStatus(
                    source_id=sid,
                    name=sname,
                    status="unavailable",
                    count=0,
                    error=str(res)[:160],
                )
            )
            continue
        src_jobs, src_status = res
        all_jobs.extend(src_jobs)
        statuses.append(src_status)

    deduped = deduplicate_jobs(all_jobs)
    for j in deduped:
        _RECENT_JOBS_BY_ID[j.id] = j

    job_feed_cache.set(cache_key, (deduped, statuses))
    return deduped, statuses, False


def get_cached_job_by_id(job_id: str) -> Optional[NormalizedJob]:
    return _RECENT_JOBS_BY_ID.get(job_id)
