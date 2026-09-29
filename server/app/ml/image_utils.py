"""
Image processing utilities for resizing, canvas expansion, border padding (OpenCV),
and mask generation for inpainting models.
"""

from PIL import Image, ImageFilter
from typing import Tuple
import cv2
import numpy as np
import time

MODEL_INPUT_SIZE: int = 512

def resize_image(image: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Resizes the image to target dimensions using Lanczos filter."""
    return image.resize((target_w, target_h), Image.LANCZOS)

def expand_canvas(
    image: Image.Image,
    target_w: int,
    target_h: int,
) -> Tuple[Image.Image, Image.Image, Tuple[int, int]]:
    """Centers original image on canvas and generates inpainting mask."""
    orig_w, orig_h = image.size

    if orig_w >= target_w and orig_h >= target_h:
        return (
            image.resize((target_w, target_h), Image.LANCZOS),
            Image.new("RGB", (target_w, target_h), (0, 0, 0)),
            (0, 0)
        )

    offset_x = max(0, (target_w - orig_w) // 2)
    offset_y = max(0, (target_h - orig_h) // 2)

    background = image.resize((target_w, target_h), Image.LANCZOS)
    background = background.filter(ImageFilter.GaussianBlur(radius=20))

    canvas = background.copy()
    canvas.paste(image, (offset_x, offset_y))

    mask = Image.new("RGB", (target_w, target_h), (255, 255, 255))
    black_rect = Image.new("RGB", (orig_w, orig_h), (0, 0, 0))
    mask.paste(black_rect, (offset_x, offset_y))

    return canvas, mask, (offset_x, offset_y)

def process_image(
    image: Image.Image,
    target_w: int,
    target_h: int,
) -> dict:
    """Prepares image for outpainting or resizes if shrinking."""
    image = image.convert("RGB")
    orig_w, orig_h = image.size

    if target_w <= orig_w and target_h <= orig_h:
        return {
            "action": "shrink",
            "result": resize_image(image, target_w, target_h),
        }

    canvas, mask, offset = expand_canvas(image, target_w, target_h)
    
    model_input = canvas.resize((MODEL_INPUT_SIZE, MODEL_INPUT_SIZE), Image.LANCZOS)
    model_mask = mask.resize((MODEL_INPUT_SIZE, MODEL_INPUT_SIZE), Image.NEAREST)

    return {
        "action": "expand",
        "model_input": model_input,
        "model_mask": model_mask,
        "target_size": (target_w, target_h),
        "offset": offset,
        "canvas_preview": canvas,
        "mask_preview": mask,
    }

def expand_with_opencv(
    image: Image.Image,
    target_w: int,
    target_h: int,
    border_mode: str
) -> Image.Image:
    """Uses OpenCV copyMakeBorder to extrapolate borders without AI."""
    orig_w, orig_h = image.size

    if orig_w >= target_w and orig_h >= target_h:
        return image.resize((target_w, target_h), Image.LANCZOS)

    img_np = np.array(image.convert("RGB"))
    cv_img = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    pad_w = max(0, target_w - orig_w)
    pad_h = max(0, target_h - orig_h)

    left = pad_w // 2
    right = pad_w - left
    top = pad_h // 2
    bottom = pad_h - top

    border_mode_clean = border_mode.lower().replace("border:", "").strip()

    border_type = cv2.BORDER_CONSTANT
    if border_mode_clean == "replicate":
        border_type = cv2.BORDER_REPLICATE
    elif border_mode_clean == "reflect":
        border_type = cv2.BORDER_REFLECT_101
    elif border_mode_clean == "wrap":
        border_type = cv2.BORDER_WRAP

    bordered_img = cv2.copyMakeBorder(cv_img, top, bottom, left, right, border_type)
    rgb_img = cv2.cvtColor(bordered_img, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb_img)

def resize_nearest(image: np.ndarray, new_w: int, new_h: int) -> np.ndarray:
    """Fast Nearest Neighbor Interpolation via OpenCV."""
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_NEAREST)

def resize_bilinear(image: np.ndarray, new_w: int, new_h: int) -> np.ndarray:
    """Fast Bilinear Interpolation via OpenCV."""
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)


def resize_with_algorithm(
    image: Image.Image,
    target_w: int,
    target_h: int,
    algorithm: str
) -> Tuple[Image.Image, float]:
    """Resizes an image using nearest or bilinear algorithm."""
    img_np = np.array(image.convert("RGB"))
    start = time.perf_counter()

    if "nearest" in algorithm.lower():
        result_np = resize_nearest(img_np, target_w, target_h)
    else:
        result_np = resize_bilinear(img_np, target_w, target_h)

    elapsed = time.perf_counter() - start
    return Image.fromarray(result_np), elapsed
