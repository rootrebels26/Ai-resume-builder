import re
from typing import Dict, Any, List, Optional, Tuple
from app.services.section_prompts import (
    scan_and_strip_untrusted_lines,
    normalize_date_token,
)
from app.utils.text_utils import EMAIL_REGEX, PHONE_REGEX, URL_REGEX

COMPANY_SUFFIXES = re.compile(
    r'\b(inc\.?|llc|ltd\.?|pvt\.?|pvt\.?\s*ltd\.?|technologies|solutions|labs|systems|corp\.?|corporation|university|bank|group|studios|ventures)\b',
    re.IGNORECASE,
)
TITLE_KEYWORDS = re.compile(
    r'\b(engineer|developer|manager|analyst|designer|lead|intern|internship|consultant|architect|associate|director|head|executive|officer|scientist|specialist|coordinator|administrator)\b',
    re.IGNORECASE,
)
DATE_RANGE_RE = re.compile(
    r'((?:expected\s+|pursuing\s+)?(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+[-,]?\s*(?:19|20)\d{2}|(?:spring|summer|fall|autumn|winter)\s+(?:19|20)\d{2}|(?:19|20)\d{2}-(?:1[0-2]|0?[1-9])|(?:1[0-2]|0?[1-9])/(?:19|20)\d{2}|(?:\d{1,2}/\d{1,2}/(?:19|20)\d{2})|(?:19|20)\d{2}|\'\d{2}))'
    r'\s*(?:[-–—]+|\bto\b)\s*'
    r'((?:expected\s+|pursuing\s+)?(?:present|current|till\s+date|to\s+date|ongoing|now|till\s+now|continuing|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+[-,]?\s*(?:19|20)\d{2}|(?:spring|summer|fall|autumn|winter)\s+(?:19|20)\d{2}|(?:19|20)\d{2}-(?:1[0-2]|0?[1-9])|(?:1[0-2]|0?[1-9])/(?:19|20)\d{2}|(?:\d{1,2}/\d{1,2}/(?:19|20)\d{2})|(?:19|20)\d{2}|\'\d{2}))',
    re.IGNORECASE,
)
SINGLE_DATE_RE = re.compile(
    r'\b((?:expected\s+|pursuing\s+)?(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(?:19|20)\d{2}|(?:19|20)\d{2}-(?:1[0-2]|0?[1-9])|(?:1[0-2]|0?[1-9])/(?:19|20)\d{2}|(?:19|20)\d{2}))\b',
    re.IGNORECASE,
)

PROTECTED_SKILL_TOKENS = {
    "c++", "c#", ".net", "asp.net", "node.js", "next.js", "vue.js", "react.js",
    "express.js", "ci/cd", "tcp/ip", "ui/ux", "pl/sql", "a/b testing", "r&d",
    "spring boot", "machine learning", "deep learning", "natural language processing",
}

def _strip_bullet(line: str) -> Tuple[str, bool]:
    m = re.match(r'^\s*(?:[-*•▪➢●◦]|\bo\s+)\s*(.+)$', line)
    if m:
        return m.group(1).strip(), True
    return line.strip(), False

def _classify_link(url: str, label: str = "") -> Dict[str, str]:
    full = url.strip()
    if not re.match(r'^https?://', full, re.IGNORECASE):
        full = "https://" + full.lstrip("/")
    low = full.lower()
    if "linkedin.com" in low:
        ltype = "linkedin"
    elif "github.com" in low:
        ltype = "github"
    elif "twitter.com" in low or "x.com" in low:
        ltype = "twitter"
    elif "portfolio" in label.lower() or "portfolio" in low:
        ltype = "portfolio"
    else:
        ltype = "other"
    return {"type": ltype, "label": label.strip() or url.strip(), "url": full}

