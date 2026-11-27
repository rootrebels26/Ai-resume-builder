import re
from typing import List, Optional
from urllib.parse import quote_plus, urlencode, urlparse
from app.schemas.career_schema import CareerPreferences, JobSearchLink


SUPPORTED_PLATFORMS = [
    "linkedin",
    "indeed",
    "google_jobs",
    "naukri",
    "wellfound",
    "internshala",
    "foundit",
    "glassdoor",
]


def _resolve_location_query(preferences: Optional[CareerPreferences]) -> str:
    if not preferences:
        return ""
    loc_type = (preferences.locationType or "none").lower()
    raw_loc = (preferences.location or "").strip()

    if loc_type == "india":
        return "India"
    if loc_type == "remote" or preferences.workMode == "remote":
        return "Remote"
    if loc_type == "worldwide" or loc_type == "none":
        return ""
    if loc_type in ("city", "custom") and raw_loc:
        return raw_loc
    return raw_loc


def build_search_query(
    role_title: str,
    skills: List[str],
    preferences: Optional[CareerPreferences] = None,
    experience_level: str = "",
) -> str:
    parts = [role_title.strip()]

    job_type = (preferences.jobType if preferences else "any").lower()
    if job_type == "internship" and "intern" not in role_title.lower():
        parts.append("Intern")
    elif job_type in ("part-time", "contract", "freelance"):
        parts.append(job_type.replace("-", " ").title())

    if experience_level and experience_level.lower() in ("fresher", "student", "entry-level"):
        if "intern" not in role_title.lower() and "fresher" not in role_title.lower():
            if preferences and preferences.locationType == "india":
                parts.append("Fresher")

    # Include top 2 concise skills to keep search queries high-signal
    clean_skills = [s.strip() for s in skills if s and len(s.strip()) <= 24][:2]
    parts.extend(clean_skills)

    if preferences and preferences.workMode == "remote" and "remote" not in " ".join(parts).lower():
        parts.append("Remote")

    return " ".join(p for p in parts if p).strip()


def _validate_https_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in ("https", "http") or not parsed.netloc:
        raise ValueError(f"Invalid external search URL generated: {url}")
    return url


def _naukri_slug(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "software-developer"


def generate_job_search_links(
    role_title: str,
    skills: List[str],
    preferences: Optional[CareerPreferences] = None,
    experience_level: str = "",
) -> List[JobSearchLink]:
    """
    Generate safe, URL-encoded public search URLs for 8 job platforms without
    requiring any paid job-search API key or scraping.
    """
    query = build_search_query(role_title, skills, preferences, experience_level)
    location = _resolve_location_query(preferences)
    is_remote = bool(
        preferences and (preferences.workMode == "remote" or preferences.locationType == "remote")
    )
    is_internship = bool(
        (preferences and preferences.jobType == "internship")
        or "intern" in role_title.lower()
        or experience_level.lower() in ("intern", "student")
    )

    links: List[JobSearchLink] = []

    # 1. LinkedIn Jobs
    li_params = {"keywords": query}
    if location and location.lower() != "remote":
        li_params["location"] = location
    if is_remote:
        li_params["f_WT"] = "2"
    links.append(
        JobSearchLink(
            platform="linkedin",
            label="Search on LinkedIn",
            url=_validate_https_url(f"https://www.linkedin.com/jobs/search/?{urlencode(li_params)}"),
            query=query,
        )
    )

    # 2. Indeed
    indeed_params = {"q": query}
    if location:
        indeed_params["l"] = location
    links.append(
        JobSearchLink(
            platform="indeed",
            label="Search on Indeed",
            url=_validate_https_url(f"https://www.indeed.com/jobs?{urlencode(indeed_params)}"),
            query=query,
        )
    )

    # 3. Google Jobs
    g_query = f"{query} {location}".strip() if location else f"{query} jobs"
    g_params = {"q": g_query, "ibp": "htl;jobs"}
    links.append(
        JobSearchLink(
            platform="google_jobs",
            label="Search on Google Jobs",
            url=_validate_https_url(f"https://www.google.com/search?{urlencode(g_params)}"),
            query=g_query,
        )
    )

    # 4. Naukri
    naukri_slug = _naukri_slug(role_title)
    naukri_params = {"k": query}
    if location and location.lower() != "remote":
        naukri_params["l"] = location
    links.append(
        JobSearchLink(
            platform="naukri",
            label="Search on Naukri",
            url=_validate_https_url(f"https://www.naukri.com/{naukri_slug}-jobs?{urlencode(naukri_params)}"),
            query=query,
        )
    )

    # 5. Wellfound
    wf_params = {"q": query}
    links.append(
        JobSearchLink(
            platform="wellfound",
            label="Search on Wellfound",
            url=_validate_https_url(f"https://wellfound.com/jobs?{urlencode(wf_params)}"),
            query=query,
        )
    )

    # 6. Internshala
    ishala_kw = quote_plus(role_title.strip())
    ishala_section = "internships" if is_internship else "jobs"
    links.append(
        JobSearchLink(
            platform="internshala",
            label="Search on Internshala",
            url=_validate_https_url(f"https://internshala.com/{ishala_section}/keywords-{ishala_kw}/"),
            query=role_title.strip(),
        )
    )

    # 7. Foundit
    foundit_params = {"query": query}
    if location and location.lower() != "remote":
        foundit_params["locations"] = location
    links.append(
        JobSearchLink(
            platform="foundit",
            label="Search on Foundit",
            url=_validate_https_url(f"https://www.foundit.in/srp/results?{urlencode(foundit_params)}"),
            query=query,
        )
    )

    # 8. Glassdoor
    gd_params = {"sc.keyword": query}
    links.append(
        JobSearchLink(
            platform="glassdoor",
            label="Search on Glassdoor",
            url=_validate_https_url(f"https://www.glassdoor.com/Job/jobs.htm?{urlencode(gd_params)}"),
            query=query,
        )
    )

    return links
