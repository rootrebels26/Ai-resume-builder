"""
Cross-cutting HTTP middleware: request tracing, security headers, and a
lightweight in-process rate limiter. All three are dependency-free so the
service can run on any host without extra infrastructure.
"""
import time
import uuid
import logging
from collections import defaultdict, deque
from typing import Set

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("ai_resume_builder.access")

# Paths that should never be rate-limited (infrastructure probes).
_RATE_LIMIT_EXEMPT_SUFFIXES = ("/health", "/health/live", "/health/ready")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Assigns a request id, emits an access log line, and times the request."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        started = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - started) * 1000
            logger.exception(
                "%s %s failed after %.1fms [%s]",
                request.method, request.url.path, duration_ms, request_id,
            )
            raise

        duration_ms = (time.perf_counter() - started) * 1000
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "%s %s -> %s (%.1fms) [%s]",
            request.method, request.url.path, response.status_code, duration_ms, request_id,
        )
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds conservative security response headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault(
            "Permissions-Policy", "geolocation=(), microphone=(), camera=()"
        )
        response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding-window rate limiter keyed by client IP (in-memory)."""

    def __init__(self, app, max_requests: int, window_seconds: int = 60,
                 exempt_paths: Set[str] = frozenset()):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.exempt_paths = exempt_paths
        self._hits = defaultdict(deque)

    @staticmethod
    def _client_ip(request: Request) -> str:
        # Honour the first hop of X-Forwarded-For so limiting works behind a proxy.
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _is_exempt(self, path: str) -> bool:
        if path in self.exempt_paths:
            return True
        return any(path == suffix or path.endswith(suffix) for suffix in _RATE_LIMIT_EXEMPT_SUFFIXES)

    async def dispatch(self, request: Request, call_next):
        if self.max_requests <= 0 or request.method == "OPTIONS" or self._is_exempt(request.url.path):
            return await call_next(request)

        now = time.monotonic()
        client_ip = self._client_ip(request)
        bucket = self._hits[client_ip]

        cutoff = now - self.window_seconds
        while bucket and bucket[0] < cutoff:
            bucket.popleft()

        if len(bucket) >= self.max_requests:
            retry_after = max(1, int(self.window_seconds - (now - bucket[0])) + 1)
            logger.warning("Rate limit exceeded for %s on %s", client_ip, request.url.path)
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(retry_after)},
                content={
                    "success": False,
                    "data": None,
                    "message": "Too many requests. Please slow down and try again shortly.",
                    "error": {"code": "RATE_LIMIT_EXCEEDED", "details": {"retry_after": retry_after}},
                },
            )

        bucket.append(now)

        # Prevent unbounded memory growth from many distinct client IPs.
        if len(self._hits) > 10000:
            self._hits.clear()

        return await call_next(request)
