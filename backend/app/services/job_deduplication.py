import re
from typing import List
from app.schemas.job_match import NormalizedJob


def _norm_key(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (text or "").lower()).strip()


def deduplicate_jobs(jobs: List[NormalizedJob]) -> List[NormalizedJob]:
    """
    Remove duplicate job listings across multiple sources using:
    1. Canonical (title, company) signature
    2. Canonical apply_url
    Keeps the richer listing (longer description / more skills).
    """
    by_sig: dict[str, NormalizedJob] = {}
    seen_urls: set[str] = set()

    for job in jobs:
        sig = f"{_norm_key(job.title)}::{_norm_key(job.company)}"
        url_key = (job.apply_url or "").split("?")[0].rstrip("/").lower()

        if url_key and url_key in seen_urls and sig not in by_sig:
            continue

        if sig in by_sig:
            existing = by_sig[sig]
            existing_score = len(existing.description_text) + len(existing.required_skills) * 40
            new_score = len(job.description_text) + len(job.required_skills) * 40
            if new_score > existing_score:
                by_sig[sig] = job
        else:
            by_sig[sig] = job
            if url_key:
                seen_urls.add(url_key)

    return list(by_sig.values())
