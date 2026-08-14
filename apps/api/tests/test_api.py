"""
FormatFlow — End-to-End API Integration Tests
Tests all endpoints: Upload, Transform, Download, Share, and Presets.
"""

import io
import uuid
import pytest
from PIL import Image as PILImage

def generate_mock_image() -> bytes:
    """Generate a simple 100x100 PNG image in bytes."""
    img = PILImage.new("RGB", (100, 100), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def test_get_presets(client):
    """Test retrieving presets list."""
    response = client.get("/v1/presets")
    assert response.status_code == 200
    presets = response.json()
    assert isinstance(presets, list)
    assert len(presets) > 0
    # Verify structure of first preset
    preset = presets[0]
    assert "name" in preset
    assert "width" in preset
    assert "height" in preset
    assert "fit" in preset
    assert "format" in preset

def test_full_image_workflow(client):
    """Test the complete upload -> transform -> share -> download workflow."""
    
    # 1. Upload
    image_bytes = generate_mock_image()
    response = client.post(
        "/v1/images/upload",
        files={"file": ("test_image.png", image_bytes, "image/png")}
    )
    assert response.status_code == 201
    upload_data = response.json()
    assert "image" in upload_data
    image_id = upload_data["image"]["id"]
    assert image_id is not None
    assert upload_data["image"]["width"] == 100
    assert upload_data["image"]["height"] == 100

    # 2. Get Metadata
    metadata_response = client.get(f"/v1/images/{image_id}")
    assert metadata_response.status_code == 200
    metadata = metadata_response.json()
    assert metadata["original_filename"] == "test_image.png"

    # 3. Download original image
    download_response = client.get(f"/v1/images/{image_id}/download")
    assert download_response.status_code == 200
    assert len(download_response.content) == len(image_bytes)
    assert download_response.headers["Content-Disposition"] == 'attachment; filename="test_image.png"'

    # 4. Transform Image
    transform_payload = {
        "source_image_id": image_id,
        "preset_name": "phone_wallpaper",
        "target_width": 1080,
        "target_height": 1920,
        "fit_mode": "cover",
        "output_format": "webp",
        "quality": 80
    }
    transform_response = client.post("/v1/images/transform", json=transform_payload)
    assert transform_response.status_code == 200
    transform_data = transform_response.json()
    transformation_id = transform_data["transformation_id"]
    assert transformation_id is not None
    assert transform_data["width"] == 1080
    assert transform_data["height"] == 1920
    assert transform_data["format"] == "webp"
    assert "http://localhost:8001/static/" in transform_data["public_url"]

    # 5. Share Transformation
    share_payload = {
        "transformation_id": transformation_id
    }
    share_response = client.post(f"/v1/images/{image_id}/share", json=share_payload)
    assert share_response.status_code == 200
    share_data = share_response.json()
    assert "token" in share_data
    assert "share_url" in share_data
    share_token = share_data["token"]

    # 6. Retrieve Share details
    retrieve_share_response = client.get(f"/v1/share/{share_token}")
    assert retrieve_share_response.status_code == 200
    retrieved_data = retrieve_share_response.json()
    assert retrieved_data["transformation_id"] == transformation_id
    assert retrieved_data["width"] == 1080
    assert retrieved_data["height"] == 1920
    assert retrieved_data["format"] == "webp"
