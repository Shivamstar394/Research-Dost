import json
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Any
from config import get_settings

settings = get_settings()

class SimpleCache:
    """In-memory cache with TTL support"""
    
    def __init__(self):
        self._cache = {}
    
    def _generate_key(self, query: str, source: str) -> str:
        """Generate cache key from query and source"""
        combined = f"{query}:{source}"
        return hashlib.md5(combined.encode()).hexdigest()
    
    def get(self, query: str, source: str) -> Optional[Any]:
        """Retrieve cached result if valid"""
        if not settings.ENABLE_CACHE:
            return None
        
        key = self._generate_key(query, source)
        if key in self._cache:
            entry = self._cache[key]
            if datetime.now() < entry["expires"]:
                return entry["data"]
            else:
                del self._cache[key]
        return None
    
    def set(self, query: str, source: str, data: Any) -> None:
        """Cache result with TTL"""
        if not settings.ENABLE_CACHE:
            return
        
        key = self._generate_key(query, source)
        self._cache[key] = {
            "data": data,
            "expires": datetime.now() + timedelta(seconds=settings.CACHE_TTL)
        }
    
    def clear(self) -> None:
        """Clear entire cache"""
        self._cache.clear()

cache = SimpleCache()