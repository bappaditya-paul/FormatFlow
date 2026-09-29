import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FormatFlow API"
    ML_SERVICE_URL: str = os.getenv("ML_SERVICE_URL", "http://localhost:8002")
    UPLOAD_DIR_RAW: str = os.getenv("UPLOAD_DIR_RAW", "uploads/raw")
    UPLOAD_DIR_PROCESSED: str = os.getenv("UPLOAD_DIR_PROCESSED", "uploads/processed")
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8001")

settings = Settings()
