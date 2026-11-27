import re
from typing import List, Dict, Any

SECTION_SYNONYMS: Dict[str, List[str]] = {
    "header": [
        "contact", "contact info", "contact information", "contact details",
        "personal details", "personal info", "personal information"
    ],
    "summary": [
        "summary", "professional summary", "profile", "about me",
        "objective", "career objective", "career summary", "executive summary",
        "professional profile", "profil", "über mich", "uber mich", "resumen"
    ],
    "experience": [
        "experience", "work experience", "professional experience", "employment",
        "employment history", "work history", "career history", "internships",
        "internship experience", "relevant experience", "where i've worked",
        "berufserfahrung", "erfahrung", "experience professionnelle", "expérience professionnelle",
        "experiencia laboral", "experiencia profesional"
    ],
    "education": [
        "education", "academic background", "academics", "qualifications",
        "educational qualification", "educational qualifications", "academic profile",
        "education & training", "ausbildung", "studium", "formation",
        "éducation", "educacion", "educación", "formacion"
    ],
    "skills": [
        "skills", "technical skills", "core competencies", "technical core competencies",
        "key skills", "expertise", "technologies", "tools", "tech stack", "skill set",
        "technical expertise", "skills & technologies", "tools & frameworks", "competencies",
        "toolkit", "kenntnisse", "fähigkeiten", "fahigkeiten", "kompetenzen",
        "compétences", "competences", "habilidades"
    ],
    "projects": [
        "projects", "personal projects", "academic projects", "key projects",
        "selected projects", "featured projects", "technical projects",
        "notable projects", "portfolio", "project experience", "project work",
        "data & analytics projects", "software projects", "engineering projects"
    ],
    "certifications": [
        "certifications", "certificates", "licenses", "licenses & certifications",
        "courses", "training", "credentials", "licenses and certifications"
    ],
    "languages": [
        "languages", "language proficiency", "spoken languages"
    ],
    "awards": [
        "awards", "honors", "honours", "achievements", "accomplishments",
        "scholarships", "recognition", "honors & awards"
    ],
    "publications": [
        "publications", "research", "papers", "patents", "research & publications"
    ],
    "volunteer": [
        "volunteer", "volunteering", "community service", "leadership",
        "extracurricular", "extracurricular activities", "activities", "volunteer experience"
    ],
    "references": [
        "references", "referees"
    ],
}

CUSTOM_HEADING_ALLOWLIST = {
    "interests", "hobbies", "declaration", "open source", "talks",
    "memberships", "affiliations", "conferences", "workshops", "strengths"
}

PROGRAMMING_LANG_HINTS = {
    "python", "java", "c++", "c#", "javascript", "typescript", "golang",
    "rust", "ruby", "php", "kotlin", "swift", "sql", "html", "css", "bash", "r"
}

def _normalize_heading_candidate(line: str) -> str:
    clean = re.sub(r'^[#*\-•▪➢\s]+', '', line).strip()
    clean = re.sub(r'[:\-–—|\s]+$', '', clean).strip()
    return clean.lower()

def _is_probable_heading(line: str) -> bool:
    """
    A heading is short (< 45 chars), has no sentence-ending period,
    does not start with a bullet glyph, and does not contain an email/URL.
    """
    raw = line.strip()
    if not raw or len(raw) > 45:
        return False
    if raw.startswith(('-', '*', '•', '▪', '➢')):
        return False
    if "@" in raw or "http" in raw.lower():
        return False
    if raw.endswith('.'):
        return False
    # Reject lines that look like date ranges or sentences with many words
    words = raw.split()
    if len(words) > 5:
        return False
    return True

class SectionSegmenter:
    """
    Stage 2: Deterministic Section Segmentation.
    Splits acquired document text into section-scoped blocks:
    [{ "section_type": str, "heading_raw": str, "text": str, "page": int }]
    Ensures text before the first heading is strictly isolated as `header`.
    """

    @classmethod
    def segment(cls, text: str) -> List[Dict[str, Any]]:
        if not text or not text.strip():
            return []

        lines = text.splitlines()
        blocks: List[Dict[str, Any]] = []

        current_type = "header"
        current_heading = ""
        current_lines: List[str] = []
        current_page = 1
        block_start_page = 1

        # Build fast lookup map from synonym -> section_type
        synonym_map: Dict[str, str] = {}
        for sec_type, syns in SECTION_SYNONYMS.items():
            for s in syns:
                synonym_map[s] = sec_type

        for line in lines:
            stripped = line.strip()
            if not stripped:
                current_lines.append("")
                continue

            # Track [[page N]] markers
            page_m = re.match(r'^\[\[page\s+(\d+)\]\]$', stripped, re.IGNORECASE)
            if page_m:
                current_page = int(page_m.group(1))
                continue

            matched_type = None
            heading_raw = ""

            is_inline_skill_cat = (
                current_type == "skills"
                and ":" in stripped
                and bool(stripped.split(":", 1)[1].strip())
            )
            if not is_inline_skill_cat and _is_probable_heading(stripped):
                norm = _normalize_heading_candidate(stripped)
                has_header_content = any(l.strip() for l in current_lines)
                if norm in synonym_map:
                    matched_type = synonym_map[norm]
                    heading_raw = stripped.rstrip(':').strip()
                else:
                    from app.services.section_classifier import classify_heading
                    cls_type, cls_conf = classify_heading(stripped)
                    if cls_type != "custom" and cls_conf >= 0.85:
                        matched_type = cls_type
                        heading_raw = stripped.rstrip(':').strip()
                    elif norm.endswith(("projects", "project work")):
                        matched_type = "projects"
                        heading_raw = stripped.rstrip(':').strip()
                    elif norm.endswith(("competencies", "skills", "tech stack")):
                        matched_type = "skills"
                        heading_raw = stripped.rstrip(':').strip()
                    elif norm.endswith("experience"):
                        matched_type = "experience"
                        heading_raw = stripped.rstrip(':').strip()
                    elif norm in CUSTOM_HEADING_ALLOWLIST or (
                        (current_type != "header" or has_header_content)
                        and stripped.isupper()
                        and 1 <= len(norm.split()) <= 3
                        and not any(ch.isdigit() for ch in norm)
                    ):
                        matched_type = "custom"
                        heading_raw = stripped.rstrip(':').strip()

            if matched_type:
                if matched_type == "header" and current_type == "header":
                    # Subheading inside header (e.g. CONTACT in sidebar) — keep in header block
                    continue
                # Flush previous block if it has content
                body_text = "\n".join(current_lines).strip()
                if body_text or current_type == "header":
                    blocks.append({
                        "section_type": current_type,
                        "heading_raw": current_heading,
                        "text": body_text,
                        "page": block_start_page
                    })
                current_type = matched_type
                current_heading = heading_raw
                current_lines = []
                block_start_page = current_page
            else:
                current_lines.append(line)

        # Flush final block
        final_body = "\n".join(current_lines).strip()
        if final_body:
            blocks.append({
                "section_type": current_type,
                "heading_raw": current_heading,
                "text": final_body,
                "page": block_start_page
            })

        # Disambiguate "languages" heading containing programming languages -> skills
        for blk in blocks:
            if blk["section_type"] == "languages":
                lower_body = blk["text"].lower()
                tokens = set(re.findall(r'[a-z+#.]+', lower_body))
                if len(tokens & PROGRAMMING_LANG_HINTS) >= 2:
                    blk["section_type"] = "skills"

        return blocks
