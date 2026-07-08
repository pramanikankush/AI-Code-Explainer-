import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Code Explainer Enterprise API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # GenAI Settings
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    MODEL_NAME: str = "gemini-2.5-flash"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Rate Limiting & Cache Settings
    RATE_LIMIT_PER_MINUTE: int = 5
    CACHE_TTL_SECONDS: int = 3600
    CACHE_MAX_SIZE: int = 100

    class Config:
        case_sensitive = True
        env_file = "../.env"

settings = Settings()
