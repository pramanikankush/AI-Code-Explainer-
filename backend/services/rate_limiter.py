import time
import logging
from typing import Dict, List
from threading import Lock
from fastapi import Request, HTTPException
from core.config import settings

logger = logging.getLogger(__name__)

class SlidingWindowRateLimiter:
    def __init__(self):
        self._requests: Dict[str, List[float]] = {}
        self._lock = Lock()

    def check_rate_limit(self, client_ip: str):
        now = time.time()
        window_start = now - 60.0  # 1 minute window

        with self._lock:
            # Get existing timestamps for this IP
            timestamps = self._requests.get(client_ip, [])

            # Filter out timestamps outside the sliding window
            timestamps = [t for t in timestamps if t > window_start]

            # Check if limit exceeded
            if len(timestamps) >= settings.RATE_LIMIT_PER_MINUTE:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}. Limit: {settings.RATE_LIMIT_PER_MINUTE}/min.")
                # Suggest retry-after header time
                retry_after = int(60 - (now - timestamps[0])) if timestamps else 60
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Try again in {retry_after} seconds."
                )

            # Record this request
            timestamps.append(now)
            self._requests[client_ip] = timestamps
            logger.info(f"Request recorded for IP {client_ip}. Current window count: {len(timestamps)}.")

    def clear(self):
        with self._lock:
            self._requests.clear()
            logger.info("Rate limiter cleared.")

rate_limiter = SlidingWindowRateLimiter()

def rate_limit_dependency(request: Request):
    """
    FastAPI dependency to rate limit requests based on client host IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    rate_limiter.check_rate_limit(client_ip)