def parse_header_section(text: str) -> Dict[str, Any]:
    warnings: List[Dict[str, str]] = []
    unmapped: List[Dict[str, str]] = []

    lines = [l.strip() for l in text.splitlines() if l.strip()]

    # Emails
    emails = EMAIL_REGEX.findall(text)
    email = emails[0] if emails else None
    if len(set(e.lower() for e in emails)) > 1:
        warnings.append({"code": "MULTIPLE_EMAILS", "message": "Multiple email addresses found in header; used the first."})

    # Phones (preserve exact formatting)
    phone_matches = [m.group(0).strip() for m in PHONE_REGEX.finditer(text)]
    phone = phone_matches[0] if phone_matches else None
    if len(set(re.sub(r'\D', '', p) for p in phone_matches)) > 1:
        warnings.append({"code": "MULTIPLE_PHONES", "message": "Multiple phone numbers found in header; used the first."})

    # Links (both bare URLs and "Label (https://...)" annotations)
    links: List[Dict[str, str]] = []
    seen_urls = set()
    for m in re.finditer(r'([A-Za-z][A-Za-z0-9\s._-]{1,25})\s*\((https?://[^\s)]+)\)', text):
        lbl, url = m.group(1).strip(), m.group(2).strip()
        if url.lower() not in seen_urls:
            seen_urls.add(url.lower())
            links.append(_classify_link(url, lbl))
    for u in URL_REGEX.findall(text):
        u_clean = u.rstrip(".,;)")
        if u_clean.lower() not in seen_urls:
            seen_urls.add(u_clean.lower())
            links.append(_classify_link(u_clean))
    for m in re.finditer(r'\b((?:linkedin\.com/in|github\.com)/[A-Za-z0-9_.-]+)', text, re.IGNORECASE):
        raw_u = m.group(1)
        full_u = "https://" + raw_u
        if full_u.lower() not in seen_urls and not any(raw_u.lower() in s for s in seen_urls):
            seen_urls.add(full_u.lower())
            links.append(_classify_link(full_u, raw_u))

    # Full name: prominent top line (2-4 tokens, mostly letters, not Resume/CV/title)
    full_name: Optional[str] = None
    name_idx = -1
    skip_words = {"resume", "curriculum vitae", "cv", "curriculum", "vitae"}
    for idx, line in enumerate(lines[:6]):
        cand = re.sub(r'^resume\s+of\s+', '', line, flags=re.IGNORECASE).strip()
        # Handle combined header lines like "Sneha Reddy | sneha@fin.in | +91 9811100099"
        if ("|" in cand or "•" in cand) and ("@" in cand or any(ch.isdigit() for ch in cand)):
            for seg in re.split(r'[|•]', cand):
                seg = seg.strip()
                if seg and "@" not in seg and "http" not in seg.lower() and not any(ch.isdigit() for ch in seg):
                    seg_tokens = [t for t in seg.split() if any(c.isalpha() for c in t)]
                    if 1 <= len(seg_tokens) <= 4 and len(seg) <= 45 and not TITLE_KEYWORDS.search(seg):
                        full_name = seg
                        name_idx = idx
                        break
            if full_name:
                break
        low = cand.lower()
        if low in skip_words or "@" in cand or "http" in low or any(ch.isdigit() for ch in cand):
            continue
        if "|" in cand and len(cand) > 35:
            continue
        tokens = [t for t in cand.split() if any(c.isalpha() for c in t)]
        if 1 <= len(tokens) <= 4 and len(cand) <= 45 and not TITLE_KEYWORDS.search(cand):
            full_name = cand
            name_idx = idx
            break

    # Headline: short line directly under full_name that looks like a role/tagline
    headline: Optional[str] = None
    if name_idx >= 0 and name_idx + 1 < len(lines):
        next_l = lines[name_idx + 1]
        if "@" not in next_l and "http" not in next_l.lower() and not PHONE_REGEX.search(next_l):
            if len(next_l) <= 65 and "|" not in next_l and "," not in next_l:
                headline = next_l

    # Location: City, State/Country in header only
    location_obj = None
    loc_m = re.search(
        r'\b([A-Z][a-zA-Z.\s-]{1,25},\s*(?:[A-Z]{2}|[A-Z][a-zA-Z.\s-]{2,25})(?:,\s*[A-Z][a-zA-Z.\s-]{2,25})?)\b',
        text,
    )
    if loc_m:
        raw_loc = loc_m.group(1).strip()
        if "@" not in raw_loc and not TITLE_KEYWORDS.search(raw_loc):
            parts = [p.strip() for p in raw_loc.split(",")]
            location_obj = {
                "city": parts[0] if len(parts) >= 1 else None,
                "region": parts[1] if len(parts) >= 2 else None,
                "country": parts[2] if len(parts) >= 3 else None,
                "raw": raw_loc,
            }

    return {
        "basics": {
            "full_name": full_name,
            "headline": headline,
            "email": email,
            "phone": phone,
            "location": location_obj,
            "links": links,
        },
        "unmapped": unmapped,
        "warnings": warnings,
    }

