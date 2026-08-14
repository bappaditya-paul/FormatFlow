"""
FormatFlow — Live Server API Verification Script
Hits the running FastAPI server at http://localhost:8001 and tests every single endpoint.
"""

import io
import httpx
from PIL import Image as PILImage

BASE_URL = "http://localhost:8001/v1"

def generate_test_image() -> bytes:
    img = PILImage.new("RGB", (300, 300), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def run_tests():
    print("=== STARTING LIVE API INTEGRATION TEST ===\n")
    
    with httpx.Client() as client:
        # 1. GET /v1/presets
        print("[1/7] GET /v1/presets")
        r = client.get(f"{BASE_URL}/presets")
        assert r.status_code == 200, f"Failed presets: {r.text}"
        presets = r.json()
        print(f" -> SUCCESS: Retrieved {len(presets)} presets.")
        print(f" -> Sample Preset: {presets[0]}\n")

        # 2. POST /v1/images/upload
        print("[2/7] POST /v1/images/upload")
        image_bytes = generate_test_image()
        files = {"file": ("live_test.png", image_bytes, "image/png")}
        r = client.post(f"{BASE_URL}/images/upload", files=files)
        assert r.status_code == 201, f"Failed upload: {r.text}"
        upload_data = r.json()
        image_id = upload_data["image"]["id"]
        print(f" -> SUCCESS: Uploaded image. Generated ID: {image_id}")
        print(f" -> Dimension: {upload_data['image']['width']}x{upload_data['image']['height']}\n")

        # 3. GET /v1/images/{image_id}
        print(f"[3/7] GET /v1/images/{image_id}")
        r = client.get(f"{BASE_URL}/images/{image_id}")
        assert r.status_code == 200, f"Failed metadata lookup: {r.text}"
        meta = r.json()
        print(f" -> SUCCESS: Retrieved image metadata.")
        print(f" -> Filename: {meta['original_filename']}\n")

        # 4. GET /v1/images/{image_id}/download
        print(f"[4/7] GET /v1/images/{image_id}/download")
        r = client.get(f"{BASE_URL}/images/{image_id}/download")
        assert r.status_code == 200, f"Failed download: {r.text}"
        print(f" -> SUCCESS: Downloaded image file. Bytes length: {len(r.content)}\n")

        # 5. POST /v1/images/transform
        print("[5/7] POST /v1/images/transform")
        transform_payload = {
            "source_image_id": image_id,
            "preset_name": "desktop_wallpaper",
            "target_width": 1920,
            "target_height": 1080,
            "fit_mode": "contain",
            "output_format": "jpeg",
            "quality": 90
        }
        r = client.post(f"{BASE_URL}/images/transform", json=transform_payload)
        assert r.status_code == 200, f"Failed transform: {r.text}"
        transform_data = r.json()
        transformation_id = transform_data["transformation_id"]
        print(f" -> SUCCESS: Image transformed.")
        print(f" -> Transformed ID: {transformation_id}")
        print(f" -> Output Dimensions: {transform_data['width']}x{transform_data['height']}")
        print(f" -> Public URL: {transform_data['public_url']}\n")

        # 6. POST /v1/images/{image_id}/share
        # (testing lookup fallback with transformation_id directly in the path)
        print(f"[6/7] POST /v1/images/{transformation_id}/share")
        r = client.post(f"{BASE_URL}/images/{transformation_id}/share")
        assert r.status_code == 200, f"Failed share: {r.text}"
        share_data = r.json()
        share_token = share_data["token"]
        print(f" -> SUCCESS: Generated share token.")
        print(f" -> Share Link URL: {share_data['share_url']}\n")

        # 7. GET /v1/share/{share_id}
        print(f"[7/7] GET /v1/share/{share_token}")
        r = client.get(f"{BASE_URL}/share/{share_token}")
        assert r.status_code == 200, f"Failed share resolution: {r.text}"
        share_res = r.json()
        print(f" -> SUCCESS: Resolved shared metadata.")
        print(f" -> Public URL of Shared Target: {share_res['public_url']}\n")

    print("=== ALL LIVE INTEGRATION TESTS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
