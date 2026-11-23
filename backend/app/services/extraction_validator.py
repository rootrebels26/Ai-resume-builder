import re
from typing import Dict, Any, List, Tuple
from app.utils.text_utils import EMAIL_REGEX, PHONE_REGEX, URL_REGEX

class ExtractionValidator:
    """
    Validates parsed resume data against document contents, assesses confidence,
    detects date inconsistencies, missing critical fields, duplicate entries,
    and potential omissions.
    """

    @classmethod
    def validate(cls, raw_text: str, resume_dict: Dict[str, Any], layout_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        warnings: List[str] = []
        notices: List[str] = []
        missing_critical: List[str] = []

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
        elif len(pinfo.get("fullName", "")) > 60:
            p_score -= 10
            warnings.append("Candidate name appears unusually long; verify for layout bleed.")

        if not has_email:
            p_score -= 30
            missing_critical.append("Email Address")
            warnings.append("No valid email address found in the document.")
        else:
            if not EMAIL_REGEX.search(pinfo.get("email", "")):
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
            # Check if raw text suggested work experience existed
            if re.search(r'\b(experience|employment|work history)\b', raw_text, re.IGNORECASE):
                exp_score = 30
                warnings.append("Document mentions work experience, but no job entries were parsed.")
            else:
                exp_score = 80
                notices.append("No work experience section identified (entry-level or student profile).")
        else:
            seen_companies = set()
            for idx, job in enumerate(exp_list):
                comp = job.get("company", "").strip()
                pos = job.get("position", "").strip()
                start_d = job.get("startDate", "").strip()
                end_d = job.get("endDate", "").strip()
                resp = job.get("responsibilities", [])

                if not comp or comp.lower() in {"company", "organization"}:
                    exp_score -= 10
                    warnings.append(f"Experience entry #{idx+1} is missing an identifiable company name.")
                elif comp.lower() in seen_companies:
                    notices.append(f"Multiple entries found for company '{comp}'.")
                seen_companies.add(comp.lower())

                if not pos:
                    exp_score -= 10
                    warnings.append(f"Experience entry #{idx+1} ({comp}) is missing a job title.")

                if not resp:
                    exp_score -= 10
                    warnings.append(f"Experience entry #{idx+1} ({comp}) has no bullet points or description.")

                # Date verification
                if start_d and end_d and not any(w in end_d.lower() for w in ["present", "current", "now"]):
                    s_year = re.search(r'\b(20\d{2}|19\d{2})\b', start_d)
                    e_year = re.search(r'\b(20\d{2}|19\d{2})\b', end_d)
                    if s_year and e_year:
                        if int(s_year.group(1)) > int(e_year.group(1)):
                            dates_valid = False
                            exp_score -= 10
                            warnings.append(f"Date anomaly in '{comp}': start year ({s_year.group(1)}) is after end year ({e_year.group(1)}).")

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

        # 4. Skills Quality
        skills_list = resume_dict.get("skills", []) or []
        skills_score = 100
        total_skills_count = sum(len(c.get("items", [])) for c in skills_list)

        if total_skills_count == 0:
            skills_score = 30
            warnings.append("No technical or professional skills were detected.")
        elif total_skills_count < 4:
            skills_score = 65
            notices.append(f"Only {total_skills_count} skill(s) detected. Candidate may want to add more.")
        else:
            skills_score = 95

        # 5. Projects Quality
        proj_list = resume_dict.get("projects", []) or []
        proj_score = 90 if proj_list else 75

        # 6. Scanned PDF / Layout checks
        if layout_metadata and layout_metadata.get("is_scanned"):
            warnings.append("Document is image-only or scanned. Text was extracted with visual heuristics.")

        # Aggregate Overall Confidence
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
            "sectionConfidences": {
                "personalInfo": {"score": p_score, "level": "High" if p_score >= 80 else ("Medium" if p_score >= 50 else "Low")},
                "experience": {"score": exp_score, "level": "High" if exp_score >= 80 else ("Medium" if exp_score >= 50 else "Low"), "itemCount": len(exp_list)},
                "education": {"score": edu_score, "level": "High" if edu_score >= 80 else ("Medium" if edu_score >= 50 else "Low"), "itemCount": len(edu_list)},
                "skills": {"score": skills_score, "level": "High" if skills_score >= 80 else ("Medium" if skills_score >= 50 else "Low"), "categoryCount": len(skills_list), "totalSkills": total_skills_count},
                "projects": {"score": proj_score, "level": "High" if proj_score >= 80 else ("Medium" if proj_score >= 50 else "Low"), "itemCount": len(proj_list)}
            },
            "warnings": warnings,
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
