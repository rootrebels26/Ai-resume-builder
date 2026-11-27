import hashlib
import re
from datetime import datetime, timezone
from typing import Any, Dict, List

from app.schemas.job_match import NormalizedJob
from app.utils.text_utils import KNOWN_SKILLS
from app.utils.url_validation import strip_html_safely, validate_external_url

_SOFT_HYPHEN_RE = re.compile(r"\xad")
_FRESHER_RE = re.compile(
    r"\b(fresher|fresh\s+graduate|entry[\s\-]+level|junior|intern|internship|trainee|apprentice|0[\s\-]+1\s+year|0[\s\-]+2\s+years|student)\b",
    re.IGNORECASE,
)


def _clean_str(val: Any) -> str:
    return _SOFT_HYPHEN_RE.sub("", str(val or "")).strip()


def _extract_skills_from_text(text: str, extra_tags: List[str] = None) -> List[str]:
    seen = set()
    found: List[str] = []
    for tag in extra_tags or []:
        t = _clean_str(tag)
        if t and len(t) <= 35 and t.lower() not in seen:
            seen.add(t.lower())
            found.append(t)

    low = (text or "").lower()
    for sk in KNOWN_SKILLS:
        if sk.lower() in seen:
            continue
        pattern = rf"(?<![a-z0-9+#.]){re.escape(sk.lower())}(?![a-z0-9+#.])"
        if re.search(pattern, low):
            seen.add(sk.lower())
            found.append(sk)
        if len(found) >= 15:
            break
    return found


def _detect_work_mode(raw_mode: str, location: str, title: str, is_remote: bool = False) -> str:
    blob = f"{raw_mode} {location} {title}".lower()
    if is_remote or "remote" in blob or "work from home" in blob or "wfh" in blob:
        return "Remote"
    if "hybrid" in blob:
        return "Hybrid"
    if "on-site" in blob or "onsite" in blob or "in-office" in blob:
        return "On-site"
    return "Not specified"


def _detect_employment_type(raw_type: str, title: str, tags: List[str] = None) -> str:
    blob = f"{raw_type} {title} {' '.join(tags or [])}".lower()
    if "intern" in blob or "praktikum" in blob or "trainee" in blob:
        return "Internship"
    if "part-time" in blob or "part time" in blob or "part_time" in blob:
        return "Part-time"
    if "contract" in blob or "freelance" in blob:
        return "Contract"
    if "full-time" in blob or "full time" in blob or "full_time" in blob:
        return "Full-time"
    return "Not specified"


def _detect_experience_level(title: str, desc: str, emp_type: str) -> str:
    blob = f"{title} {desc[:500]}".lower()
    if emp_type == "Internship" or "intern" in title.lower():
        return "Internship"
    if any(k in blob for k in ("fresher", "fresh graduate", "0-1 year", "0-2 years", "entry-level", "entry level")):
        return "Fresher / Entry-level"
    if any(k in title.lower() for k in ("junior", "jr.", "associate", "graduate")):
        return "Junior"
    if any(k in title.lower() for k in ("senior", "sr.", "staff", "principal", "lead", "head ", "director")):
        return "Senior"
    return "Mid-level"


def _make_job_id(source: str, title: str, company: str, url: str) -> str:
    raw = f"{source}|{title.lower()}|{company.lower()}|{url}"
    return f"{source}_{hashlib.sha256(raw.encode('utf-8')).hexdigest()[:12]}"


def normalize_freehire_job(raw: Dict[str, Any], fetched_at: str = "") -> NormalizedJob | None:
    title = _clean_str(raw.get("title"))
    company = _clean_str(raw.get("company"))
    apply_url = validate_external_url(raw.get("apply_url") or raw.get("url") or "")
    source_url = validate_external_url(raw.get("url") or raw.get("apply_url") or "")
    if not title or not company or not apply_url:
        return None

    desc_text = strip_html_safely(raw.get("description") or "")
    location = _clean_str(raw.get("location")) or ", ".join(_clean_str(c) for c in (raw.get("countries") or []) if c) or "Not specified"
    work_mode = _detect_work_mode(_clean_str(raw.get("work_mode")), location, title)
    raw_skills = [s for s in (raw.get("skills") or []) if isinstance(s, str)]
    emp_type = _detect_employment_type("", title, raw_skills)
    exp_level = _detect_experience_level(title, desc_text, emp_type)
    skills = _extract_skills_from_text(f"{title} {desc_text}", raw_skills)
    is_fresher = emp_type == "Internship" or bool(_FRESHER_RE.search(f"{title} {desc_text[:600]}"))

    return NormalizedJob(
        id=_make_job_id("freehire", title, company, apply_url),
        title=title,
        company=company,
        location=location,
        work_mode=work_mode,
        employment_type=emp_type,
        experience_level=exp_level,
        salary="",
        source=f"FreeHire ({_clean_str(raw.get('source')) or 'aggregated'})",
        source_url=source_url,
        apply_url=apply_url,
        posted_at=_clean_str(raw.get("posted_at") or raw.get("created_at")),
        description_text=desc_text,
        required_skills=skills,
        preferred_skills=[],
        is_fresher_friendly=is_fresher,
        is_verified_live_listing=True,
        fetched_at=fetched_at or datetime.now(timezone.utc).isoformat(),
    )


