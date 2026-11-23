from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "AI Resume Builder API"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # CORS — comma-separated list of allowed origins.
    # Never ship "*" to production when credentials or auth are involved.
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175,http://localhost:5176,http://127.0.0.1:5176,http://localhost:5177,http://127.0.0.1:5177,http://localhost:5178,http://127.0.0.1:5178,http://localhost:3000"
    CORS_ALLOW_CREDENTIALS: bool = False

    # Company Access Code authentication
    COMPANY_ACCESS_CODE: str = "nityacloudwithatanu&sagnik"
    AUTH_SECRET_KEY: str = "resume-studio-access-secret-key-prod-2026"

    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 10

    # Observability & protection
    LOG_LEVEL: str = "INFO"
    RATE_LIMIT_PER_MINUTE: int = 60  # set to 0 to disable
    GZIP_MINIMUM_SIZE: int = 1024

    # AI Provider configuration: "gemini", "groq", "openrouter", or "local"
    AI_PROVIDER: str = "local"
    AI_MODEL: Optional[str] = None

    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None

    @property
    def valid_access_codes(self) -> List[str]:
        if not self.COMPANY_ACCESS_CODE:
            return ["nityacloudwithatanu&sagnik"]
        return [c.strip() for c in self.COMPANY_ACCESS_CODE.split(",") if c.strip()]

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return []
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() in ("production", "prod")

    @property
    def allow_wildcard_origin(self) -> bool:
        return "*" in self.cors_origins

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
