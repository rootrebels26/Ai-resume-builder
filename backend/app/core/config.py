from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    APP_NAME: str = "AI Resume Builder API"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,*"
    
    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 10
    
    # AI Provider configuration: "gemini", "groq", "openrouter", or "local"
    AI_PROVIDER: str = "local"
    AI_MODEL: Optional[str] = None
    
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
