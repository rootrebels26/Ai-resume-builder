from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import os
from fastapi import APIRouter, UploadFile, File
from app.core.security import validate_uploaded_file, sanitize_filename
from app.utils.file_utils import temporary_upload_file
from app.services.document_extractor import DocumentExtractor
from app.services.resume_parser import (
    extract_text_from_pdf, extract_text_from_docx, parse_resume_document_pipeline
)
from app.services.resume_optimizer import tailor_resume_to_job
from app.schemas.job_schema import TailorResumeRequest

router = APIRouter()

class SmartCondenseRequest(BaseModel):
    resume_data: Dict[str, Any]
    target_pages: int = Field(default=1, ge=1, le=2)

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    content = await file.read()
    validate_uploaded_file(file, content)
    
    clean_name = sanitize_filename(file.filename)
    suffix = os.path.splitext(clean_name)[1].lower()

    with temporary_upload_file(content, suffix=suffix) as temp_path:
        extraction_res = DocumentExtractor.extract_document(temp_path, filename=clean_name)
        raw_text = extraction_res.get("text", "")
        warnings = extraction_res.get("warnings", [])
        layout = {
            "page_count": extraction_res.get("page_count", 1),
            "is_scanned": extraction_res.get("is_scanned", False),
            "layout": extraction_res.get("layout", "single_column"),
            "pages": extraction_res.get("pages", []),
            "links": extraction_res.get("links", [])
        }

    resume_data, validation = await parse_resume_document_pipeline(raw_text, layout)
    all_warnings = warnings + validation.get("warnings", [])

    return {
        "success": True,
        "data": {
            "filename": clean_name,
            "raw_text": raw_text,
            "raw_text_length": len(raw_text),
            "layout": {
                "page_count": layout.get("page_count", 1),
                "is_scanned": layout.get("is_scanned", False)
            },
            "resume_data": resume_data.model_dump(),
            "validation": validation,
            "unmapped": validation.get("unmapped", []),
            "structured_warnings": validation.get("structuredWarnings", []),
            "confidence_score": validation.get("overallConfidence", 85),
            "warnings": all_warnings
        },
        "message": "Resume extracted and parsed successfully." if not all_warnings else "Resume parsed with notices.",
        "error": None
    }

@router.post("/tailor")
async def tailor_resume(request: TailorResumeRequest):
    result = await tailor_resume_to_job(request)
    return {
        "success": True,
        "data": result.model_dump(),
        "message": "Resume tailored successfully to target job description.",
        "error": None
    }

@router.post("/smart-condense")
async def smart_condense_endpoint(request: SmartCondenseRequest):
    """
    Calibrates resume content for 1-page (concise summarization preserving ALL projects,
    roles, skills, and key metrics) or 2-page (full-detail preservation with zero shrinkage).
    """
    data = dict(request.resume_data)
    target = request.target_pages

    if target == 1:
        # 1. Summarize Professional Summary cleanly (2 complete sentences, no mid-sentence cut)
        summary = str(data.get("professionalSummary") or "").strip()
        if summary:
            sentences = [s.strip() for s in summary.split(".") if s.strip()]
            if len(sentences) > 2:
                data["professionalSummary"] = ". ".join(sentences[:2]) + "."

        # 2. Preserve ALL experience roles; tighten fluff without deleting roles
        experience = data.get("experience", [])
        if isinstance(experience, list):
            condensed_exp = []
            for job in experience:
                job_dict = dict(job)
                responsibilities = job_dict.get("responsibilities", [])
                if isinstance(responsibilities, list):
                    cleaned_b = [b.lstrip("•-*—▸ ").strip() for b in responsibilities if str(b).strip()]
                    job_dict["responsibilities"] = cleaned_b
                    job_dict["description"] = "\n".join(cleaned_b)
                condensed_exp.append(job_dict)
            data["experience"] = condensed_exp

        # 3. Preserve ALL projects; summarize description + highlights into concise complete statements
        projects = data.get("projects", [])
        if isinstance(projects, list):
            condensed_proj = []
            for p in projects:
                p_dict = dict(p)
                desc = str(p_dict.get("description") or "").strip()
                highlights = [str(h).strip() for h in (p_dict.get("highlights") or []) if str(h).strip()]
                merged = []
                if desc:
                    merged.extend([s.strip() + ("." if not s.strip().endswith((".", "!", "?")) else "") for s in desc.split(".") if s.strip()])
                for h in highlights:
                    if not any(h.lower() == m.lower() for m in merged):
                        merged.append(h)
                concise = merged[:2]
                p_dict["highlights"] = concise
                p_dict["description"] = " ".join(concise) if concise else desc
                condensed_proj.append(p_dict)
            data["projects"] = condensed_proj
    else:
        # Target == 2: NEVER decrease/truncate any summary, experience bullet, project, or skill!
        # Optionally enrich sparse project/experience descriptions cleanly while preserving 100% of existing text.
        pass

    # 4. Calibrate Preferences
    prefs = dict(data.get("preferences") or {})
    prefs["fontScale"] = 0.90 if target == 1 else 1.0
    prefs["lineHeight"] = 1.24 if target == 1 else 1.40
    prefs["marginSize"] = "compact" if target == 1 else "normal"
    data["preferences"] = prefs

    return {
        "success": True,
        "data": data,
        "message": (
            "Resume summarized cleanly to 1 page while keeping all projects & key details."
            if target == 1
            else "Resume calibrated for 2 pages with all descriptions preserved in full."
        ),
        "error": None
    }
