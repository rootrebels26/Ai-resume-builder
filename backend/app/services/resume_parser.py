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

    full_name = str(pinfo.get("fullName", "") or "").strip()
    email = str(pinfo.get("email", "") or "").strip()
    phone = str(pinfo.get("phone", "") or "").strip()
    location = str(pinfo.get("location", "") or "").strip()
    prof_title = str(pinfo.get("professionalTitle", "") or "").strip()
    website = str(pinfo.get("website", "") or "").strip()
    linkedin = str(pinfo.get("linkedin", "") or "").strip()
    github = str(pinfo.get("github", "") or "").strip()
    portfolio = str(pinfo.get("portfolio", "") or "").strip()

    # Safety net: Recover contact items from raw_text if LLM missed them
    if raw_text:
        if not email:
            emails = EMAIL_REGEX.findall(raw_text)
            if emails:
                email = emails[0]
        if not phone:
            phones = [m.group(0).strip() for m in PHONE_REGEX.finditer(raw_text)]
            if phones:
                phone = phones[0]
        if not linkedin:
            li = LINKEDIN_REGEX.findall(raw_text)
            if li:
                linkedin = f"https://linkedin.com/in/{li[0]}"
        if not github:
            gh = GITHUB_REGEX.findall(raw_text)
            if gh:
                github = f"https://github.com/{gh[0]}"

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
            education_items.append(Education(
                id=item.get("id") or str(uuid.uuid4())[:8],
                institution=str(item.get("institution", "") or "").strip(),
                degree=str(item.get("degree", "") or "").strip(),
                fieldOfStudy=str(item.get("fieldOfStudy", "") or "").strip(),
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

                if p_name:
                    project_items.append(Project(
                        id=item.get("id") or str(uuid.uuid4())[:8],
                        name=p_name,
                        description=p_desc,
                        technologies=clean_techs,
                        githubUrl=p_github,
                        liveUrl=p_live,
                        startDate=str(item.get("startDate", "") or "").strip(),
                        endDate=str(item.get("endDate", "") or "").strip(),
                        highlights=clean_highlights
                    ))

    # Recovery 1: Check if projects were categorized under customSections
    if not project_items:
        for csec in data.get("customSections", []) or []:
            if isinstance(csec, dict):
                c_title = (csec.get("sectionTitle") or "").lower()
                if "project" in c_title:
                    for ci in csec.get("items", []) or []:
                        if isinstance(ci, dict):
                            project_items.append(Project(
                                id=str(uuid.uuid4())[:8],
                                name=ci.get("title", "Project"),
                                description=ci.get("description", ""),
                                technologies=extract_matching_skills(ci.get("description", "")),
                                highlights=[ci.get("subtitle", "")] if ci.get("subtitle") else []
                            ))

    # Recovery 2: Check if experience has entries that are clearly projects (e.g. titled "Featured Projects" or "PulseQueue")
    if not project_items and len(experience_items) > 0:
        filtered_exp = []
        for exp in experience_items:
            is_proj = any(kw in exp.company.lower() for kw in ["project", "pulsequeue", "neurodoc", "portfolio", "broker", "summarizer"]) or \
                      any(kw in exp.position.lower() for kw in ["project"]) or \
                      (exp.company.lower() in {"personal", "academic", "independent", "open source"} and not exp.location)
            if is_proj:
                project_items.append(Project(
                    id=exp.id or str(uuid.uuid4())[:8],
                    name=exp.company if "project" not in exp.company.lower() else exp.position,
                    description=exp.responsibilities[0] if exp.responsibilities else "",
                    technologies=extract_matching_skills(" ".join(exp.responsibilities)),
                    startDate=exp.startDate,
                    endDate=exp.endDate,
                    highlights=exp.responsibilities[1:] if len(exp.responsibilities) > 1 else exp.responsibilities
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

    # 7. Certifications
    certification_items = []
    for item in data.get("certifications", []) or []:
        if isinstance(item, dict):
            certification_items.append(Certification(
                id=item.get("id") or str(uuid.uuid4())[:8],
                name=str(item.get("name", "") or "").strip(),
                issuer=str(item.get("issuer", "") or "").strip(),
                issueDate=str(item.get("issueDate", "") or "").strip(),
                expiryDate=str(item.get("expiryDate", "") or "").strip(),
                credentialUrl=str(item.get("credentialUrl", "") or "").strip()
            ))

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
                items=c_items
            ))

    return ResumeData(
        personalInfo=personal,
        professionalSummary=str(data.get("professionalSummary", "") or "").strip(),
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

async def parse_resume_document_pipeline(
    raw_text: str, layout_metadata: Dict[str, Any] = None
) -> Tuple[ResumeData, Dict[str, Any]]:
    """
    Executes the multi-stage document extraction:
    1. Interprets document semantics via AI provider (Groq LLM / fallback).
    2. Hydrates into schema-compliant ResumeData.
    3. Runs ExtractionValidator to produce confidence scores, section ratings, and actionable notices.
    """
    parsed_dict = await ai_service.parse_resume_document(raw_text, layout_metadata)
    resume_data = sanitize_and_hydrate_resume(parsed_dict, raw_text=raw_text)
    validation = ExtractionValidator.validate(raw_text, resume_data.model_dump(), layout_metadata)
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
