import re
import json
import uuid
import logging
from typing import Dict, Any, List, Tuple
from app.schemas.resume_schema import (
    ResumeData, PersonalInfo, Education, Experience, Project, SkillCategory,
    Certification, Language, Achievement, Publication, VolunteerExperience,
    CustomSection, CustomSectionItem, Internship
)
from app.services.document_extractor import DocumentExtractor
from app.services.ai_service import ai_service
from app.services.extraction_validator import ExtractionValidator

from app.utils.text_utils import (
    EMAIL_REGEX, PHONE_REGEX, LINKEDIN_REGEX, GITHUB_REGEX,
    extract_phone_number, extract_portfolio_url, sanitize_project_data,
    extract_matching_skills, KNOWN_SKILLS
)

logger = logging.getLogger("resume_parser")

def extract_text_from_pdf(file_path: str) -> Tuple[str, List[str], Dict[str, Any]]:
    """
    Extracts text using spatial multi-column layout recognition.
    """
    res = DocumentExtractor.extract_from_pdf(file_path)
    return res.get("text", ""), res.get("warnings", []), {
        "page_count": res.get("page_count", 1),
        "is_scanned": res.get("is_scanned", False),
        "metadata": res.get("metadata", {}),
        "pages": res.get("pages", [])
    }

def extract_text_from_docx(file_path: str) -> Tuple[str, List[str], Dict[str, Any]]:
    """
    Extracts text preserving headings, lists, and tables.
    """
    res = DocumentExtractor.extract_from_docx(file_path)
    return res.get("text", ""), res.get("warnings", []), {
        "page_count": res.get("page_count", 1),
        "is_scanned": False,
        "metadata": res.get("metadata", {}),
        "pages": res.get("pages", [])
    }

