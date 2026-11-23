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