def _disambiguate_company_title(part_a: str, part_b: str, prev_order: Optional[str] = None) -> Tuple[Optional[str], Optional[str], str, Optional[str]]:
    """
    Returns (company, title, confidence, prev_order_detected).
    prev_order is 'company_first' or 'title_first'.
    """
    a_is_comp = bool(COMPANY_SUFFIXES.search(part_a))
    b_is_comp = bool(COMPANY_SUFFIXES.search(part_b))
    a_is_title = bool(TITLE_KEYWORDS.search(part_a))
    b_is_title = bool(TITLE_KEYWORDS.search(part_b))

    if (a_is_comp and not b_is_comp) or (b_is_title and not a_is_title):
        return part_a, part_b, "high", "company_first"
    if (b_is_comp and not a_is_comp) or (a_is_title and not b_is_title):
        return part_b, part_a, "high", "title_first"
    if prev_order == "company_first":
        return part_a, part_b, "medium", prev_order
    if prev_order == "title_first":
        return part_b, part_a, "medium", prev_order
    return part_a, part_b, "low", None

def _extract_employment_type(text: str) -> Optional[str]:
    low = text.lower()
    if re.search(r'\binternship\b|\bintern\b', low):
        return "Internship"
    if re.search(r'\bfull[- ]time\b', low):
        return "Full-time"
    if re.search(r'\bpart[- ]time\b', low):
        return "Part-time"
    if re.search(r'\bcontract\b', low):
        return "Contract"
    if re.search(r'\bfreelance\b', low):
        return "Freelance"
    return None