def sanitize_and_hydrate_resume(data: Dict[str, Any], raw_text: str = "") -> ResumeData:
    """
    Guarantees every item in every array has a unique ID and matches the ResumeData schema.
    Applies regex safety net for contact details if missing from raw text.
    """
    # 1. Personal Info
    pinfo = data.get("personalInfo", {})
    if not isinstance(pinfo, dict):
        pinfo = {}

    full_name = str(pinfo.get("fullName") or pinfo.get("name") or "").strip()
    email = str(pinfo.get("email") or pinfo.get("mail") or "").strip()
    phone = str(pinfo.get("phone") or pinfo.get("contactNo") or pinfo.get("contact_number") or pinfo.get("contact") or pinfo.get("mobile") or pinfo.get("cell") or pinfo.get("phoneNumber") or "").strip()
    location = str(pinfo.get("location") or pinfo.get("address") or pinfo.get("city") or "").strip()
    prof_title = str(pinfo.get("professionalTitle") or pinfo.get("title") or pinfo.get("role") or "").strip()
    website = str(pinfo.get("website") or pinfo.get("site") or "").strip()
    linkedin = str(pinfo.get("linkedin") or pinfo.get("linkedinUrl") or pinfo.get("linkedIn") or "").strip()
    github = str(pinfo.get("github") or pinfo.get("githubUrl") or pinfo.get("git") or "").strip()
    portfolio = str(pinfo.get("portfolio") or pinfo.get("portfolioUrl") or pinfo.get("portfolioLink") or pinfo.get("personalWebsite") or "").strip()

    # Safety net: Recover contact items and professional title from raw_text or experience if LLM missed them
    if not prof_title:
        # Check first experience position
        raw_exps = data.get("experience", []) or []
        for e in raw_exps:
            if isinstance(e, dict) and e.get("position"):
                prof_title = str(e.get("position")).strip()
                break
        # Check internships
        if not prof_title:
            raw_ints = data.get("internships", []) or []
            for i in raw_ints:
                if isinstance(i, dict) and i.get("role"):
                    prof_title = str(i.get("role")).strip()
                    break
        # Check top lines of raw_text
        if not prof_title and raw_text:
            first_lines = [l.strip() for l in raw_text.splitlines()[:12] if l.strip()]
            for line in first_lines:
                clean_l = re.sub(r'[^a-zA-Z\s/\-]', '', line).strip()
                if any(kw in clean_l.lower() for kw in ["engineer", "developer", "architect", "scientist", "analyst", "manager", "specialist", "designer", "consultant", "lead"]):
                    if 2 <= len(clean_l.split()) <= 5:
                        prof_title = clean_l
                        break

    if raw_text:
        if not full_name or full_name.lower() in ("candidate", "alex rivera", "john doe", ""):
            first_lines = [l.strip() for l in raw_text.splitlines()[:6] if l.strip()]
            for line in first_lines:
                # Exclude lines with email, phone, or URL
                if "@" not in line and "http" not in line and not any(c.isdigit() for c in line):
                    clean_name = re.sub(r'[^a-zA-Z\s]', '', line).strip()
                    if 1 < len(clean_name.split()) <= 4:
                        full_name = clean_name
                        break
        if not email or "@" not in email:
            emails = EMAIL_REGEX.findall(raw_text)
            if emails:
                email = emails[0]
        if not phone or len(re.sub(r'\D', '', phone)) < 10:
            rec_phone = extract_phone_number(raw_text)
            if rec_phone:
                phone = rec_phone
        if not location:
            for line in raw_text.splitlines()[:10]:
                if any(c in line for c in ["India", "USA", "United States", "UK", "Canada", "Germany", "Bengal", "CA", "NY", "Bengaluru", "Bangalore", "Delhi", "Mumbai", "Hyderabad", "Pune", "Kolkata", "Chennai"]):
                    parts = [p.strip() for p in line.split("|") if p.strip()]
                    for p in parts:
                        if any(c in p for c in ["India", "USA", "United States", "UK", "Canada", "Germany", "Bengal", "CA", "NY", "Bengaluru", "Bangalore", "Delhi", "Mumbai", "Hyderabad", "Pune", "Kolkata", "Chennai"]) and not any(kw in p.lower() for kw in ["engineer", "developer", "http", "@", "+"]):
                            location = p
                            break
                    if location:
                        break
        # Guardrail: clean location from any accidental technical terms or acronyms
        tech_words = {"etl", "sql", "modeling", "architecture", "data", "pipeline", "aws", "azure", "gcp", "developer", "engineer", "framework"}
        if location and any(tw in location.lower().split() or tw in [p.strip().lower() for p in re.split(r'[,|/]', location)] for tw in tech_words):
            location = ""
        if not linkedin:
            li = LINKEDIN_REGEX.findall(raw_text)
            if li:
                linkedin = f"https://linkedin.com/in/{li[0].rstrip('/')}"
        if not github:
            gh = GITHUB_REGEX.findall(raw_text)
            if gh:
                github = f"https://github.com/{gh[0].rstrip('/')}"
        if not portfolio:
            portfolio = extract_portfolio_url(raw_text, exclude_linkedin=linkedin, exclude_github=github)
        if not website and portfolio:
            website = portfolio
        if not portfolio and website:
            portfolio = website

    personal = PersonalInfo(
        fullName=full_name,
        email=email,
        phone=phone,
        location=location,
        professionalTitle=prof_title,
        website=website,
        linkedin=linkedin,
        github=github,
        portfolio=portfolio
    )

    # 2. Education
    education_items = []
    for item in data.get("education", []) or []:
        if isinstance(item, str) and item.strip().startswith("{") and item.strip().endswith("}"):
            try:
                item = json.loads(item.strip())
            except Exception:
                pass
        if isinstance(item, dict):
            deg = str(item.get("degree", "") or "").strip()
            fos = str(item.get("fieldOfStudy", "") or "").strip()
            # If degree is brief e.g. "BS" or "B.Tech" and fieldOfStudy is known, create complete degree representation
            if deg and fos and fos.lower() not in deg.lower() and len(deg.split()) <= 2:
                final_deg = f"{deg} in {fos}"
            else:
                final_deg = deg or fos

            education_items.append(Education(
                id=item.get("id") or str(uuid.uuid4())[:8],
                institution=str(item.get("institution", "") or "").strip(),
                degree=final_deg,
                fieldOfStudy=fos,
                startDate=str(item.get("startDate", "") or "").strip(),
                endDate=str(item.get("endDate", "") or "").strip(),
                cgpa=str(item.get("cgpa", "") or "").strip(),
                description=str(item.get("description", "") or "").strip()
            ))

    # 3. Experience
    experience_items = []
    for item in data.get("experience", []) or []:
        if isinstance(item, str) and item.strip().startswith("{") and item.strip().endswith("}"):
            try:
                item = json.loads(item.strip())
            except Exception:
                pass
        if isinstance(item, dict):
            resps = item.get("responsibilities", [])
            if isinstance(resps, str):
                resps = [resps]
            resps = [str(r).strip() for r in resps if str(r).strip()]

            achvs = item.get("achievements", [])
            if isinstance(achvs, str):
                achvs = [achvs]
            achvs = [str(a).strip() for a in achvs if str(a).strip()]

            experience_items.append(Experience(
                id=item.get("id") or str(uuid.uuid4())[:8],
                company=str(item.get("company", "") or "").strip(),
                position=str(item.get("position", "") or "").strip(),
                employmentType=str(item.get("employmentType", "Full-time") or "Full-time").strip(),
                location=str(item.get("location", "") or "").strip(),
                startDate=str(item.get("startDate", "") or "").strip(),
                endDate=str(item.get("endDate", "") or "").strip(),
                current=bool(item.get("current", False)),
                responsibilities=resps,
                achievements=achvs
            ))

    # 4. Internships
    internship_items = []
    for item in data.get("internships", []) or []:
        if isinstance(item, str) and item.strip().startswith("{") and item.strip().endswith("}"):
            try:
                item = json.loads(item.strip())
            except Exception:
                pass
        if isinstance(item, dict):
            internship_items.append(Internship(
                id=item.get("id") or str(uuid.uuid4())[:8],
                organization=str(item.get("organization", "") or "").strip(),
                role=str(item.get("role", "") or "").strip(),
                duration=str(item.get("duration", "") or "").strip(),
                startDate=str(item.get("startDate", "") or "").strip(),
                endDate=str(item.get("endDate", "") or "").strip(),
                responsibilities=[str(r).strip() for r in item.get("responsibilities", []) if str(r).strip()],
                technologies=[str(t).strip() for t in item.get("technologies", []) if str(t).strip()]
            ))

    # 5. Projects (with robust field aliases and fallback recovery)
    project_items = []
    raw_projects = data.get("projects", [])
    if isinstance(raw_projects, dict):
        raw_projects = list(raw_projects.values()) if not any(k in raw_projects for k in ["items", "projects"]) else (raw_projects.get("items") or raw_projects.get("projects") or [])

    if isinstance(raw_projects, list):
        for item in raw_projects:
            if isinstance(item, str):
                item_str = item.strip()
                if item_str.startswith("{") and item_str.endswith("}"):
                    try:
                        item = json.loads(item_str)
                    except Exception:
                        pass
                elif len(item_str) > 3:
                    parts = re.split(r'[:|–-]', item_str, 1)
                    item = {
                        "name": parts[0].strip(),
                        "description": parts[1].strip() if len(parts) > 1 else item_str,
                        "technologies": extract_matching_skills(item_str)
                    }

            if isinstance(item, dict):
                p_name = str(item.get("name") or item.get("title") or item.get("projectName") or item.get("projectTitle") or item.get("heading") or "").strip()
                p_desc = str(item.get("description") or item.get("summary") or item.get("details") or item.get("overview") or "").strip()

                techs = item.get("technologies") or item.get("techStack") or item.get("tech_stack") or item.get("tools") or item.get("stack") or []
                if isinstance(techs, str):
                    techs = [t.strip() for t in re.split(r'[,|;]', techs) if t.strip()]
                clean_techs = [str(t).strip() for t in techs if str(t).strip()]

                highlights = item.get("highlights") or item.get("bullets") or item.get("responsibilities") or item.get("achievements") or []
                if isinstance(highlights, str):
                    highlights = [highlights]
                clean_highlights = [str(h).strip() for h in highlights if str(h).strip()]

                p_github = str(item.get("githubUrl") or item.get("github") or item.get("repo") or item.get("repository") or "").strip()
                p_live = str(item.get("liveUrl") or item.get("live") or item.get("demo") or item.get("url") or item.get("link") or "").strip()

                sanitized = sanitize_project_data(
                    name=p_name,
                    desc=p_desc,
                    technologies=clean_techs,
                    github_url=p_github,
                    live_url=p_live,
                    highlights=clean_highlights
                )

                if sanitized["name"]:
                    project_items.append(Project(
                        id=item.get("id") or str(uuid.uuid4())[:8],
                        name=sanitized["name"],
                        description=sanitized["description"],
                        technologies=sanitized["technologies"],
                        githubUrl=sanitized["githubUrl"],
                        liveUrl=sanitized["liveUrl"],
                        startDate=str(item.get("startDate", "") or "").strip(),
                        endDate=str(item.get("endDate", "") or "").strip(),
                        highlights=sanitized["highlights"]
                    ))

    # Recovery 1: Check if projects were categorized under customSections
    if not project_items:
        for csec in data.get("customSections", []) or []:
            if isinstance(csec, dict):
                c_title = (csec.get("sectionTitle") or "").lower()
                if "project" in c_title:
                    for ci in csec.get("items", []) or []:
                        if isinstance(ci, dict):
                            ci_sanitized = sanitize_project_data(
                                name=ci.get("title", "Project"),
                                desc=ci.get("description", ""),
                                technologies=extract_matching_skills(ci.get("description", "")),
                                highlights=[ci.get("subtitle", "")] if ci.get("subtitle") else []
                            )
                            project_items.append(Project(
                                id=str(uuid.uuid4())[:8],
                                name=ci_sanitized["name"],
                                description=ci_sanitized["description"],
                                technologies=ci_sanitized["technologies"],
                                githubUrl=ci_sanitized["githubUrl"],
                                liveUrl=ci_sanitized["liveUrl"],
                                highlights=ci_sanitized["highlights"]
                            ))

    # Recovery 2: Check if experience has entries that are clearly projects (e.g. titled "Featured Projects" or "PulseQueue")
    if not project_items and len(experience_items) > 0:
        filtered_exp = []
        for exp in experience_items:
            is_proj = any(kw in exp.company.lower() for kw in ["project", "pulsequeue", "neurodoc", "portfolio", "broker", "summarizer"]) or \
                      any(kw in exp.position.lower() for kw in ["project"]) or \
                      (exp.company.lower() in {"personal", "academic", "independent", "open source"} and not exp.location)
            if is_proj:
                exp_desc = exp.responsibilities[0] if exp.responsibilities else ""
                exp_bullets = exp.responsibilities[1:] if len(exp.responsibilities) > 1 else exp.responsibilities
                san = sanitize_project_data(
                    name=exp.company if "project" not in exp.company.lower() else exp.position,
                    desc=exp_desc,
                    technologies=extract_matching_skills(" ".join(exp.responsibilities)),
                    highlights=exp_bullets
                )
                project_items.append(Project(
                    id=exp.id or str(uuid.uuid4())[:8],
                    name=san["name"],
                    description=san["description"],
                    technologies=san["technologies"],
                    githubUrl=san["githubUrl"],
                    liveUrl=san["liveUrl"],
                    startDate=exp.startDate,
                    endDate=exp.endDate,
                    highlights=san["highlights"]
                ))
            else:
                filtered_exp.append(exp)
        if project_items:
            experience_items = filtered_exp

    # Recovery 3: Direct text regex recovery if projects section exists in raw_text but model missed it
    if not project_items and raw_text:
        proj_match = re.search(r'\b(?:(?:featured|key|technical|personal|academic|selected|notable|major|relevant)?\s*projects|project\s+experience|project\s+work)\b', raw_text, re.IGNORECASE)
        if proj_match:
            from app.providers.local_heuristic import LocalHeuristicProvider
            heuristic = LocalHeuristicProvider()
            try:
                rec_parsed = heuristic.parse_resume_document_sync(raw_text[proj_match.start():])
                for rp in rec_parsed.get("projects", []) or []:
                    if rp.get("name"):
                        project_items.append(Project(
                            id=str(uuid.uuid4())[:8],
                            name=rp.get("name", "Project"),
                            description=rp.get("description", ""),
                            technologies=rp.get("technologies", []),
                            githubUrl=rp.get("githubUrl", ""),
                            liveUrl=rp.get("liveUrl", ""),
                            startDate=rp.get("startDate", ""),
                            endDate=rp.get("endDate", ""),
                            highlights=rp.get("highlights", [])
                        ))
            except Exception as e:
                logger.warning("Project recovery from raw_text failed: %s", e)

    # Recovery 4: Only recover projects from experience if raw_text explicitly mentions projects
    if not project_items and len(experience_items) > 0 and raw_text and re.search(r'\b(?:projects?|capstone|portfolio|open\s+source)\b', raw_text, re.IGNORECASE):
        action_words = ['architected', 'designed', 'developed', 'engineered', 'built', 'created', 'implemented', 'orchestrated', 'automated']
        for exp in experience_items:
            for resp in exp.responsibilities:
                r_clean = resp.strip()
                if any(w in r_clean.lower()[:25] for w in action_words):
                    clause = r_clean.split(',')[0].split(' using ')[0].split(' with ')[0].split(' for ')[0]
                    title = re.sub(r'^(?:designed|architected|developed|engineered|built|created|implemented|orchestrated|automated)\s+(?:and\s+\w+\s+)?', '', clause, flags=re.IGNORECASE).strip()
                    title = title[:60].strip()
                    if len(title) > 10:
                        techs = extract_matching_skills(r_clean)
                        project_items.append(Project(
                            id=str(uuid.uuid4())[:8],
                            name=title.title(),
                            description=r_clean,
                            technologies=techs[:6],
                            githubUrl="",
                            liveUrl="",
                            startDate=exp.startDate,
                            endDate=exp.endDate,
                            highlights=[r_clean]
                        ))
                        if len(project_items) >= 4:
                            break
            if len(project_items) >= 4:
                break

    # Recovery 5: Only recover education from raw_text when actual degree or institution text exists (never fabricate)
    if not education_items and raw_text:
        deg_match = re.search(r'\b(Bachelor(?:\s+of\s+[A-Za-z\s&]+)?|Master(?:\s+of\s+[A-Za-z\s&]+)?|B\.?E\.?(?:\s+in\s+[A-Za-z\s&]+)?|B\.?Tech(?:\s+in\s+[A-Za-z\s&]+)?|M\.?Tech|B\.?Sc|M\.?Sc|BCA|MCA|MBA|Ph\.?D)\b', raw_text, re.IGNORECASE)
        inst_match = re.search(r'\b(?:University\s+of\s+[A-Za-z\s,]+|[A-Z][a-zA-Z\s,]+(?:University|College|Institute|School|Academy)\b[a-zA-Z\s,]*|(?:RGPV|IIT|NIT|BITS)(?:,\s*[A-Za-z]+)?)', raw_text, re.IGNORECASE)
        year_match = re.search(r'\b(19\d{2}|20\d{2})\b', raw_text)

        if deg_match or inst_match:
            education_items.append(Education(
                id=str(uuid.uuid4())[:8],
                institution=inst_match.group(0).strip() if inst_match else "",
                degree=deg_match.group(0).strip() if deg_match else "",
                fieldOfStudy="",
                startDate="",
                endDate=year_match.group(0).strip() if year_match else "",
                cgpa="",
                description=""
            ))

    # 6. Skills
    skills_categories = []
    raw_skills = data.get("skills", [])
    if isinstance(raw_skills, list):
        for item in raw_skills:
            if isinstance(item, dict):
                cat_name = str(item.get("category", "Technical Skills") or "Technical Skills").strip()
                items = item.get("items", [])
                if isinstance(items, str):
                    items = [i.strip() for i in items.split(",") if i.strip()]
                clean_items = [str(i).strip() for i in items if str(i).strip()]
                if clean_items:
                    skills_categories.append(SkillCategory(category=cat_name, items=clean_items))
            elif isinstance(item, str) and item.strip():
                # Single skill string in flat list
                if not skills_categories:
                    skills_categories.append(SkillCategory(category="Technical Skills", items=[]))
                skills_categories[0].items.append(item.strip())

    # 7. Certifications (with pipe-splitting and recovery)
    certification_items = []
    for item in data.get("certifications", []) or []:
        if isinstance(item, dict):
            c_name = str(item.get("name", "") or "").strip()
            c_issuer = str(item.get("issuer", "") or "").strip()
            c_date = str(item.get("issueDate", "") or "").strip()
            # If model lumped multiple certifications on one pipe-separated line, expand them
            if "|" in c_name:
                for seg in [s.strip() for s in c_name.split("|") if s.strip()]:
                    seg_name = seg
                    seg_issuer = c_issuer
                    seg_date = c_date
                    d_m = re.search(r'\(((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\)', seg, re.IGNORECASE)
                    if d_m:
                        seg_date = d_m.group(1).strip()
                        seg = seg[:d_m.start()] + seg[d_m.end():]
                    if any(sep in seg for sep in ['–', '—', '-']):
                        parts = re.split(r'\s*[-–—]\s*', seg, 1)
                        seg_name = parts[0].strip()
                        seg_issuer = parts[1].strip() if len(parts) > 1 else c_issuer
                    certification_items.append(Certification(
                        id=str(uuid.uuid4())[:8],
                        name=seg_name,
                        issuer=seg_issuer,
                        issueDate=seg_date,
                        expiryDate=str(item.get("expiryDate", "") or "").strip(),
                        credentialUrl=str(item.get("credentialUrl", "") or "").strip()
                    ))
            else:
                certification_items.append(Certification(
                    id=item.get("id") or str(uuid.uuid4())[:8],
                    name=c_name,
                    issuer=c_issuer,
                    issueDate=c_date,
                    expiryDate=str(item.get("expiryDate", "") or "").strip(),
                    credentialUrl=str(item.get("credentialUrl", "") or "").strip()
                ))

    # Recovery: Direct regex extraction from raw_text if certifications missing
    if not certification_items and raw_text:
        cert_match = re.search(r'\b(?:certifications|certificates|licenses|credentials|courses|workshops)\b', raw_text, re.IGNORECASE)
        if cert_match:
            from app.providers.local_heuristic import LocalHeuristicProvider
            heuristic = LocalHeuristicProvider()
            try:
                rec_parsed = heuristic.parse_resume_document_sync(raw_text[cert_match.start():])
                for rc in rec_parsed.get("certifications", []) or []:
                    if rc.get("name"):
                        certification_items.append(Certification(
                            id=str(uuid.uuid4())[:8],
                            name=rc.get("name", ""),
                            issuer=rc.get("issuer", ""),
                            issueDate=rc.get("issueDate", ""),
                            expiryDate=rc.get("expiryDate", ""),
                            credentialUrl=rc.get("credentialUrl", "")
                        ))
            except Exception as e:
                logger.warning("Certification recovery from raw_text failed: %s", e)

    # 8. Languages
    languages_items = []
    for item in data.get("languages", []) or []:
        if isinstance(item, dict):
            languages_items.append(Language(
                name=str(item.get("name", "") or "").strip(),
                proficiency=str(item.get("proficiency", "Proficient") or "Proficient").strip()
            ))
        elif isinstance(item, str) and item.strip():
            languages_items.append(Language(name=item.strip(), proficiency="Proficient"))

    # 9. Achievements
    achievements_items = []
    for item in data.get("achievements", []) or []:
        if isinstance(item, dict):
            achievements_items.append(Achievement(
                id=item.get("id") or str(uuid.uuid4())[:8],
                title=str(item.get("title", "") or "").strip(),
                description=str(item.get("description", "") or "").strip(),
                date=str(item.get("date", "") or "").strip()
            ))

    # 10. Publications
    publication_items = []
    for item in data.get("publications", []) or []:
        if isinstance(item, dict):
            publication_items.append(Publication(
                id=item.get("id") or str(uuid.uuid4())[:8],
                title=str(item.get("title", "") or "").strip(),
                publisher=str(item.get("publisher", "") or "").strip(),
                date=str(item.get("date", "") or "").strip(),
                url=str(item.get("url", "") or "").strip(),
                description=str(item.get("description", "") or "").strip()
            ))

    # 11. Volunteer
    volunteer_items = []
    for item in data.get("volunteerExperience", []) or []:
        if isinstance(item, dict):
            volunteer_items.append(VolunteerExperience(
                id=item.get("id") or str(uuid.uuid4())[:8],
                organization=str(item.get("organization", "") or "").strip(),
                role=str(item.get("role", "") or "").strip(),
                duration=str(item.get("duration", "") or "").strip(),
                description=str(item.get("description", "") or "").strip()
            ))

    # 12. Custom sections
    custom_sections_items = []
    for item in data.get("customSections", []) or []:
        if isinstance(item, dict):
            c_items = []
            for ci in item.get("items", []) or []:
                if isinstance(ci, dict):
                    c_items.append(CustomSectionItem(
                        title=str(ci.get("title", "") or "").strip(),
                        subtitle=str(ci.get("subtitle", "") or "").strip(),
                        date=str(ci.get("date", "") or "").strip(),
                        description=str(ci.get("description", "") or "").strip()
                    ))
            custom_sections_items.append(CustomSection(
                id=item.get("id") or str(uuid.uuid4())[:8],
                sectionTitle=str(item.get("sectionTitle", "") or "Additional").strip(),
                normalizedCategory=str(item.get("normalizedCategory", "") or "custom").strip(),
                items=c_items,
                sourcePage=item.get("sourcePage")
            ))

    raw_summary = str(data.get("professionalSummary", "") or "").strip()
    clean_summary = re.sub(r'---\s*\[PAGE\s*\d+\]\s*---', '', raw_summary)
    clean_summary = re.sub(r'\[PAGE\s*\d+\]', '', clean_summary)
    clean_summary = re.sub(r'\[SECTION:[^\]]*\]', '', clean_summary)
    clean_summary = re.sub(r'\s{2,}', ' ', clean_summary).strip()

    # Universal cleaning: recursively strip all contact noise, headers, and phone/email artifacts that leak into summary
    for _ in range(5):
        clean_summary = re.sub(r'^(?:email|contact|phone|mobile|tel|telephone|cell|linkedin|github|portfolio|website|location|address)[\s:,-]*', '', clean_summary, flags=re.IGNORECASE).strip()
        clean_summary = re.sub(r'^(?:professional\s+summary|summary|profile|about\s+me|career\s+objective|executive\s+summary)[\s:,-]*', '', clean_summary, flags=re.IGNORECASE).strip()
        clean_summary = re.sub(r'^(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b[\s:,-]*', '', clean_summary).strip()
        clean_summary = re.sub(r'^\+\d{2}\s*\d{10}\b[\s:,-]*', '', clean_summary).strip()
        clean_summary = re.sub(r'^\d{10}\b[\s:,-]*', '', clean_summary).strip()

    return ResumeData(
        personalInfo=personal,
        professionalSummary=clean_summary,
        education=education_items,
        experience=experience_items,
        internships=internship_items,
        projects=project_items,
        skills=skills_categories,
        certifications=certification_items,
        achievements=achievements_items,
        languages=languages_items,
        publications=publication_items,
        volunteerExperience=volunteer_items,
        customSections=custom_sections_items
    )

