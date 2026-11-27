"""
Dynamic Semantic Section Classifier
Classifies standard, creative, multi-industry, and unfamiliar resume headings
into normalized categories with confidence scores, preserving unknown headings
as customSections instead of discarding them.
"""
import re
from typing import Tuple, List, Dict, Any

SECTION_PATTERNS: List[Tuple[str, re.Pattern, float]] = [
    ("summary", re.compile(
        r'^(?:professional\s+summary|executive\s+summary|career\s+summary|summary|profile|professional\s+profile|'
        r'about\s+me|about|career\s+objective|objective|personal\s+statement|career\s+overview|'
        r'professional\s+introduction|career\s+highlights|synopsis|bio)\b',
        re.IGNORECASE
    ), 0.96),
    ("internships", re.compile(
        r'^(?:internships?|internship\s+experience|summer\s+internships?|research\s+internships?|'
        r'industrial\s+training|practical\s+training|work\s+placement|trainee\s+experience|'
        r'apprenticeship|practicum|clerkship|clinical\s+rotations?)\b',
        re.IGNORECASE
    ), 0.95),
    ("experience", re.compile(
        r'^(?:work\s+experience|professional\s+experience|employment\s+history|employment|experience|'
        r'work\s+history|career\s+history|relevant\s+experience|engineering\s+experience|'
        r'clinical\s+experience|teaching\s+experience|academic\s+(?:experience|appointments)|industry\s+experience|'
        r'professional\s+background|where\s+i(?:\'ve|\s+have)\s+worked|my\s+journey|career\s+timeline|career\s+trajectory|'
        r'consulting\s+experience|freelance\s+(?:work|experience)|positions\s+held|experiencia\s+laboral)\b',
        re.IGNORECASE
    ), 0.95),
    ("education", re.compile(
        r'^(?:education\s*(?:&|and)\s*academics|education\s*(?:&|and)\s*training|education|'
        r'academic\s+background|academic\s+history|academics|academic\s+credentials|qualifications|'
        r'educational\s+qualifications|degrees|scholastic\s+record|schooling|where\s+i\s+studied|educaci[oó]n)\b',
        re.IGNORECASE
    ), 0.96),
    ("projects", re.compile(
        r'^(?:(?:featured|key|technical|personal|academic|selected|notable|major|minor|relevant|independent|capstone|final\s+year|research|open\s+source|portfolio)\s+projects|'
        r'projects|project\s+experience|project\s+work|portfolio\s*(?:&|and)\s*projects|selected\s+work|'
        r'what\s+i(?:\'ve|\s+have)\s+built|architectures\s*(?:&|and)\s*systems|case\s+studies|product\s+development|open\s+source\s+contributions)\b',
        re.IGNORECASE
    ), 0.95),
    ("skills", re.compile(
        r'^(?:(?:core\s+)?technical\s+skills|core\s+skills|technical\s+competencies|technical\s+expertise|'
        r'technical\s+toolbox|toolbox|skills\s*(?:&|and)\s*(?:competencies|tools|expertise|technologies)|skills|'
        r'technologies|tech\s+stack|proficiencies|tools\s*(?:&|and)\s*technologies|core\s+competencies|'
        r'key\s+skills|areas\s+of\s+expertise|competencies|clinical\s+skills|domain\s+expertise)\b',
        re.IGNORECASE
    ), 0.95),
    ("certifications", re.compile(
        r'^(?:certifications?(?:\s*(?:&|and)\s*(?:licenses|credentials|courses))?|certificates|licenses|'
        r'licenses\s*(?:&|and)\s*certifications?|courses|credentials|professional\s+development|'
        r'workshops(?:\s*(?:&|and)\s*seminars)?|training(?:\s+programs)?|accreditations|bar\s+admissions)\b',
        re.IGNORECASE
    ), 0.94),
    ("publications", re.compile(
        r'^(?:publications?|selected\s+publications?|research\s+papers|research\s*(?:&|and)\s*publications?|'
        r'papers|articles|whitepapers|patents(?:\s*(?:&|and)\s*publications?)?|published\s+works|citations)\b',
        re.IGNORECASE
    ), 0.94),
    ("volunteer", re.compile(
        r'^(?:volunteer\s+experience|volunteering|volunteer\s+work|community\s+service|social\s+work|'
        r'extracurricular\s+activities|civic\s+engagement)\b',
        re.IGNORECASE
    ), 0.93),
    ("achievements", re.compile(
        r'^(?:achievements|awards(?:\s*(?:&|and)\s*(?:honors|honours|recognition))?|honors|honours|'
        r'accomplishments|what\s+i(?:\'ve|\s+have)\s+achieved|recognition|scholarships|hackathons)\b',
        re.IGNORECASE
    ), 0.93),
    ("leadership", re.compile(
        r'^(?:leaderships?(?:\s*(?:&|and|interpersonal)?\s*skills)?|leadership\s+experience|'
        r'positions\s+of\s+responsibility|interpersonal\s+skills|soft\s+skills|student\s+organizations)\b',
        re.IGNORECASE
    ), 0.90),
    ("languages", re.compile(
        r'^(?:languages|language\s+proficiency|spoken\s+languages)\b',
        re.IGNORECASE
    ), 0.95),
]