def parse_experience_section(text: str) -> Dict[str, Any]:
    warnings: List[Dict[str, str]] = []
    unmapped: List[Dict[str, str]] = []
    entries: List[Dict[str, Any]] = []

    lines = [l.rstrip() for l in text.splitlines() if l.strip()]
    current: Optional[Dict[str, Any]] = None
    prev_order: Optional[str] = None
    last_company: Optional[str] = None

    i = 0
    while i < len(lines):
        raw_line = lines[i].strip()
        cleaned, is_bullet = _strip_bullet(raw_line)
        d_m = DATE_RANGE_RE.search(cleaned)

        # Case 1: Header line with a date range (not a bullet)
        if d_m and not is_bullet and len(cleaned) < 130:
            if current:
                entries.append(current)

            s_obj, _, _, s_warn = normalize_date_token(d_m.group(1))
            e_obj, is_curr, _, e_warn = normalize_date_token(d_m.group(2))
            if s_warn:
                warnings.append({"code": s_warn, "message": f"Ambiguous start date: {d_m.group(1)}"})
            if e_warn:
                warnings.append({"code": e_warn, "message": f"Ambiguous end date: {d_m.group(2)}"})

            if s_obj and e_obj and s_obj.get("value") and e_obj.get("value"):
                if str(e_obj["value"]) < str(s_obj["value"]):
                    warnings.append({
                        "code": "DATE_ORDER_INVALID",
                        "message": f"End date {e_obj['raw']} is before start date {s_obj['raw']}."
                    })

            remainder = (cleaned[:d_m.start()] + " " + cleaned[d_m.end():]).strip(" |–—-,()")

            # Check if remainder has "Title at Company"
            at_m = re.match(r'^(.+?)\s+(?:at|@)\s+(.+)$', remainder, re.IGNORECASE)
            company: Optional[str] = None
            title: Optional[str] = None
            location: Optional[str] = None
            conf = "high"

            if at_m:
                title = at_m.group(1).strip()
                company = at_m.group(2).strip()
            else:
                # Check Company (Title) pattern
                paren_m = re.match(r'^([^(]+)\(([^)]+)\)(.*)$', remainder)
                if paren_m:
                    p1, p2, tail = paren_m.group(1).strip(), paren_m.group(2).strip(), paren_m.group(3).strip(" ,|-")
                    company, title, conf, prev_order = _disambiguate_company_title(p1, p2, prev_order)
                    if tail:
                        location = tail
                else:
                    parts = [p.strip() for p in re.split(r'\s*[|–—]\s*|\s+-\s+|,\s*(?=[A-Z])', remainder) if p.strip()]
                    if len(parts) >= 3:
                        company, title, conf, prev_order = _disambiguate_company_title(parts[0], parts[1], prev_order)
                        location = ", ".join(parts[2:])
                    elif len(parts) == 2:
                        # Could be Company - Location (with Title on next line) OR Title | Company
                        if TITLE_KEYWORDS.search(parts[0]) or TITLE_KEYWORDS.search(parts[1]) or COMPANY_SUFFIXES.search(parts[0]) or COMPANY_SUFFIXES.search(parts[1]):
                            company, title, conf, prev_order = _disambiguate_company_title(parts[0], parts[1], prev_order)
                        else:
                            # Likely Company - Location, check next line for Title
                            company = parts[0]
                            location = parts[1]
                    elif len(parts) == 1:
                        only = parts[0]
                        if TITLE_KEYWORDS.search(only) and not COMPANY_SUFFIXES.search(only):
                            title = only
                            # Check if this is a promotion under previous company
                            if last_company and i > 0:
                                company = last_company
                        else:
                            company = only

            # Look ahead 1 line for Title if missing and next line is non-bullet short text without dates
            if company and not title and i + 1 < len(lines):
                nxt_raw = lines[i + 1].strip()
                nxt_clean, nxt_bullet = _strip_bullet(nxt_raw)
                if not nxt_bullet and not DATE_RANGE_RE.search(nxt_clean) and len(nxt_clean) < 90:
                    if "|" in nxt_clean:
                        nxt_parts = [p.strip() for p in nxt_clean.split("|") if p.strip()]
                        if len(nxt_parts) >= 2 and company.lower() in {"role", "position", "title", "experience"}:
                            p0_l, p1_l = nxt_parts[0].lower(), nxt_parts[1].lower()
                            role_hints = ("intern", "engineer", "developer", "manager", "analyst", "lead", "architect", "scientist", "consultant", "designer")
                            if any(h in p0_l for h in role_hints) and not any(h in p1_l for h in role_hints):
                                title, company = nxt_parts[0], nxt_parts[1]
                            elif any(h in p1_l for h in role_hints) and not any(h in p0_l for h in role_hints):
                                company, title = nxt_parts[0], nxt_parts[1]
                            else:
                                company, title, conf, prev_order = _disambiguate_company_title(nxt_parts[0], nxt_parts[1], prev_order)
                        else:
                            title = nxt_clean
                    else:
                        title = nxt_clean
                    i += 1

            if conf == "low" and company and title:
                warnings.append({
                    "code": "AMBIGUOUS_ORDER",
                    "message": f"Unclear whether '{company}' or '{title}' is company vs title."
                })

            emp_type = _extract_employment_type(cleaned) or (_extract_employment_type(title or ""))
            if company:
                last_company = company

            current = {
                "company": company,
                "title": title,
                "employment_type": emp_type,
                "location": location,
                "start_date": s_obj,
                "end_date": None if is_curr else e_obj,
                "is_current": is_curr,
                "bullets": [],
                "confidence": conf,
            }
            i += 1
            continue

        # Case 2: Non-bullet header line WITHOUT date on it, followed immediately by a date-range line (e.g. Title on line 1, Company | Dates on line 2)
        if not is_bullet and i + 1 < len(lines) and DATE_RANGE_RE.search(lines[i + 1]) and len(cleaned) < 80:
            if current:
                entries.append(current)
            nxt = lines[i + 1].strip()
            d2 = DATE_RANGE_RE.search(nxt)
            s_obj, _, _, _ = normalize_date_token(d2.group(1))
            e_obj, is_curr, _, _ = normalize_date_token(d2.group(2))
            rem2 = (nxt[:d2.start()] + " " + nxt[d2.end():]).strip(" |–—-,()")

            company, title, conf, prev_order = _disambiguate_company_title(cleaned, rem2 or cleaned, prev_order)
            if not rem2:
                company = cleaned
                title = None
            last_company = company or last_company
            current = {
                "company": company,
                "title": title,
                "employment_type": _extract_employment_type(f"{cleaned} {rem2}"),
                "location": None,
                "start_date": s_obj,
                "end_date": None if is_curr else e_obj,
                "is_current": is_curr,
                "bullets": [],
                "confidence": conf,
            }
            i += 2
            continue

        # Case 3: Bullet or prose line inside current job
        if current:
            if is_bullet:
                current["bullets"].append(cleaned)
            else:
                # Rejoin wrapped lines if previous bullet exists and this line doesn't look like a sub-heading
                if current["bullets"] and not re.match(r'^(?:project|tech|technologies|achievements?)\s*:', cleaned, re.IGNORECASE):
                    current["bullets"][-1] = current["bullets"][-1] + " " + cleaned
                else:
                    current["bullets"].append(cleaned)
        else:
            unmapped.append({"raw_text": raw_line, "reason": "Text in experience section before any job header"})

        i += 1

    if current:
        entries.append(current)

    return {"experience": entries, "unmapped": unmapped, "warnings": warnings}

