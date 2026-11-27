import asyncio
import json
import logging
import urllib.request
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple
from urllib.parse import urlencode

from app.schemas.job_match import JobSourceStatus, NormalizedJob
from app.services.job_normalizer import (
    normalize_arbeitnow_job,
    normalize_freehire_job,
    normalize_remotive_job,
)

logger = logging.getLogger("public_job_sources")


def _fetch_json_sync(url: str, timeout: float = 7.0, retries: int = 1) -> Any:
    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "ResumeStudio/1.0 (+https://nityacloudtech.com)"},
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
                return json.loads(raw)
        except Exception as exc:
            last_err = exc
            if attempt < retries:
                continue
    raise last_err


async def fetch_freehire_jobs(query: str = "", limit: int = 40) -> Tuple[List[NormalizedJob], JobSourceStatus]:
    fetched_at = datetime.now(timezone.utc).isoformat()
    url = "https://freehire.me/api/v1/jobs"
    if query:
        url = f"{url}?{urlencode({'q': query})}"
    try:
        payload = await asyncio.to_thread(_fetch_json_sync, url, 7.0, 1)
        items = payload.get("data") or [] if isinstance(payload, dict) else []
        jobs: List[NormalizedJob] = []
        for raw in items[:limit]:
            if isinstance(raw, dict):
                nj = normalize_freehire_job(raw, fetched_at=fetched_at)
                if nj:
                    jobs.append(nj)
        return jobs, JobSourceStatus(
            source_id="freehire",
            name="FreeHire Public API",
            status="ok",
            count=len(jobs),
            fetched_at=fetched_at,
        )
    except Exception as exc:
        logger.warning("FreeHire source unavailable: %s", exc)
        return [], JobSourceStatus(
            source_id="freehire",
            name="FreeHire Public API",
            status="unavailable",
            count=0,
            fetched_at=fetched_at,
            error=str(exc)[:180],
        )


async def fetch_remotive_jobs(query: str = "", limit: int = 40) -> Tuple[List[NormalizedJob], JobSourceStatus]:
    fetched_at = datetime.now(timezone.utc).isoformat()
    params = {"limit": min(limit, 50)}
    if query:
        params["search"] = query
    url = f"https://remotive.com/api/remote-jobs?{urlencode(params)}"
    try:
        payload = await asyncio.to_thread(_fetch_json_sync, url, 7.0, 1)
        items = payload.get("jobs") or [] if isinstance(payload, dict) else []
        jobs: List[NormalizedJob] = []
        for raw in items[:limit]:
            if isinstance(raw, dict):
                nj = normalize_remotive_job(raw, fetched_at=fetched_at)
                if nj:
                    jobs.append(nj)
        return jobs, JobSourceStatus(
            source_id="remotive",
            name="Remotive Public API",
            status="ok",
            count=len(jobs),
            fetched_at=fetched_at,
        )
    except Exception as exc:
        logger.warning("Remotive source unavailable: %s", exc)
        return [], JobSourceStatus(
            source_id="remotive",
            name="Remotive Public API",
            status="unavailable",
            count=0,
            fetched_at=fetched_at,
            error=str(exc)[:180],
        )


async def fetch_arbeitnow_jobs(limit: int = 40) -> Tuple[List[NormalizedJob], JobSourceStatus]:
    fetched_at = datetime.now(timezone.utc).isoformat()
    url = "https://www.arbeitnow.com/api/job-board-api"
    try:
        payload = await asyncio.to_thread(_fetch_json_sync, url, 7.0, 1)
        items = payload.get("data") or [] if isinstance(payload, dict) else []
        jobs: List[NormalizedJob] = []
        for raw in items[:limit]:
            if isinstance(raw, dict):
                nj = normalize_arbeitnow_job(raw, fetched_at=fetched_at)
                if nj:
                    jobs.append(nj)
        return jobs, JobSourceStatus(
            source_id="arbeitnow",
            name="Arbeitnow Public API",
            status="ok",
            count=len(jobs),
            fetched_at=fetched_at,
        )
    except Exception as exc:
        logger.warning("Arbeitnow source unavailable: %s", exc)
        return [], JobSourceStatus(
            source_id="arbeitnow",
            name="Arbeitnow Public API",
            status="unavailable",
            count=0,
            fetched_at=fetched_at,
            error=str(exc)[:180],
        )
