import os
import re
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import FileValidationError

ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".txt", ".rtf",
    ".png", ".jpg", ".jpeg", ".webp"
}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/octet-stream",
    "text/plain",
    "text/rtf",
    "application/rtf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp"
}

def sanitize_filename(filename: str) -> str:
    base = os.path.basename(filename)
    # Remove any characters other than alphanumeric, dots, underscores, dashes
    clean = re.sub(r'[^a-zA-Z0-9._-]', '_', base)
    return clean[:100]

def validate_uploaded_file(file: UploadFile, content: bytes) -> None:
    if not file.filename:
        raise FileValidationError("Uploaded file has no filename.")
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise FileValidationError(
            f"Unsupported file format '{ext}'. Allowed formats: PDF, DOCX, DOC, TXT, RTF, PNG, JPG, JPEG, and WebP.",
            details={"allowed_extensions": list(ALLOWED_EXTENSIONS)}
        )
    
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise FileValidationError(
            f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB.",
            details={"max_size_mb": settings.MAX_UPLOAD_SIZE_MB, "file_size_bytes": len(content)}
        )
    
    if len(content) == 0:
        raise FileValidationError("Uploaded file is empty.")