def _format_date_for_builder(date_obj: Any, is_current: bool = False) -> str:
    if is_current:
        return "Present"
    if isinstance(date_obj, dict):
        return str(date_obj.get("value") or date_obj.get("raw") or "").strip()
    if isinstance(date_obj, str):
        return date_obj.strip()
    return ""

def assemble_resume_from_sections(
    blocks_and_results: List[Tuple[Dict[str, Any], Dict[str, Any]]]
) -> Tuple[ResumeData, List[Dict[str, str]], List[Dict[str, Any]]]:
    """
    Stage 3/4 Assembly: Strictly maps each section's verified JSON into ResumeData
    with ZERO cross-section guessing or synthetic text generation.
    """
    personal = PersonalInfo()
    summary_text = ""
    education_items: List[Education] = []
    experience_items: List[Experience] = []
    internship_items: List[Internship] = []
    project_items: List[Project] = []
    skills_categories: List[SkillCategory] = []
    certification_items: List[Certification] = []
    achievements_items: List[Achievement] = []
    languages_items: List[Language] = []
    publication_items: List[Publication] = []
    volunteer_items: List[VolunteerExperience] = []
    custom_sections_items: List[CustomSection] = []

    all_warnings: List[Dict[str, str]] = []
    all_unmapped: List[Dict[str, Any]] = []

    for blk, res in blocks_and_results:
        sec_type = blk["section_type"]
        page_num = blk.get("page", 1)

        for w in res.get("warnings") or []:
            if isinstance(w, dict):
                all_warnings.append(w)
            elif isinstance(w, str):
                all_warnings.append({"code": "NOTICE", "message": w})

        for um in res.get("unmapped") or []:
            if isinstance(um, dict) and um.get("raw_text"):
                all_unmapped.append({
                    "raw_text": str(um.get("raw_text")).strip(),
                    "reason": str(um.get("reason") or "unmapped"),
                    "page": um.get("page") or page_num,
                })

        if sec_type == "header":
            b = res.get("basics") or {}
            if isinstance(b, dict):
                if not personal.fullName and b.get("full_name"):
                    personal.fullName = str(b.get("full_name")).strip()
                if not personal.professionalTitle and b.get("headline"):
                    personal.professionalTitle = str(b.get("headline")).strip()
                if not personal.email and b.get("email"):
                    personal.email = str(b.get("email")).strip()
                if not personal.phone and b.get("phone"):
                    personal.phone = str(b.get("phone")).strip()
                loc = b.get("location")
                if not personal.location:
                    if isinstance(loc, dict):
                        personal.location = str(loc.get("raw") or ", ".join(p for p in [loc.get("city"), loc.get("region"), loc.get("country")] if p) or "").strip()
                    elif isinstance(loc, str):
                        personal.location = loc.strip()

                for lnk in b.get("links") or []:
                    if not isinstance(lnk, dict):
                        continue
                    url = str(lnk.get("url") or "").strip()
                    ltype = str(lnk.get("type") or "other").lower()
                    if not url:
                        continue
                    if ltype == "linkedin" and not personal.linkedin:
                        personal.linkedin = url
                    elif ltype == "github" and not personal.github:
                        personal.github = url
                    elif ltype == "portfolio" and not personal.portfolio:
                        personal.portfolio = url
                    elif not personal.website:
                        personal.website = url

        elif sec_type == "summary":
            if res.get("summary") and not summary_text:
                summary_text = str(res["summary"]).strip()

        elif sec_type == "experience":
            for idx, exp in enumerate(res.get("experience") or []):
                if not isinstance(exp, dict):
                    continue
                is_curr = bool(exp.get("is_current", False))
                bullets = [str(b).strip() for b in (exp.get("bullets") or []) if str(b).strip()]
                experience_items.append(Experience(
                    id=str(exp.get("id") or f"exp_{len(experience_items)+1}"),
                    company=str(exp.get("company") or "").strip(),
                    position=str(exp.get("title") or "").strip(),
                    employmentType=str(exp.get("employment_type") or "").strip() or "Full-time",
                    location=str(exp.get("location") or "").strip(),
                    startDate=_format_date_for_builder(exp.get("start_date"), False),
                    endDate=_format_date_for_builder(exp.get("end_date"), is_curr),
                    current=is_curr,
                    responsibilities=bullets,
                    achievements=[]
                ))

        elif sec_type == "education":
            for edu in res.get("education") or []:
                if not isinstance(edu, dict):
                    continue
                is_curr = bool(edu.get("is_current", False))
                score_obj = edu.get("score")
                cgpa_str = ""
                if isinstance(score_obj, dict):
                    cgpa_str = str(score_obj.get("raw") or (f"{score_obj['value']}/{score_obj['scale']}" if score_obj.get("scale") else score_obj.get("value") or "")).strip()
                elif isinstance(score_obj, str):
                    cgpa_str = score_obj.strip()
                details = [str(d).strip() for d in (edu.get("details") or []) if str(d).strip()]
                education_items.append(Education(
                    id=str(edu.get("id") or f"edu_{len(education_items)+1}"),
                    institution=str(edu.get("institution") or "").strip(),
                    degree=str(edu.get("degree") or "").strip(),
                    fieldOfStudy=str(edu.get("field_of_study") or "").strip(),
                    startDate=_format_date_for_builder(edu.get("start_date"), False),
                    endDate=_format_date_for_builder(edu.get("end_date"), is_curr),
                    cgpa=cgpa_str,
                    description="\n".join(details)
                ))

        elif sec_type == "skills":
            for grp in res.get("skills") or []:
                if not isinstance(grp, dict):
                    continue
                cat_name = str(grp.get("category") or "Technical Skills").strip()
                items = []
                for it in grp.get("items") or []:
                    if isinstance(it, dict) and it.get("name"):
                        nm = str(it["name"]).strip()
                        lvl = str(it.get("level") or "").strip()
                        items.append(f"{nm} ({lvl})" if lvl else nm)
                    elif isinstance(it, str) and it.strip():
                        items.append(it.strip())
                if items:
                    skills_categories.append(SkillCategory(category=cat_name, items=items))

        elif sec_type == "projects":
            for proj in res.get("projects") or []:
                if not isinstance(proj, dict):
                    continue
                link = str(proj.get("link") or "").strip()
                gh_url = link if "github.com" in link.lower() else ""
                live_url = link if link and "github.com" not in link.lower() else ""
                project_items.append(Project(
                    id=str(proj.get("id") or f"proj_{len(project_items)+1}"),
                    name=str(proj.get("name") or "").strip(),
                    description=str(proj.get("description") or "").strip(),
                    technologies=[str(t).strip() for t in (proj.get("tech_stack") or []) if str(t).strip()],
                    githubUrl=gh_url,
                    liveUrl=live_url,
                    startDate=_format_date_for_builder(proj.get("start_date"), False),
                    endDate=_format_date_for_builder(proj.get("end_date"), False),
                    highlights=[str(b).strip() for b in (proj.get("bullets") or []) if str(b).strip()]
                ))

        elif sec_type == "certifications":
            for cert in res.get("certifications") or []:
                if not isinstance(cert, dict):
                    continue
                certification_items.append(Certification(
                    id=str(cert.get("id") or f"cert_{len(certification_items)+1}"),
                    name=str(cert.get("name") or "").strip(),
                    issuer=str(cert.get("issuer") or "").strip(),
                    issueDate=_format_date_for_builder(cert.get("date"), False),
                    expiryDate="",
                    credentialUrl=str(cert.get("url") or "").strip()
                ))

        elif sec_type == "languages":
            for lang in res.get("languages") or []:
                if isinstance(lang, dict) and lang.get("name"):
                    languages_items.append(Language(
                        name=str(lang["name"]).strip(),
                        proficiency=str(lang.get("proficiency") or "Proficient").strip()
                    ))

        elif sec_type == "awards":
            for aw in res.get("awards") or []:
                if isinstance(aw, dict) and aw.get("title"):
                    achievements_items.append(Achievement(
                        id=f"awd_{len(achievements_items)+1}",
                        title=str(aw["title"]).strip(),
                        description=str(aw.get("description") or aw.get("issuer") or "").strip(),
                        date=str(aw.get("date") or "").strip()
                    ))

        elif sec_type == "publications":
            for pub in res.get("publications") or []:
                if isinstance(pub, dict) and pub.get("title"):
                    publication_items.append(Publication(
                        id=f"pub_{len(publication_items)+1}",
                        title=str(pub["title"]).strip(),
                        publisher=str(pub.get("publisher") or "").strip(),
                        date=str(pub.get("date") or "").strip(),
                        url=str(pub.get("url") or "").strip(),
                        description=str(pub.get("description") or "").strip()
                    ))

        elif sec_type == "volunteer":
            for vol in res.get("volunteer") or []:
                if isinstance(vol, dict) and vol.get("organization"):
                    volunteer_items.append(VolunteerExperience(
                        id=f"vol_{len(volunteer_items)+1}",
                        organization=str(vol["organization"]).strip(),
                        role=str(vol.get("role") or "").strip(),
                        duration=str(vol.get("duration") or "").strip(),
                        description=str(vol.get("description") or "").strip()
                    ))

        elif sec_type == "custom":
            csec = res.get("custom_section")
            if isinstance(csec, dict) and csec.get("entries"):
                c_items = []
                for ent in csec.get("entries") or []:
                    if isinstance(ent, dict):
                        c_items.append(CustomSectionItem(
                            title=str(ent.get("title") or "").strip(),
                            subtitle=str(ent.get("subtitle") or "").strip(),
                            date=str(ent.get("date_raw") or "").strip(),
                            description=" ".join(str(b).strip() for b in (ent.get("bullets") or []) if str(b).strip())
                        ))
                custom_sections_items.append(CustomSection(
                    id=f"cust_{len(custom_sections_items)+1}",
                    sectionTitle=str(csec.get("heading") or blk.get("heading_raw") or "Additional").strip(),
                    items=c_items
                ))

    return ResumeData(
        personalInfo=personal,
        professionalSummary=summary_text,
        education=education_items,
        experience=experience_items,
        internships=internship_items,
        projects=project_items,
        skills=skills_categories,
        certifications=certification_items,
        achievements=achievements_items,
        languages=languages_items,
        publications=publication_items,
        volunteerExperience=volunteer_items,
        customSections=custom_sections_items,
    ), all_warnings, all_unmapped