# Non-standard headings that should be preserved cleanly as Custom Sections with their original title
CUSTOM_HEADING_HINTS = re.compile(
    r'^(?:research\s+interests|grants(?:\s*(?:&|and)\s*funding)?|conferences|seminars|presentations|'
    r'professional\s+memberships|professional\s+affiliations|affiliations|memberships|hobbies|'
    r'interests|references|military\s+experience|entrepreneurship|portfolio\s+highlights|'
    r'additional\s+information|extra[\-\s]?curriculars?|activities|editorial\s+service)\b',
    re.IGNORECASE
)


_COMPACT_HEADING_MAP = {
    "professionalsummary": "summary",
    "executivesummary": "summary",
    "careersummary": "summary",
    "profilesummary": "summary",
    "summary": "summary",
    "aboutme": "summary",
    "about": "summary",
    "profile": "summary",
    "objective": "summary",
    "careerobjective": "summary",
    "professionalexperience": "experience",
    "workexperience": "experience",
    "employmenthistory": "experience",
    "experience": "experience",
    "workhistory": "experience",
    "careerhistory": "experience",
    "internships": "experience",
    "internshipexperience": "experience",
    "keyprojectssystems": "projects",
    "keyprojects": "projects",
    "projects": "projects",
    "personalprojects": "projects",
    "academicprojects": "projects",
    "selectedprojects": "projects",
    "notableprojects": "projects",
    "technicalcoreskills": "skills",
    "technicalskills": "skills",
    "coreskills": "skills",
    "skills": "skills",
    "corecompetencies": "skills",
    "technologies": "skills",
    "education": "education",
    "academicbackground": "education",
    "educationalbackground": "education",
    "academics": "education",
    "qualifications": "education",
    "certificationscredentials": "certifications",
    "certifications": "certifications",
    "licensescertifications": "certifications",
    "credentials": "certifications",
    "certificates": "certifications",
}


def classify_heading(heading_text: str, following_lines: List[str] = None) -> Tuple[str, float]:
    """
    Classifies a candidate heading into a normalized resume category or 'custom'.
    Uses both heading text and surrounding content signals.
    """
    clean = re.sub(r'^[#*\-•:\[\s]+|[:\]\s]+$', '', str(heading_text or '')).strip()
    if not clean:
        return ("unknown", 0.0)

    for cat, pattern, conf in SECTION_PATTERNS:
        if pattern.match(clean):
            return (cat, conf)

    compact = re.sub(r'[^a-z]', '', clean.lower())
    if compact in _COMPACT_HEADING_MAP:
        return (_COMPACT_HEADING_MAP[compact], 0.94)

    if CUSTOM_HEADING_HINTS.match(clean):
        return ("custom", 0.90)

    # Semantic fallback using following paragraph content if heading is creative/unusual
    if following_lines:
        sample = " ".join(following_lines[:5]).lower()
        if any(k in sample for k in ("bachelor", "master", "ph.d", "university", "cgpa", "gpa", "diploma")):
            if any(w in clean.lower() for w in ("academic", "study", "school", "degree", "learning")):
                return ("education", 0.78)
        if any(k in sample for k in ("github.com", "tech stack", "built ", "developed ")) and "project" in clean.lower():
            return ("projects", 0.78)

    # If it looks like a standalone title-case / uppercase heading (<= 5 words, no period at end), preserve as custom section
    words = clean.split()
    if 1 <= len(words) <= 5 and not clean.endswith('.') and not '@' in clean and not 'http' in clean.lower():
        if clean.isupper() or all(w[0].isupper() for w in words if w and w[0].isalpha()):
            return ("custom", 0.75)

    return ("unknown", 0.0)
