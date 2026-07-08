import hashlib
import time
import logging
from typing import Dict, Optional, Tuple
from threading import Lock
from core.config import settings
from models.schemas import CodeAnalysisResponse

logger = logging.getLogger(__name__)

class CacheEntry:
    def __init__(self, response: CodeAnalysisResponse, ttl: int):
        self.response = response
        self.expiry = time.time() + ttl
        self.last_accessed = time.time()

    def is_expired(self) -> bool:
        return time.time() > self.expiry

class CodeAnalysisCache:
    def __init__(self):
        self._cache: Dict[str, CacheEntry] = {}
        self._lock = Lock()

    def _generate_key(self, code: str, language: str, mode: str) -> str:
        # Create a unique SHA256 key based on code, language, and mode
        hasher = hashlib.sha256()
        hasher.update(language.encode('utf-8'))
        hasher.update(mode.encode('utf-8'))
        hasher.update(code.encode('utf-8'))
        return hasher.hexdigest()

    def get(self, code: str, language: str, mode: str) -> Optional[CodeAnalysisResponse]:
        key = self._generate_key(code, language, mode)
        with self._lock:
            entry = self._cache.get(key)
            if not entry:
                return None
            
            if entry.is_expired():
                logger.info("Cache entry expired. Removing.")
                del self._cache[key]
                return None

            # Update access time for LRU eviction
            entry.last_accessed = time.time()
            return entry.response

    def set(self, code: str, language: str, mode: str, response: CodeAnalysisResponse):
        key = self._generate_key(code, language, mode)
        with self._lock:
            # Clean expired items first to free space
            self._cleanup_expired()

            # Evict LRU if cache is full
            if len(self._cache) >= settings.CACHE_MAX_SIZE:
                self._evict_lru()

            self._cache[key] = CacheEntry(response, settings.CACHE_TTL_SECONDS)
            logger.info(f"Cached response. Total items in cache: {len(self._cache)}")

    def _cleanup_expired(self):
        now = time.time()
        expired_keys = [k for k, v in self._cache.items() if now > v.expiry]
        for k in expired_keys:
            del self._cache[k]
        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired cache entries.")

    def _evict_lru(self):
        if not self._cache:
            return
        # Find key with the oldest last_accessed time
        lru_key = min(self._cache.keys(), key=lambda k: self._cache[k].last_accessed)
        logger.info(f"Cache full. Evicting LRU entry: {lru_key}")
        del self._cache[lru_key]

    def clear(self):
        with self._lock:
            self._cache.clear()
            logger.info("Cache cleared.")

analysis_cache = CodeAnalysisCache()
