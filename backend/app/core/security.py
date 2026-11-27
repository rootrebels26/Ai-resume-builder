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

    # Reject executable/script signatures regardless of extension
    if content.startswith((b"MZ", b"\x7fELF", b"#!")):
        raise FileValidationError("Invalid or unsafe file signature detected.")

    # Magic-byte signature verification (do not trust extensions alone)
    if ext == ".pdf" and not content.lstrip()[:8].startswith(b"%PDF-"):
        raise FileValidationError("File extension is .pdf but the file header is not a valid PDF (%PDF-).")
    if ext == ".docx" and not content[:4].startswith((b"PK\x03\x04", b"PK\x05\x06")):
        raise FileValidationError("File extension is .docx but the file is not a valid Office Open XML archive.")
    if ext == ".png" and not content[:8].startswith(b"\x89PNG\r\n\x1a\n"):
        raise FileValidationError("File extension is .png but the file signature is invalid.")
    if ext in (".jpg", ".jpeg") and not content[:3].startswith(b"\xff\xd8\xff"):
        raise FileValidationError("File extension is JPEG but the file signature is invalid.")
    if ext == ".webp" and not (content[:4] == b"RIFF" and content[8:12] == b"WEBP"):
        raise FileValidationError("File extension is .webp but the file signature is invalid.")
    if ext == ".rtf" and not content.lstrip()[:6].startswith(b"{\\rtf"):
        raise FileValidationError("File extension is .rtf but the file header is not valid RTF.")

    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise FileValidationError(
            f"Unsupported MIME type '{file.content_type}'.",
            details={"content_type": file.content_type}
        )
