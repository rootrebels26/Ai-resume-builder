import html
import ipaddress
import re
from urllib.parse import urlparse


_HTML_TAG_RE = re.compile(r"<[^>]+>")
_SCRIPT_STYLE_RE = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.IGNORECASE | re.DOTALL)
_WS_RE = re.compile(r"\s{2,}")


def validate_external_url(url: str) -> str:
    """
    Validate external job/application URLs:
    - Allow only http/https schemes
    - Block localhost, loopback, and private/link-local IP addresses (SSRF / open-redirect guard)
    Returns sanitized URL string or empty string if invalid.
    """
    if not url or not isinstance(url, str):
        return ""
    cleaned = url.strip()
    if not cleaned:
        return ""
    try:
        parsed = urlparse(cleaned)
    except Exception:
        return ""

    if parsed.scheme not in ("https", "http"):
        return ""
    host = (parsed.hostname or "").lower().strip()
    if not host or host in ("localhost", "0.0.0.0"):
        return ""
    try:
        ip_obj = ipaddress.ip_address(host)
        if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_reserved:
            return ""
    except ValueError:
        # Hostname is a domain name, not an IP literal
        if "." not in host:
            return ""
    return cleaned


def strip_html_safely(raw_html: str, max_len: int = 4000) -> str:
    """
    Convert untrusted HTML job descriptions into clean plain text without
    preserving executable tags or scripts.
    """
    if not raw_html or not isinstance(raw_html, str):
        return ""
    text = _SCRIPT_STYLE_RE.sub(" ", raw_html)
    text = re.sub(r"</?(?:p|div|br|li|h[1-6]|tr)\b[^>]*>", "\n", text, flags=re.IGNORECASE)
    text = _HTML_TAG_RE.sub(" ", text)
    text = html.unescape(text)
    text = text.replace("\xad", "")
    lines = [_WS_RE.sub(" ", ln).strip() for ln in text.splitlines()]
    cleaned = "\n".join(ln for ln in lines if ln)
    return cleaned[:max_len].strip()
