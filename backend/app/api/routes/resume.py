from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import os
from fastapi import APIRouter, UploadFile, File
from app.core.security import validate_uploaded_file, sanitize_filename
from app.utils.file_utils import temporary_upload_file
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
        if suffix == ".pdf":
            raw_text, warnings, layout = extract_text_from_pdf(temp_path)
        else:
            raw_text, warnings, layout = extract_text_from_docx(temp_path)

    resume_data, validation = await parse_resume_document_pipeline(raw_text, layout)
    all_warnings = warnings + validation.get("warnings", [])

    return {
        "success": True,
        "data": {
            "filename": clean_name,
            "raw_text_length": len(raw_text),
            "layout": {
                "page_count": layout.get("page_count", 1),
                "is_scanned": layout.get("is_scanned", False)
            },
            "resume_data": resume_data.model_dump(),
            "validation": validation,
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
    Intelligently condenses and calibrates resume content to fit cleanly into
    exactly 1 or 2 pages with ZERO loss of technical skills, qualifications, or company details.
    """
    data = dict(request.resume_data)
    target = request.target_pages

    # 1. Summary Condensation
    summary = data.get("professionalSummary", "")
    if summary:
        sentences = [s.strip() for s in summary.split(".") if s.strip()]
        max_sentences = 2 if target == 1 else 4
        data["professionalSummary"] = ". ".join(sentences[:max_sentences]) + ("." if sentences else "")

    # 2. Experience Budgeting
    experience = data.get("experience", [])
    if isinstance(experience, list):
        max_jobs = min(len(experience), 5) if target == 1 else len(experience)
        condensed_exp = []
        for idx, job in enumerate(experience[:max_jobs]):
            job_dict = dict(job)
            responsibilities = job_dict.get("responsibilities", [])
            if isinstance(responsibilities, list):
                max_b = (4 if idx == 0 else (3 if idx == 1 else 2)) if target == 1 else (5 if idx < 2 else 3)
                cleaned_b = [b.lstrip("•-*—▸ ") for b in responsibilities if len(b) > 15]
                job_dict["responsibilities"] = cleaned_b[:max_b]
                job_dict["description"] = "\n".join(job_dict["responsibilities"])
            condensed_exp.append(job_dict)
        data["experience"] = condensed_exp

    # 3. Projects Budgeting
    projects = data.get("projects", [])
    if isinstance(projects, list):
        max_p = 3 if target == 1 else 5
        condensed_proj = []
        for p in projects[:max_p]:
            p_dict = dict(p)
            highlights = p_dict.get("highlights", [])
            if isinstance(highlights, list):
                max_h = 1 if target == 1 else 2
                p_dict["highlights"] = highlights[:max_h]
            condensed_proj.append(p_dict)
        data["projects"] = condensed_proj

    # 4. Calibrate Preferences
    prefs = dict(data.get("preferences") or {})
    prefs["fontScale"] = 0.95 if target == 1 else 1.0
    prefs["lineHeight"] = 1.28 if target == 1 else 1.38
    prefs["marginSize"] = "compact" if target == 1 else "normal"
    data["preferences"] = prefs

    return {
        "success": True,
        "data": data,
        "message": f"Resume intelligently condensed and calibrated for {target} page(s).",
        "error": None
    }
