import hmac
import hashlib
import time
import secrets
from typing import Optional
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from app.core.config import settings

router = APIRouter()

class AccessCodeRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=128, description="Company access code")

class VerifyResponse(BaseModel):
    success: bool
    token: str
    message: str

def generate_session_token(code: str) -> str:
    """Generate a signed token encoding timestamp and signature."""
    timestamp = str(int(time.time()))
    payload = f"{code}:{timestamp}"
    signature = hmac.new(
        settings.AUTH_SECRET_KEY.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"{timestamp}.{signature}"

def verify_session_token(token: str) -> bool:
    """Validate token signature and expiration (7 days validity)."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return False
        timestamp_str, signature = parts
        timestamp = int(timestamp_str)
        # Token valid for 7 days
        if time.time() - timestamp > 604800:
            return False
        for valid_code in settings.valid_access_codes:
            for candidate in (valid_code, valid_code.lower()):
                expected_payload = f"{candidate}:{timestamp_str}"
                expected_signature = hmac.new(
                    settings.AUTH_SECRET_KEY.encode(),
                    expected_payload.encode(),
                    hashlib.sha256
                ).hexdigest()
                if secrets.compare_digest(signature, expected_signature):
                    return True
        return False
    except Exception:
        return False

@router.post("/verify-code", response_model=VerifyResponse)
async def verify_code(req: AccessCodeRequest):
    input_code = req.code.strip()
    is_valid = False
    matched_code = None
    for code in settings.valid_access_codes:
        if secrets.compare_digest(input_code, code) or secrets.compare_digest(input_code.lower(), code.lower()):
            is_valid = True
            matched_code = code
            break

    if not is_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid company access code. Please verify the code provided by your organization."
        )

    token = generate_session_token(matched_code)
    return VerifyResponse(
        success=True,
        token=token,
        message="Company access verified successfully."
    )

@router.get("/check-session")
async def check_session(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.replace("Bearer ", "").strip()
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    return {"success": True, "valid": True}
