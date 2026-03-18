"""
In-memory TTL cache with real metrics tracking.

Usage:
    from services.cache_service import cache

    cached = cache.get("content:hero")
    if cached is not None:
        return cached
    result = await fetch_from_db()
    cache.set("content:hero", result, ttl_seconds=120)
    return result
"""

import sys
import time
from datetime import UTC, datetime


class CacheService:
    def __init__(self):
        self._cache: dict = {}
        self._hits = 0
        self._misses = 0
        self._sets = 0
        self._evictions = 0
        self._flushes = 0
        self._created_at = time.monotonic()

    def get(self, key: str):
        entry = self._cache.get(key)
        if entry is None:
            self._misses += 1
            return None
        if time.monotonic() > entry["expires_at"]:
            del self._cache[key]
            self._evictions += 1
            self._misses += 1
            return None
        self._hits += 1
        return entry["data"]

    def set(self, key: str, value, ttl_seconds: int = 60):
        self._cache[key] = {
            "data": value,
            "expires_at": time.monotonic() + ttl_seconds,
        }
        self._sets += 1

    def delete(self, key: str):
        if key in self._cache:
            del self._cache[key]

    def invalidate_pattern(self, prefix: str):
        keys_to_delete = [k for k in self._cache if k.startswith(prefix)]
        for k in keys_to_delete:
            del self._cache[k]

    def flush(self):
        self._cache.clear()
        self._flushes += 1

    def get_metrics(self) -> dict:
        total_requests = self._hits + self._misses
        hit_rate = round(self._hits / total_requests, 3) if total_requests > 0 else 0.0

        size_bytes = 0
        for entry in self._cache.values():
            try:
                size_bytes += sys.getsizeof(entry["data"])
            except Exception:
                size_bytes += 256  # fallback estimate

        # Purge expired entries for accurate count
        now = time.monotonic()
        expired = [k for k, v in self._cache.items() if now > v["expires_at"]]
        for k in expired:
            del self._cache[k]
            self._evictions += 1

        return {
            "hit_rate": hit_rate,
            "hits": self._hits,
            "misses": self._misses,
            "sets": self._sets,
            "evictions": self._evictions,
            "flushes": self._flushes,
            "total_entries": len(self._cache),
            "size_estimate_mb": round(size_bytes / (1024 * 1024), 2),
            "uptime_seconds": round(time.monotonic() - self._created_at, 1),
        }


# Global singleton
cache = CacheService()
