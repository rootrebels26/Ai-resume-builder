import pymupdf as fitz
import docx
import re
import uuid
from typing import Dict, Any, List, Tuple
from app.schemas.resume_schema import (
    ResumeData, PersonalInfo, Education, Experience, Project, SkillCategory
)
from app.utils.text_utils import (
    clean_text, EMAIL_REGEX, PHONE_REGEX, URL_REGEX, LINKEDIN_REGEX, GITHUB_REGEX,
    extract_matching_skills, KNOWN_SKILLS
)

SECTION_HEADERS = {
    "education": ["education", "academic background", "academics", "qualifications", "educational details"],
    "experience": ["experience", "work experience", "employment history", "professional experience", "work history"],
    "projects": ["projects", "personal projects", "academic projects", "technical projects"],
    "skills": ["skills", "technical skills", "technologies", "proficiencies", "core competencies"],
    "certifications": ["certifications", "licenses", "certificates", "courses"],
    "summary": ["summary", "professional summary", "about me", "profile", "objective"]
}

def extract_text_from_pdf(file_path: str) -> Tuple[str, List[str]]:
    warnings = []
    text_parts = []
    try:
        doc = fitz.open(file_path)
        if len(doc) == 0:
            warnings.append("The PDF document contains no pages.")
            return "", warnings

        is_scanned = True
        for page_num in range(len(doc)):
            page = doc[page_num]
            t = page.get_text("text")
            if t.strip():
                is_scanned = False
                text_parts.append(t)

        if is_scanned:
            warnings.append("Document appears to be an image-only/scanned PDF. Text extraction may be incomplete without OCR.")

        full_text = "\n".join(text_parts)
        return clean_text(full_text), warnings
    except Exception as e:
        warnings.append(f"PDF extraction error: {str(e)}")
        return "", warnings

def extract_text_from_docx(file_path: str) -> Tuple[str, List[str]]:
    warnings = []
    text_parts = []
    try:
        doc = docx.Document(file_path)
        for p in doc.paragraphs:
            if p.text.strip():
                text_parts.append(p.text)
        for table in doc.tables:
            for row in table.rows:
                row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_text:
                    text_parts.append(" | ".join(row_text))
        return clean_text("\n".join(text_parts)), warnings
    except Exception as e:
        warnings.append(f"DOCX extraction error: {str(e)}")
        return "", warnings

def parse_resume_text(text: str) -> Tuple[ResumeData, List[str]]:
    warnings = []
    resume = ResumeData()
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        warnings.append("No text could be extracted from the document.")
        return resume, warnings

    # 1. Contact info
    personal = PersonalInfo()
    # Name is typically the first clean line
    personal.fullName = lines[0][:60]

    emails = EMAIL_REGEX.findall(text)
    if emails:
        personal.email = emails[0]
    else:
        warnings.append("Could not automatically identify email address.")

    phones = PHONE_REGEX.findall(text)
    if phones:
        # Match might be tuple or string
        phone_match = phones[0]
        personal.phone = phone_match if isinstance(phone_match, str) else phone_match[0]

    linkedin = LINKEDIN_REGEX.findall(text)
    if linkedin:
        personal.linkedin = f"https://linkedin.com/in/{linkedin[0]}"

    github = GITHUB_REGEX.findall(text)
    if github:
        personal.github = f"https://github.com/{github[0]}"

    # Professional Title: check line 2
    if len(lines) > 1 and not EMAIL_REGEX.search(lines[1]) and not PHONE_REGEX.search(lines[1]):
        if len(lines[1]) < 60:
            personal.professionalTitle = lines[1]

    resume.personalInfo = personal

    # 2. Section Segmentation
    sections: Dict[str, List[str]] = {
        "summary": [],
        "education": [],
        "experience": [],
        "projects": [],
        "skills": [],
        "other": []
    }

    current_section = "summary"
    for line in lines[1:]:
        line_lower = line.lower().strip(": ")
        matched_section = None
        for sec_name, headers in SECTION_HEADERS.items():
            if line_lower in headers or any(line_lower == h for h in headers):
                matched_section = sec_name
                break
        
        if matched_section:
            current_section = matched_section
        else:
            if current_section in sections:
                sections[current_section].append(line)
            else:
                sections["other"].append(line)

    # 3. Populate Professional Summary
    if sections["summary"]:
        resume.professionalSummary = " ".join(sections["summary"][:5])

    # 4. Populate Skills
    extracted_skills = extract_matching_skills(text)
    if extracted_skills:
        tech_skills = [s for s in extracted_skills if s.lower() not in {"leadership", "communication", "teamwork", "agile", "scrum", "problem solving"}]
        soft_skills = [s for s in extracted_skills if s.lower() in {"leadership", "communication", "teamwork", "agile", "scrum", "problem solving"}]
        
        skill_cats = []
        if tech_skills:
            skill_cats.append(SkillCategory(category="Technical Skills", items=tech_skills))
        if soft_skills:
            skill_cats.append(SkillCategory(category="Core Competencies", items=soft_skills))
        resume.skills = skill_cats
    else:
        warnings.append("No technical skills were automatically detected.")

    # 5. Populate Education
    edu_lines = sections["education"]
    if edu_lines:
        edu_item = Education(
            id=str(uuid.uuid4())[:8],
            institution=edu_lines[0] if len(edu_lines) > 0 else "University / College",
            degree=edu_lines[1] if len(edu_lines) > 1 else "Degree",
            fieldOfStudy="",
            startDate="",
            endDate="",
            description="\n".join(edu_lines[2:5]) if len(edu_lines) > 2 else ""
        )
        resume.education.append(edu_item)

    # 6. Populate Experience
    exp_lines = sections["experience"]
    if exp_lines:
        exp_item = Experience(
            id=str(uuid.uuid4())[:8],
            company=exp_lines[0] if len(exp_lines) > 0 else "Organization",
            position=exp_lines[1] if len(exp_lines) > 1 else "Role",
            responsibilities=[line for line in exp_lines[2:8] if len(line) > 15] or [exp_lines[0]]
        )
        resume.experience.append(exp_item)

    # 7. Populate Projects
    proj_lines = sections["projects"]
    if proj_lines:
        proj_item = Project(
            id=str(uuid.uuid4())[:8],
            name=proj_lines[0] if len(proj_lines) > 0 else "Project",
            description="\n".join(proj_lines[1:4]) if len(proj_lines) > 1 else "",
            technologies=[s for s in extracted_skills[:4]]
        )
        resume.projects.append(proj_item)

    return resume, warnings
