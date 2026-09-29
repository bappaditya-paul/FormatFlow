import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.storage import ensure_upload_dirs
from app.api.v1.router import api_router

# Ensure storage folders exist
ensure_upload_dirs()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory for static file access
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Mount API v1 router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Welcome to FormatFlow API Service",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