def normalize_remotive_job(raw: Dict[str, Any], fetched_at: str = "") -> NormalizedJob | None:
    title = _clean_str(raw.get("title"))
    company = _clean_str(raw.get("company_name"))
    apply_url = validate_external_url(raw.get("url") or "")
    if not title or not company or not apply_url:
        return None

    desc_text = strip_html_safely(raw.get("description") or "")
    location = _clean_str(raw.get("candidate_required_location")) or "Worldwide (Remote)"
    tags = [t for t in (raw.get("tags") or []) if isinstance(t, str)]
    emp_type = _detect_employment_type(_clean_str(raw.get("job_type")), title, tags)
    exp_level = _detect_experience_level(title, desc_text, emp_type)
    skills = _extract_skills_from_text(f"{title} {desc_text}", tags)
    is_fresher = emp_type == "Internship" or bool(_FRESHER_RE.search(f"{title} {desc_text[:600]}"))

    return NormalizedJob(
        id=_make_job_id("remotive", title, company, apply_url),
        title=title,
        company=company,
        location=location,
        work_mode="Remote",
        employment_type=emp_type,
        experience_level=exp_level,
        salary=_clean_str(raw.get("salary")),
        source="Remotive",
        source_url=apply_url,
        apply_url=apply_url,
        posted_at=_clean_str(raw.get("publication_date")),
        description_text=desc_text,
        required_skills=skills,
        preferred_skills=[],
        is_fresher_friendly=is_fresher,
        is_verified_live_listing=True,
        fetched_at=fetched_at or datetime.now(timezone.utc).isoformat(),
    )


def normalize_arbeitnow_job(raw: Dict[str, Any], fetched_at: str = "") -> NormalizedJob | None:
    title = _clean_str(raw.get("title"))
    company = _clean_str(raw.get("company_name"))
    apply_url = validate_external_url(raw.get("url") or "")
    if not title or not company or not apply_url:
        return None

    desc_text = strip_html_safely(raw.get("description") or "")
    location = _clean_str(raw.get("location")) or "Not specified"
    is_rem = bool(raw.get("remote"))
    work_mode = _detect_work_mode("", location, title, is_remote=is_rem)
    tags = [t for t in (raw.get("tags") or []) if isinstance(t, str)]
    job_types = [t for t in (raw.get("job_types") or []) if isinstance(t, str)]
    emp_type = _detect_employment_type(" ".join(job_types), title, tags)
    exp_level = _detect_experience_level(title, desc_text, emp_type)
    skills = _extract_skills_from_text(f"{title} {desc_text}", tags)
    is_fresher = emp_type == "Internship" or bool(_FRESHER_RE.search(f"{title} {desc_text[:600]}"))

    posted = ""
    if raw.get("created_at"):
        try:
            ts = int(raw["created_at"])
            posted = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")
        except Exception:
            posted = _clean_str(raw.get("created_at"))

    return NormalizedJob(
        id=_make_job_id("arbeitnow", title, company, apply_url),
        title=title,
        company=company,
        location=location,
        work_mode=work_mode,
        employment_type=emp_type,
        experience_level=exp_level,
        salary="",
        source="Arbeitnow",
        source_url=apply_url,
        apply_url=apply_url,
        posted_at=posted,
        description_text=desc_text,
        required_skills=skills,
        preferred_skills=[],
        is_fresher_friendly=is_fresher,
        is_verified_live_listing=True,
        fetched_at=fetched_at or datetime.now(timezone.utc).isoformat(),
    )
