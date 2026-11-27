import re
from typing import Any, Dict, List, Set


def _normalize_token_set(text: str) -> Set[str]:
    return set(re.findall(r"[a-z0-9]{3,}", (text or "").lower()))


def reconcile_extraction(
    resume_dict: Dict[str, Any],
    raw_text: str,
    layout_metadata: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """
    Stage 6 Reconciliation Engine:
    Compares extracted source blocks / lines against structured ResumeData to measure:
    - Text extraction coverage
    - Semantic mapping coverage
    - Mapped vs unmapped source blocks
    Never silently discards meaningful unmapped lines.
    """
    meta = layout_metadata or {}
    source_blocks = meta.get("source_blocks") or []

    # Build token set of all mapped structured values
    mapped_parts: List[str] = []
    pinfo = resume_dict.get("personalInfo") or {}
    for k in ("fullName", "email", "phone", "location", "professionalTitle", "linkedin", "github", "portfolio", "website"):
        if pinfo.get(k):
            mapped_parts.append(str(pinfo[k]))
    if resume_dict.get("professionalSummary"):
        mapped_parts.append(str(resume_dict["professionalSummary"]))

    for exp in (resume_dict.get("experience") or []) + (resume_dict.get("internships") or []):
        if isinstance(exp, dict):
            mapped_parts.append(f"{exp.get('company', '')} {exp.get('position', '')} {' '.join(exp.get('responsibilities') or [])}")

    for edu in resume_dict.get("education") or []:
        if isinstance(edu, dict):
            mapped_parts.append(f"{edu.get('institution', '')} {edu.get('degree', '')} {edu.get('fieldOfStudy', '')} {edu.get('cgpa', '')}")

    for proj in resume_dict.get("projects") or []:
        if isinstance(proj, dict):
            mapped_parts.append(f"{proj.get('name', '')} {proj.get('description', '')} {' '.join(proj.get('technologies') or [])} {' '.join(proj.get('highlights') or [])}")

    for sk in resume_dict.get("skills") or []:
        if isinstance(sk, dict):
            mapped_parts.append(" ".join(sk.get("items") or []))

    for cert in resume_dict.get("certifications") or []:
        if isinstance(cert, dict):
            mapped_parts.append(f"{cert.get('name', '')} {cert.get('issuer', '')}")

    for csec in resume_dict.get("customSections") or []:
        if isinstance(csec, dict):
            mapped_parts.append(str(csec.get("sectionTitle") or ""))
            for it in csec.get("items") or []:
                if isinstance(it, dict):
                    mapped_parts.append(f"{it.get('title', '')} {it.get('description', '')}")

    mapped_tokens = _normalize_token_set(" ".join(mapped_parts))

    # Measure block-level mapping coverage
    if not source_blocks and raw_text:
        source_blocks = [
            {"block_id": f"ln_{i + 1}", "page": 1, "text": ln.strip()}
            for i, ln in enumerate(raw_text.splitlines())
            if len(ln.strip()) >= 8 and not re.match(r"^\[\[page\s+\d+\]\]$", ln.strip(), re.I)
        ]

    mapped_count = 0
    excluded_blocks = 0
    unmapped_blocks: List[Dict[str, Any]] = []
    from app.services.section_prompts import INJECTION_PATTERNS, SENSITIVE_PATTERNS

    for blk in source_blocks:
        block_text = str(blk.get("text", ""))
        if any(p.search(block_text) for p in INJECTION_PATTERNS) or any(
            p.match(block_text) for p in SENSITIVE_PATTERNS
        ):
            # Sensitive attributes and prompt-injection lines are never resume content.
            excluded_blocks += 1
            continue
        b_tokens = _normalize_token_set(block_text)
        if not b_tokens:
            continue
        overlap = len(b_tokens & mapped_tokens) / max(1, len(b_tokens))
        if overlap >= 0.35:
            mapped_count += 1
        else:
            unmapped_blocks.append({
                "block_id": blk.get("block_id"),
                "page": blk.get("page", 1),
                "raw_text": block_text[:240],
                "reason": "low_semantic_overlap",
            })

    total_blocks = len(source_blocks) - excluded_blocks
    semantic_coverage = round(mapped_count / max(1, total_blocks), 3) if total_blocks else 0.0
    text_coverage = 1.0 if len((raw_text or "").strip()) >= 50 else round(len((raw_text or "").strip()) / 50.0, 2)

    return {
        "total_pages": meta.get("page_count") or 1,
        "processed_pages": meta.get("page_count") or 1,
        "extracted_blocks": total_blocks,
        "mapped_blocks": mapped_count,
        "unmapped_blocks": len(unmapped_blocks),
        "text_extraction_coverage": text_coverage,
        "semantic_mapping_coverage": semantic_coverage,
        "ocr_confidence": meta.get("ocr_confidence"),
        "unmapped_samples": unmapped_blocks[:10],
    }
