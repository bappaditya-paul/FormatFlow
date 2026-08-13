"""
FormatFlow — Application Configuration
Loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "FormatFlow"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://formatflow:formatflow@localhost:5432/formatflow"

    # Object Storage (Cloudflare R2)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "formatflow"
    R2_PUBLIC_URL: str = ""

    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 50

    # Security
    SECRET_KEY: str = "change-me-in-production"


settings = Settings()
