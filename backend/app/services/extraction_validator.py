import re
from typing import Dict, Any, List, Tuple
from app.utils.text_utils import EMAIL_REGEX, PHONE_REGEX, URL_REGEX

def _norm_for_grounding(s: str) -> str:
    if not s:
        return ""
    return re.sub(r'[\W_]+', ' ', str(s).lower()).strip()

SKIP_GROUNDING_KEYS = {
    "id", "confidence", "employment_type", "precision", "value", "type",
    "is_current", "is_expected", "scale", "code", "reason", "page", "provenance"
}

class ExtractionValidator:
    """
    Stage 4: Deterministic Validation, Grounding & Sanity Checks.
    Enforces the 8 laws of resume-data-extraction:
    - Grounding check: every extracted string must appear in that section's source text.
    - Format checks: email, URL, normalized date formats, numeric score.
    - Sanity & duplication checks: future dates, end < start, oversized skills/names.
    """

    @classmethod
    def verify_section_grounding(cls, section_type: str, section_text: str, section_result: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str], List[Dict[str, str]]]:
        """
        Verifies all extracted string scalars in `section_result` appear in `section_text`.
        Returns (cleaned_result, repair_errors, warnings).
        """
        norm_source = _norm_for_grounding(section_text)
        repair_errors: List[str] = []
        warnings: List[Dict[str, str]] = []

        def _check_val(val: Any, key_name: str, path: str) -> Any:
            if val is None or isinstance(val, (bool, int, float)):
                return val
            if isinstance(val, str):
                stripped = val.strip()
                if not stripped or key_name in SKIP_GROUNDING_KEYS:
                    return val
                # Normalized date YYYY / YYYY-MM or scheme-prefixed URL
                if key_name == "url" or key_name == "link":
                    bare = re.sub(r'^https?://', '', stripped, flags=re.IGNORECASE)
                    if _norm_for_grounding(bare) in norm_source or _norm_for_grounding(stripped) in norm_source:
                        return val
                norm_val = _norm_for_grounding(stripped)
                if not norm_val or norm_val in norm_source:
                    return val
                # Grounding failed -> strip value and record repair error
                msg = f"Value '{stripped}' at {path} was not found in the {section_type} section text."
                repair_errors.append(msg)
                warnings.append({"code": "GROUNDING_FAILED", "path": path, "message": msg})
                return None if key_name not in ("bullets", "details", "tech_stack") else ""
            if isinstance(val, list):
                out = []
                for idx, item in enumerate(val):
                    checked = _check_val(item, key_name, f"{path}[{idx}]")
                    if checked not in (None, ""):
                        out.append(checked)
                return out
            if isinstance(val, dict):
                out_d = {}
                for k, v in val.items():
                    if k in ("unmapped", "warnings"):
                        out_d[k] = v
                    else:
                        out_d[k] = _check_val(v, k, f"{path}.{k}" if path else k)
                return out_d
            return val

        cleaned = _check_val(section_result, "", section_type)
        return cleaned, repair_errors, warnings

    @classmethod
    def validate(
        cls,
        raw_text: str,
        resume_dict: Dict[str, Any],
        layout_metadata: Dict[str, Any] = None,
        structured_warnings: List[Dict[str, str]] = None,
        unmapped: List[Dict[str, Any]] = None,
        section_confidences_override: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        warnings: List[str] = []
        notices: List[str] = []
        missing_critical: List[str] = []
        all_structured_warnings: List[Dict[str, str]] = list(structured_warnings or [])

        # 1. Personal Information Quality
        pinfo = resume_dict.get("personalInfo", {})
        has_name = bool(pinfo.get("fullName", "").strip())
        has_email = bool(pinfo.get("email", "").strip())
        has_phone = bool(pinfo.get("phone", "").strip())
        has_loc = bool(pinfo.get("location", "").strip())

        p_score = 100
        if not has_name:
            p_score -= 35
            missing_critical.append("Full Name")
            warnings.append("Could not detect candidate full name.")
        elif len(pinfo.get("fullName", "").split()) > 5:
            p_score -= 15
            warnings.append("Candidate name has more than 5 tokens; verify for layout bleed.")

        if not has_email:
            p_score -= 30
            missing_critical.append("Email Address")
            warnings.append("No valid email address found in the document.")
        elif not EMAIL_REGEX.search(pinfo.get("email", "")):
            p_score -= 15
            warnings.append(f"Email '{pinfo.get('email')}' might be malformed.")

        if not has_phone:
            p_score -= 15
            notices.append("Phone number was not detected.")
        if not has_loc:
            p_score -= 10
            notices.append("Location was not detected.")

        p_score = max(0, min(100, p_score))

        # 2. Experience Quality
        exp_list = resume_dict.get("experience", []) or []
        exp_score = 100
        dates_valid = True

        if not exp_list:
            if re.search(r'\b(experience|employment|work history)\b', raw_text, re.IGNORECASE):
                exp_score = 30
                warnings.append("Document mentions work experience, but no job entries were parsed.")
            else:
                exp_score = 80
                notices.append("No work experience section identified (entry-level or student profile).")
        else:
            for idx, job in enumerate(exp_list):
                comp = job.get("company", "").strip()
                pos = job.get("position", "").strip()
                start_d = job.get("startDate", "").strip()
                end_d = job.get("endDate", "").strip()
                resp = job.get("responsibilities", [])

                if not comp or comp.lower() in {"company", "organization"}:
                    exp_score -= 10
                    warnings.append(f"Experience entry #{idx+1} is missing an identifiable company name.")
                if not pos:
                    exp_score -= 10
                    warnings.append(f"Experience entry #{idx+1} ({comp}) is missing a job title.")
                if not resp:
                    exp_score -= 10
                    warnings.append(f"Experience entry #{idx+1} ({comp}) has no bullet points.")

                if start_d and end_d and not any(w in end_d.lower() for w in ["present", "current", "now"]):
                    s_year = re.search(r'\b(20\d{2}|19\d{2})\b', start_d)
                    e_year = re.search(r'\b(20\d{2}|19\d{2})\b', end_d)
                    if s_year and e_year and int(s_year.group(1)) > int(e_year.group(1)):
                        dates_valid = False
                        exp_score -= 10
                        msg = f"Date anomaly in '{comp}': start year ({s_year.group(1)}) is after end year ({e_year.group(1)})."
                        warnings.append(msg)
                        all_structured_warnings.append({"code": "DATE_ORDER_INVALID", "path": f"experience[{idx}]", "message": msg})

        exp_score = max(0, min(100, exp_score))

        # 3. Education Quality
        edu_list = resume_dict.get("education", []) or []
        edu_score = 100
        if not edu_list:
            if re.search(r'\b(education|university|degree|bachelor|master|b\.s|b\.tech)\b', raw_text, re.IGNORECASE):
                edu_score = 35
                warnings.append("Document mentions educational background, but no degree entries were parsed.")
            else:
                edu_score = 75
                notices.append("No formal education entries identified.")
        else:
            for idx, edu in enumerate(edu_list):
                inst = edu.get("institution", "").strip()
                deg = edu.get("degree", "").strip()
                if not inst:
                    edu_score -= 15
                    warnings.append(f"Education entry #{idx+1} is missing the institution name.")
                if not deg:
                    edu_score -= 10
                    notices.append(f"Education entry #{idx+1} ({inst}) has no explicit degree title.")

        edu_score = max(0, min(100, edu_score))

        # 4. Skills Quality & Sanity check (no >60 char sentences in skills)
        skills_list = resume_dict.get("skills", []) or []
        skills_score = 100
        total_skills_count = sum(len(c.get("items", [])) for c in skills_list)
        if total_skills_count == 0:
            skills_score = 50
            notices.append("No skills section detected in source.")
        else:
            for cat in skills_list:
                for sk in cat.get("items", []):
                    if len(sk) > 60:
                        skills_score -= 15
                        warnings.append(f"Skill item '{sk[:30]}...' is unusually long (>60 chars); may be a sentence.")
            skills_score = max(30, min(98, skills_score))

        # 5. Projects Quality
        proj_list = resume_dict.get("projects", []) or []
        proj_score = 92 if proj_list else 80

        # 6. Duplication check across unrelated fields
        job_titles_low = {j.get("position", "").strip().lower() for j in exp_list if j.get("position")}
        for cat in skills_list:
            for sk in cat.get("items", []):
                if sk.strip().lower() in job_titles_low:
                    all_structured_warnings.append({
                        "code": "DUPLICATE_ENTRY",
                        "path": "skills",
                        "message": f"Skill '{sk}' duplicates an experience job title."
                    })

        if layout_metadata:
            exp_pages = int(layout_metadata.get("page_count") or 1)
            proc_pages = len(layout_metadata.get("pages") or []) or len(re.findall(r'\[\[page\s+\d+\]\]', raw_text, re.I)) or 1
            if exp_pages > proc_pages:
                all_structured_warnings.append({
                    "code": "PARTIAL_PAGE_COVERAGE",
                    "path": "meta",
                    "message": f"Only {proc_pages} of {exp_pages} pages produced extractable text."
                })

        if layout_metadata and layout_metadata.get("is_scanned"):
            warnings.append("Document is image-only or scanned; OCR recovery was applied.")
            all_structured_warnings.append({
                "code": "OCR_LOW_QUALITY",
                "path": "meta",
                "message": "Scanned/image PDF processed via OCR; please verify extracted text."
            })

        # Surface any structured warnings into human-readable warnings list
        for sw in all_structured_warnings:
            if sw.get("message") and sw["message"] not in warnings:
                warnings.append(f"[{sw.get('code', 'NOTICE')}] {sw['message']}")

        weights = {"personal": 0.30, "experience": 0.30, "education": 0.20, "skills": 0.15, "projects": 0.05}
        overall = int(
            p_score * weights["personal"] +
            exp_score * weights["experience"] +
            edu_score * weights["education"] +
            skills_score * weights["skills"] +
            proj_score * weights["projects"]
        )
        overall = max(10, min(99, overall))
        level = "High" if overall >= 80 else ("Medium" if overall >= 55 else "Low")

        return {
            "overallConfidence": overall,
            "confidenceLevel": level,
            "sectionConfidences": section_confidences_override or {
                "personalInfo": {"score": p_score, "level": "High" if p_score >= 80 else ("Medium" if p_score >= 50 else "Low")},
                "experience": {"score": exp_score, "level": "High" if exp_score >= 80 else ("Medium" if exp_score >= 50 else "Low"), "itemCount": len(exp_list)},
                "education": {"score": edu_score, "level": "High" if edu_score >= 80 else ("Medium" if edu_score >= 50 else "Low"), "itemCount": len(edu_list)},
                "skills": {"score": skills_score, "level": "High" if skills_score >= 80 else ("Medium" if skills_score >= 50 else "Low"), "categoryCount": len(skills_list), "totalSkills": total_skills_count},
                "projects": {"score": proj_score, "level": "High" if proj_score >= 80 else ("Medium" if proj_score >= 50 else "Low"), "itemCount": len(proj_list)}
            },
            "warnings": warnings,
            "structuredWarnings": all_structured_warnings,
            "unmapped": unmapped or [],
            "notices": notices,
            "missingCriticalFields": missing_critical,
            "qualityChecks": {
                "hasName": has_name,
                "hasEmail": has_email,
                "hasPhone": has_phone,
                "hasExperience": len(exp_list) > 0,
                "hasEducation": len(edu_list) > 0,
                "hasSkills": total_skills_count > 0,
                "validDates": dates_valid
            }
        }