def _parse_edu_score(text: str) -> Optional[Dict[str, Any]]:
    # CGPA: 8.7/10 or GPA 3.8 / 4.0
    m_ratio = re.search(r'\b((?:cgpa|gpa|score|grade)?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?))', text, re.IGNORECASE)
    if m_ratio:
        return {
            "value": float(m_ratio.group(2)),
            "scale": float(m_ratio.group(3)),
            "raw": m_ratio.group(1).strip(),
        }
    # Percentage: 85% or Percentage: 85
    m_pct = re.search(r'\b((?:percentage|aggregate|marks)?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%)', text, re.IGNORECASE)
    if m_pct:
        return {
            "value": float(m_pct.group(2)),
            "scale": 100,
            "raw": m_pct.group(1).strip(),
        }
    # Unscaled CGPA / GPA: "CGPA: 8.7"
    m_unscaled = re.search(r'\b((?:cgpa|gpa)\s*[:\-]?\s*(\d+(?:\.\d+)?))\b', text, re.IGNORECASE)
    if m_unscaled:
        return {
            "value": float(m_unscaled.group(2)),
            "scale": None,
            "raw": m_unscaled.group(1).strip(),
        }
    return None

def parse_education_section(text: str) -> Dict[str, Any]:
    warnings: List[Dict[str, str]] = []
    unmapped: List[Dict[str, str]] = []
    entries: List[Dict[str, Any]] = []

    edu_deg_re = re.compile(
        r'(?:\b(?:b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|b\.?s\.?c?|m\.?s\.?c?|b\.?a\.?|m\.?a\.?|bba|mba|ph\.?d|class\s+(?:x|xii|10|12)|higher\s+secondary|secondary|ssc|hsc|cbse)\b|\b(?:bachelor|master|diploma|associate))',
        re.IGNORECASE,
    )
    inst_re = re.compile(
        r'(?:university|college|institute|school|academy|polytechnic|\biit\b|\bnit\b|\bbits\b)',
        re.IGNORECASE,
    )

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    current: Optional[Dict[str, Any]] = None

    for raw_line in lines:
        cleaned, is_bullet = _strip_bullet(raw_line)
        has_inst = bool(inst_re.search(cleaned))
        has_deg = bool(edu_deg_re.search(cleaned))
        d_range = DATE_RANGE_RE.search(cleaned)
        d_single = SINGLE_DATE_RE.search(cleaned) if not d_range else None
        score_obj = _parse_edu_score(cleaned)

        is_new = False
        if not current:
            is_new = True
        elif has_inst and current.get("institution"):
            is_new = True
        elif has_deg and current.get("degree") and not has_inst:
            is_new = True

        if is_new and not is_bullet:
            if current:
                entries.append(current)
            current = {
                "institution": None,
                "degree": None,
                "field_of_study": None,
                "location": None,
                "start_date": None,
                "end_date": None,
                "is_current": False,
                "is_expected": False,
                "score": None,
                "details": [],
                "confidence": "high",
            }

        if not current:
            unmapped.append({"raw_text": raw_line, "reason": "Unattached line in education section"})
            continue

        if score_obj and not current["score"]:
            current["score"] = score_obj

        if d_range:
            s_obj, _, _, _ = normalize_date_token(d_range.group(1))
            e_obj, is_curr, is_exp, _ = normalize_date_token(d_range.group(2))
            current["start_date"] = s_obj
            current["end_date"] = None if is_curr else e_obj
            current["is_current"] = is_curr
            current["is_expected"] = is_exp
        elif d_single and not current["end_date"]:
            e_obj, is_curr, is_exp, _ = normalize_date_token(d_single.group(1))
            current["end_date"] = None if is_curr else e_obj
            current["is_current"] = is_curr or ("pursuing" in cleaned.lower())
            current["is_expected"] = is_exp

        if "pursuing" in cleaned.lower():
            current["is_current"] = True
            current["is_expected"] = True

        # Clean dates & scores from line to extract institution / degree
        text_only = DATE_RANGE_RE.sub("", cleaned)
        if d_single:
            text_only = SINGLE_DATE_RE.sub("", text_only)
        if score_obj:
            text_only = text_only.replace(score_obj["raw"], "")
            text_only = re.sub(r'\b(?:cgpa|gpa|grade|score)\s*[:\-]?\s*$', '', text_only, flags=re.IGNORECASE)
        text_only = re.sub(r'[|•–-]+$', '', text_only).strip(" ,|–-")

        parts = [p.strip() for p in re.split(r'\s*[|–—]\s*|\s+-\s+', text_only) if p.strip()]
        assigned = False
        for p in parts:
            if inst_re.search(p) and not current["institution"]:
                current["institution"] = p
                assigned = True
            elif edu_deg_re.search(p) and not current["degree"]:
                m_fos = re.match(r'^(.+?)\s+(?:in)\s+(.+)$', p, re.IGNORECASE)
                if m_fos:
                    current["degree"] = m_fos.group(1).strip()
                    current["field_of_study"] = m_fos.group(2).strip()
                else:
                    current["degree"] = p
                assigned = True

        if not assigned and not is_bullet and text_only:
            if not current["institution"] and has_inst:
                current["institution"] = text_only
            elif not current["degree"] and has_deg:
                current["degree"] = text_only
            elif current["institution"] and current["degree"]:
                current["details"].append(cleaned)
        elif is_bullet and not score_obj:
            current["details"].append(cleaned)

    if current:
        entries.append(current)

    return {"education": entries, "unmapped": unmapped, "warnings": warnings}

