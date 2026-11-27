import time
from typing import Any, Dict, Optional


class TTLCache:
    """Simple thread-safe-enough in-memory TTL cache for public job feeds & career profiles."""

    def __init__(self, ttl_seconds: int = 600, max_entries: int = 64):
        self.ttl_seconds = ttl_seconds
        self.max_entries = max_entries
        self._store: Dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        item = self._store.get(key)
        if not item:
            return None
        expires_at, value = item
        if time.time() > expires_at:
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        if len(self._store) >= self.max_entries:
            oldest_key = next(iter(self._store))
            self._store.pop(oldest_key, None)
        self._store[key] = (time.time() + self.ttl_seconds, value)


job_feed_cache = TTLCache(ttl_seconds=600, max_entries=32)
career_profile_cache = TTLCache(ttl_seconds=1800, max_entries=64)
