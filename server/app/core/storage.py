import os
import uuid
from app.core.config import settings

import time

def ensure_upload_dirs():
    os.makedirs(settings.UPLOAD_DIR_RAW, exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR_PROCESSED, exist_ok=True)
    cleanup_old_files(max_age_hours=1)

def cleanup_old_files(max_age_hours: int = 1):
    """Automatically deletes raw and processed upload files older than max_age_hours to prevent server disk bloat."""
    now = time.time()
    cutoff = now - (max_age_hours * 3600)
    for directory in [settings.UPLOAD_DIR_RAW, settings.UPLOAD_DIR_PROCESSED]:
        if not os.path.exists(directory):
            continue
        for filename in os.listdir(directory):
            filepath = os.path.join(directory, filename)
            if os.path.isfile(filepath):
                try:
                    if os.path.getmtime(filepath) < cutoff:
                        os.remove(filepath)
                except Exception:
                    pass

def save_raw_file(file_bytes: bytes, original_filename: str) -> tuple[str, str]:
    ensure_upload_dirs()
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}_{original_filename}"
    filepath = os.path.join(settings.UPLOAD_DIR_RAW, safe_filename)
    with open(filepath, "wb") as f:
        f.write(file_bytes)
    return file_id, filepath

def save_processed_file(file_bytes: bytes, file_id: str, extension: str = "png", suffix: str = "") -> tuple[str, str]:
    ensure_upload_dirs()
    ext_clean = extension.lower().strip()
    if ext_clean in ["jpeg", "jpg"]:
        file_ext = "jpg"
    elif ext_clean == "webp":
        file_ext = "webp"
    else:
        file_ext = "png"

    suffix_str = f"_{suffix}" if suffix else ""
    output_filename = f"out_{file_id}{suffix_str}.{file_ext}"
    filepath = os.path.join(settings.UPLOAD_DIR_PROCESSED, output_filename)
    with open(filepath, "wb") as f:
        f.write(file_bytes)
    public_url = f"{settings.BASE_URL}/uploads/processed/{output_filename}"
    return filepath, public_url