def parse_skills_section(text: str) -> Dict[str, Any]:
    """
    Strictly scoped to the skills section text ONLY.
    Preserves C++, C#, .NET, Node.js, CI/CD, etc., deduplicates case-insensitively.
    """
    groups: List[Dict[str, Any]] = []
    seen_global = set()

    def _parse_skill_items(raw_items_str: str) -> List[Dict[str, Any]]:
        items: List[Dict[str, Any]] = []
        # Split on comma, semicolon, pipe, or bullet (never slash or dot or + or #)
        for tok in re.split(r'[,;|•▪➢\n]+', raw_items_str):
            t = tok.strip()
            if not t:
                continue
            level = None
            m_lvl = re.match(r'^(.+?)\s*\(([^)]+)\)$', t)
            if m_lvl:
                cand_name = m_lvl.group(1).strip()
                cand_lvl = m_lvl.group(2).strip()
                if cand_lvl.lower() in {"beginner", "intermediate", "advanced", "expert", "proficient", "basic", "native", "fluent"}:
                    t = cand_name
                    level = cand_lvl
            if t.lower() not in seen_global and len(t) <= 60:
                seen_global.add(t.lower())
                items.append({"name": t, "level": level})
        return items

    flat_items: List[Dict[str, Any]] = []
    pending_category: Optional[str] = None
    for line in text.splitlines():
        cleaned, _ = _strip_bullet(line)
        if not cleaned:
            continue
        # Labelled line with items on same line: "Languages: Python, C++"
        m_cat = re.match(r'^([A-Za-z][A-Za-z\s&/+-]{1,35}):\s*(.+)$', cleaned)
        if m_cat:
            pending_category = None
            cat_name = m_cat.group(1).strip()
            items = _parse_skill_items(m_cat.group(2))
            if items:
                groups.append({"category": cat_name, "items": items})
            continue
        # Label-only line (e.g. "Data Analysis & Stats:" followed by items on next line)
        m_label_only = re.match(r'^([A-Za-z][A-Za-z\s&/+-]{1,35}):\s*$', cleaned)
        if m_label_only:
            pending_category = m_label_only.group(1).strip()
            continue

        items = _parse_skill_items(cleaned)
        if pending_category and items:
            # Append to existing pending category group if already created, else create it
            if groups and groups[-1]["category"] == pending_category:
                groups[-1]["items"].extend(items)
            else:
                groups.append({"category": pending_category, "items": items})
        else:
            flat_items.extend(items)

    if flat_items:
        if not groups and len(flat_items) >= 3:
            lang_kw = {"python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "golang", "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "sql", "html", "css", "bash", "shell"}
            cloud_db_kw = {"postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "sqlite", "dynamodb", "cassandra", "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform", "snowflake", "bigquery"}
            tool_kw = {"git", "github", "ci/cd", "jenkins", "jira", "linux", "webpack", "vite", "figma", "postman", "tableau", "power bi", "excel"}
            cat_buckets = {
                "Programming Languages": [],
                "Cloud & Databases": [],
                "Frameworks & Libraries": [],
                "Developer Tools": [],
            }
            for it in flat_items:
                low = it["name"].lower()
                if low in lang_kw:
                    cat_buckets["Programming Languages"].append(it)
                elif low in cloud_db_kw or any(k in low for k in ("aws", "azure", "sql", "postgres", "mongo", "docker", "k8s", "kubernetes")):
                    cat_buckets["Cloud & Databases"].append(it)
                elif low in tool_kw or any(k in low for k in ("git", "ci/cd", "jira", "linux", "figma")):
                    cat_buckets["Developer Tools"].append(it)
                else:
                    cat_buckets["Frameworks & Libraries"].append(it)
            for c_name, c_items in cat_buckets.items():
                if c_items:
                    groups.append({"category": c_name, "items": c_items})
        else:
            groups.append({"category": None, "items": flat_items})

    return {"skills": groups, "unmapped": [], "warnings": []}

def parse_projects_section(text: str) -> Dict[str, Any]:
    projects: List[Dict[str, Any]] = []
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    current: Optional[Dict[str, Any]] = None

    for raw_line in lines:
        cleaned, is_bullet = _strip_bullet(raw_line)
        if not cleaned:
            continue

        # Explicit stack line inside project (including middle-dot separated tech lines)
        m_stack = re.match(r'^(?:tech(?:\s*stack)?|technologies|built\s+with|stack|tools)\s*:\s*(.+)$', cleaned, re.IGNORECASE)
        if m_stack and current:
            for t in re.split(r'[,;|•·]+', m_stack.group(1)):
                ts = t.strip()
                if ts and ts not in current["tech_stack"]:
                    current["tech_stack"].append(ts)
            continue
        if current and ("·" in cleaned or "•" in cleaned) and not cleaned.endswith(".") and len(cleaned) < 100 and not URL_REGEX.search(cleaned):
            for t in re.split(r'[·•,;|]+', cleaned):
                ts = t.strip()
                if ts and ts not in current["tech_stack"]:
                    current["tech_stack"].append(ts)
            continue

        # Extract URLs if present
        urls = URL_REGEX.findall(cleaned)
        link = urls[0].rstrip(".,;)") if urls else None
        if not link:
            m_gh = re.search(r'\b((?:github\.com|gitlab\.com)/[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)?)', cleaned, re.IGNORECASE)
            if m_gh:
                link = "https://" + m_gh.group(1)

        # New project header: first line, "Name | Stack | Link", or short non-sentence non-action-verb title
        has_pipe = "|" in cleaned
        starts_action_verb = bool(re.match(
            r'^(?:designed|built|developed|trained|integrated|implemented|created|deployed|engineered|architected|automated|optimized|evaluated|managed|led|helped|utilized|delivered)',
            cleaned,
            re.IGNORECASE,
        ))
        looks_like_header = (
            not is_bullet
            and len(cleaned) < 80
            and len(cleaned.split()) <= 8
            and bool(cleaned)
            and cleaned[0].isupper()
            and not cleaned.endswith((".", "!", "?", ","))
            and not starts_action_verb
        )
        if not current or has_pipe or looks_like_header:
            if current:
                projects.append(current)

            # Handle "Project Name | React, Node | github.com/x"
            parts = [p.strip() for p in cleaned.split("|") if p.strip()]
            name = parts[0]
            # Strip URL from name if present
            if link:
                name = name.replace(link, "").replace(link.replace("https://", ""), "").strip(" -–|:")
            tech_stack: List[str] = []
            desc: Optional[str] = None

            if len(parts) >= 2:
                for p in parts[1:]:
                    if link and (p in link or link in p or "github.com" in p.lower() or p.startswith("http")):
                        continue
                    # Comma-separated or short pipe-separated tech tokens
                    if ("," in p and len(p) < 100) or (len(p.split()) <= 4 and not p.endswith(".")):
                        tech_stack.extend([t.strip() for t in re.split(r'[,/]+', p) if t.strip()])
                    elif not desc:
                        desc = p

            current = {
                "name": name,
                "role": None,
                "description": desc,
                "tech_stack": tech_stack,
                "link": link,
                "start_date": None,
                "end_date": None,
                "bullets": [],
                "confidence": "high",
            }
        else:
            if link and not current["link"]:
                current["link"] = link
            current["bullets"].append(cleaned)

    if current:
        projects.append(current)

    return {"projects": projects, "unmapped": [], "warnings": []}

def parse_section_deterministic(section_type: str, section_text: str, heading_raw: str = "") -> Dict[str, Any]:
    clean_text, pre_warnings = scan_and_strip_untrusted_lines(section_text)
    if not clean_text.strip():
        return {"warnings": pre_warnings, "unmapped": []}

    if section_type == "header":
        res = parse_header_section(clean_text)
    elif section_type == "summary":
        joined = " ".join(l.strip() for l in clean_text.splitlines() if l.strip())
        res = {"summary": joined or None, "confidence": "high", "unmapped": [], "warnings": []}
    elif section_type == "experience":
        res = parse_experience_section(clean_text)
    elif section_type == "education":
        res = parse_education_section(clean_text)
    elif section_type == "skills":
        res = parse_skills_section(clean_text)
    elif section_type == "projects":
        res = parse_projects_section(clean_text)
    elif section_type == "certifications":
        certs = []
        for l in clean_text.splitlines():
            c, _ = _strip_bullet(l)
            if not c:
                continue
            parts = [p.strip() for p in re.split(r'\s*[|–—]\s*|\s+-\s+', c) if p.strip()]
            certs.append({
                "name": parts[0],
                "issuer": parts[1] if len(parts) > 1 else None,
                "date": None,
                "credential_id": None,
                "url": None,
                "confidence": "high",
            })
        res = {"certifications": certs, "unmapped": [], "warnings": []}
    elif section_type == "languages":
        langs = []
        for tok in re.split(r'[,;\n•]+', clean_text):
            c, _ = _strip_bullet(tok)
            if not c:
                continue
            m = re.match(r'^([A-Za-z\s]+?)\s*\(([^)]+)\)$', c)
            if m:
                langs.append({"name": m.group(1).strip(), "proficiency": m.group(2).strip()})
            else:
                langs.append({"name": c, "proficiency": None})
        res = {"languages": langs, "unmapped": [], "warnings": []}
    elif section_type == "references":
        # Never place references in basics
        res = {"unmapped": [{"raw_text": clean_text[:200], "reason": "References section excluded from candidate basics"}], "warnings": []}
    elif section_type == "awards":
        awards = [{"title": _strip_bullet(l)[0], "issuer": None, "date": None, "description": None} for l in clean_text.splitlines() if l.strip()]
        res = {"awards": awards, "unmapped": [], "warnings": []}
    elif section_type == "publications":
        pubs = [{"title": _strip_bullet(l)[0], "publisher": None, "date": None, "url": None, "description": None} for l in clean_text.splitlines() if l.strip()]
        res = {"publications": pubs, "unmapped": [], "warnings": []}
    elif section_type == "volunteer":
        vols = [{"organization": _strip_bullet(l)[0], "role": None, "duration": None, "description": None} for l in clean_text.splitlines() if l.strip()]
        res = {"volunteer": vols, "unmapped": [], "warnings": []}
    else:
        entries = [{"title": _strip_bullet(l)[0], "subtitle": None, "date_raw": None, "bullets": []} for l in clean_text.splitlines() if l.strip()]
        res = {
            "custom_section": {"heading": heading_raw or "Additional", "entries": entries},
            "unmapped": [],
            "warnings": [],
        }

    res["warnings"] = pre_warnings + (res.get("warnings") or [])
    return res
