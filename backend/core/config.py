import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Code Explainer Enterprise API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # GenAI Settings
    GOOGLE_API_KEY: str = ""
    MODEL_NAME: str = "gemini-2.5-flash"
    
    # CORS Settings — allow all origins so deployed frontend can reach backend
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    # Rate Limiting & Cache Settings
    RATE_LIMIT_PER_MINUTE: int = 5
    CACHE_TTL_SECONDS: int = 3600
    CACHE_MAX_SIZE: int = 100

    class Config:
        case_sensitive = True
        # Read from .env if present locally; on Render, env vars are injected directly
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