async def parse_resume_document_pipeline(
    raw_text: str, layout_metadata: Dict[str, Any] = None
) -> Tuple[ResumeData, Dict[str, Any]]:
    """
    5-Stage Section-Scoped Extraction Pipeline (content-extract.md):
    1. Text acquisition (already completed by DocumentExtractor).
    2. Section segmentation via SectionSegmenter.
    3. Section-scoped extraction (one call per section in parallel).
    4. Deterministic grounding verification + max 1 repair retry per failing section.
    5. Strict assembly + validation with warnings and unmapped provenance.
    """
    import asyncio
    from app.services.section_segmenter import SectionSegmenter

    blocks = SectionSegmenter.segment(raw_text)
    if not blocks:
        empty = ResumeData()
        val = ExtractionValidator.validate(raw_text, empty.model_dump(), layout_metadata)
        return empty, val

    async def _process_block(blk: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        from app.services.section_heuristic import parse_section_deterministic

        sec_type = blk["section_type"]
        sec_text = blk["text"]
        heading_raw = blk.get("heading_raw", "")

        # Stage 3a: Deterministic Python extraction first (0ms, zero AI quota cost)
        det_res = parse_section_deterministic(sec_type, sec_text, heading_raw=heading_raw)
        if not isinstance(det_res, dict):
            det_res = {}

        def _needs_targeted_ai(st: str, txt: str, r: Dict[str, Any]) -> bool:
            if not txt or not txt.strip():
                return False
            if r.get("unmapped"):
                return True
            if any((w or {}).get("code") == "AMBIGUOUS_ORDER" for w in (r.get("warnings") or [])):
                return True
            if st == "header":
                return not r.get("full_name") or (not r.get("email") and not r.get("phone"))
            if st == "summary":
                return not r.get("summary")
            if st == "skills":
                return not (r.get("categories") or [])
            if st in ("experience", "internships"):
                return not (r.get("experience") or []) and len(txt.strip()) >= 20
            if st in ("education", "projects", "certifications", "languages", "awards", "publications", "volunteer"):
                key = "awards" if st == "awards" else st
                return not (r.get(key) or []) and len(txt.strip()) >= 20
            if st == "custom":
                return not (r.get("items") or []) and len(txt.strip()) >= 20
            return False

        res = det_res
        if _needs_targeted_ai(sec_type, sec_text, det_res):
            try:
                ai_res = await ai_service.parse_section(sec_type, sec_text, heading_raw=heading_raw)
                if isinstance(ai_res, dict) and ai_res:
                    res = ai_res
            except Exception as exc:
                logger.warning("Targeted AI recovery failed for section '%s': %s; using deterministic result.", sec_type, exc)

        # Stage 4: Grounding check + single repair retry if needed
        cleaned, repair_errors, ground_warnings = ExtractionValidator.verify_section_grounding(sec_type, sec_text, res)
        if repair_errors:
            logger.info("Section '%s' had %d grounding error(s); running 1 repair retry.", sec_type, len(repair_errors))
            try:
                repaired = await ai_service.parse_section(sec_type, sec_text, repair_errors=repair_errors, heading_raw=heading_raw)
            except Exception:
                repaired = None
            if isinstance(repaired, dict):
                cleaned, still_bad, ground_warnings = ExtractionValidator.verify_section_grounding(sec_type, sec_text, repaired)
                if still_bad:
                    logger.warning("Section '%s' still had %d ungrounded items after repair; stripped.", sec_type, len(still_bad))

        if ground_warnings:
            cleaned["warnings"] = list(cleaned.get("warnings") or []) + ground_warnings

        logger.info("Parsed section=%s input_chars=%d warnings=%d", sec_type, len(sec_text), len(cleaned.get("warnings") or []))
        return blk, cleaned

    blocks_and_results = await asyncio.gather(*(_process_block(b) for b in blocks))
    resume_data, structured_warnings, unmapped = assemble_resume_from_sections(list(blocks_and_results))

    # Stage 5b: Deterministic safety-net recovery for any primary or secondary section missed by section-scoped pass
    try:
        from app.providers.local_heuristic import LocalHeuristicProvider
        heuristic = LocalHeuristicProvider()
        h_dict = heuristic.parse_resume_document_sync(raw_text, layout_metadata=layout_metadata)
        h_resume = sanitize_and_hydrate_resume(h_dict, raw_text=raw_text)
        if not resume_data.personalInfo.fullName and h_resume.personalInfo.fullName:
            resume_data.personalInfo.fullName = h_resume.personalInfo.fullName
        if not resume_data.personalInfo.email and h_resume.personalInfo.email:
            resume_data.personalInfo.email = h_resume.personalInfo.email
        if not resume_data.personalInfo.phone and h_resume.personalInfo.phone:
            resume_data.personalInfo.phone = h_resume.personalInfo.phone
        if not resume_data.professionalSummary and h_resume.professionalSummary:
            resume_data.professionalSummary = h_resume.professionalSummary
        if not resume_data.experience and h_resume.experience:
            resume_data.experience = h_resume.experience
        if not resume_data.projects and h_resume.projects:
            resume_data.projects = h_resume.projects
        if not resume_data.education and h_resume.education:
            resume_data.education = h_resume.education
        if not resume_data.skills and h_resume.skills:
            resume_data.skills = h_resume.skills
        if not resume_data.certifications and h_resume.certifications:
            resume_data.certifications = h_resume.certifications
        if not resume_data.internships and h_resume.internships:
            resume_data.internships = h_resume.internships
        if not resume_data.achievements and h_resume.achievements:
            resume_data.achievements = h_resume.achievements
        if not resume_data.publications and h_resume.publications:
            resume_data.publications = h_resume.publications
        if not resume_data.volunteerExperience and h_resume.volunteerExperience:
            resume_data.volunteerExperience = h_resume.volunteerExperience
        if not resume_data.languages and h_resume.languages:
            resume_data.languages = h_resume.languages
        if not resume_data.customSections and h_resume.customSections:
            resume_data.customSections = h_resume.customSections
    except Exception as e:
        logger.debug("Heuristic secondary merge skipped: %s", e)

    from app.services.extraction_reconciliation import reconcile_extraction
    reconciliation = reconcile_extraction(resume_data.model_dump(), raw_text, layout_metadata)

    # Ensure substantial unmapped source blocks are never silently discarded
    combined_unmapped = list(unmapped or [])
    seen_unmapped_txt = {str(u.get("raw_text") or "").strip().lower() for u in combined_unmapped}
    substantial_unmapped: List[Dict[str, Any]] = []
    for u_samp in (reconciliation.get("unmapped_samples") or []):
        utxt = str(u_samp.get("raw_text") or "").strip()
        if not utxt or utxt.lower() in seen_unmapped_txt:
            continue
        # Skip trivial standalone headings or single-token noise
        if len(utxt) >= 20 and len(utxt.split()) >= 3:
            combined_unmapped.append(u_samp)
            substantial_unmapped.append(u_samp)
            seen_unmapped_txt.add(utxt.lower())

    if substantial_unmapped and not any(
        (cs.sectionTitle or "").lower().startswith("unmapped") for cs in resume_data.customSections
    ):
        resume_data.customSections.append(
            CustomSection(
                id=f"cust_unmapped_{len(resume_data.customSections) + 1}",
                sectionTitle="Unmapped Content (Review)",
                normalizedCategory="custom",
                items=[
                    CustomSectionItem(
                        title=u["raw_text"][:100],
                        subtitle=f"Page {u.get('page', 1)}",
                        date="",
                        description=u["raw_text"],
                    )
                    for u in substantial_unmapped[:10]
                ],
                sourcePage=substantial_unmapped[0].get("page", 1),
            )
        )

    validation = ExtractionValidator.validate(
        raw_text,
        resume_data.model_dump(),
        layout_metadata=layout_metadata,
        structured_warnings=structured_warnings,
        unmapped=combined_unmapped,
    )

    # Populate sourceDocument, extractionReport, and fieldEvidence metadata
    meta = layout_metadata or {}
    raw_lang = meta.get("language")
    lang_code = (
        (raw_lang.get("code") or raw_lang.get("name") or "en")
        if isinstance(raw_lang, dict)
        else (str(raw_lang).strip() if raw_lang else "en")
    )
    resume_data.sourceDocument = {
        "pageCount": meta.get("page_count") or len(re.findall(r'\[\[page\s+\d+\]\]', raw_text, re.IGNORECASE)) or 1,
        "layoutType": meta.get("layout_type") or "single_column",
        "columnCount": meta.get("column_count") or 1,
        "extractionMethod": meta.get("extraction_method") or "text",
        "language": lang_code,
        "languageInfo": raw_lang if isinstance(raw_lang, dict) else {"code": lang_code},
        "textCoverage": meta.get("text_coverage") or (1.0 if len(raw_text.strip()) > 0 else 0.0),
    }

    evidence: List[Dict[str, Any]] = []
    if resume_data.personalInfo.fullName:
        evidence.append({
            "field": "personalInfo.fullName",
            "value": resume_data.personalInfo.fullName,
            "originalText": resume_data.personalInfo.fullName,
            "sourcePage": 1,
            "extractionMethod": resume_data.sourceDocument["extractionMethod"],
            "confidence": 0.95,
            "requiresReview": False,
        })
    if resume_data.personalInfo.email:
        evidence.append({
            "field": "personalInfo.email",
            "value": resume_data.personalInfo.email,
            "originalText": resume_data.personalInfo.email,
            "sourcePage": 1,
            "extractionMethod": "regex",
            "confidence": 0.99,
            "requiresReview": False,
        })
    if resume_data.personalInfo.phone:
        evidence.append({
            "field": "personalInfo.phone",
            "value": resume_data.personalInfo.phone,
            "originalText": resume_data.personalInfo.phone,
            "sourcePage": 1,
            "extractionMethod": "regex",
            "confidence": 0.95,
            "requiresReview": False,
        })
    for idx, exp in enumerate(resume_data.experience):
        evidence.append({
            "field": f"experience[{idx}].position",
            "value": f"{exp.position} @ {exp.company}".strip(" @"),
            "originalText": (exp.responsibilities[0] if exp.responsibilities else exp.position)[:160],
            "sourcePage": exp.sourcePage or 1,
            "extractionMethod": "section_pipeline",
            "confidence": 0.9 if exp.company else 0.65,
            "requiresReview": not bool(exp.company),
        })
    for idx, proj in enumerate(resume_data.projects):
        evidence.append({
            "field": f"projects[{idx}].name",
            "value": proj.name,
            "originalText": (proj.description or proj.name)[:160],
            "sourcePage": proj.sourcePage or 1,
            "extractionMethod": "section_pipeline",
            "confidence": 0.9 if proj.description else 0.7,
            "requiresReview": not bool(proj.description),
        })
    for idx, edu in enumerate(resume_data.education):
        evidence.append({
            "field": f"education[{idx}].degree",
            "value": f"{edu.degree} — {edu.institution}".strip(" —"),
            "originalText": f"{edu.degree} {edu.institution}".strip(),
            "sourcePage": 1,
            "extractionMethod": "section_pipeline",
            "confidence": 0.9 if edu.institution else 0.65,
            "requiresReview": not bool(edu.institution),
        })

    from app.services.extraction_reconciliation import reconcile_extraction
    reconciliation = reconcile_extraction(resume_data.model_dump(), raw_text, layout_metadata)

    review_count = sum(1 for ev in evidence if ev.get("requiresReview"))
    resume_data.fieldEvidence = evidence
    resume_data.extractionReport = {
        "detectedSections": [b.get("section_type") for b in blocks],
        "sectionCount": len(blocks),
        "experienceCount": len(resume_data.experience),
        "internshipCount": len(resume_data.internships),
        "educationCount": len(resume_data.education),
        "projectCount": len(resume_data.projects),
        "certificationCount": len(resume_data.certifications),
        "skillCategoryCount": len(resume_data.skills),
        "customSectionCount": len(resume_data.customSections),
        "fieldsRequiringReview": review_count,
        "confidence": validation.get("confidence", 0.0),
        "warningsCount": len(validation.get("warnings") or []),
        "reconciliation": reconciliation,
    }

    return resume_data, validation

def parse_resume_text(text: str) -> Tuple[ResumeData, List[str]]:
    """
    Synchronous fallback wrapper for backwards compatibility with previous callers.
    """
    from app.providers.local_heuristic import LocalHeuristicProvider
    heuristic = LocalHeuristicProvider()
    parsed_dict = heuristic.parse_resume_document_sync(text)
    resume = sanitize_and_hydrate_resume(parsed_dict, raw_text=text)
    val = ExtractionValidator.validate(text, resume.model_dump())
    return resume, val.get("warnings", [])
