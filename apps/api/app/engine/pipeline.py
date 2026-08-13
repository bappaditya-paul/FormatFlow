"""
FormatFlow — Transformation Engine Pipeline (stub)

This module is intentionally isolated from HTTP, auth, and database.
It operates purely on bytes/files + a TransformConfig.

Implement in Module 4 — Transformation Engine.
"""

from dataclasses import dataclass
from enum import Enum


class FitMode(str, Enum):
    COVER = "cover"
    CONTAIN = "contain"
    CROP = "crop"
    FIT = "fit"


class OutputFormat(str, Enum):
    JPEG = "jpeg"
    PNG = "png"
    WEBP = "webp"
    AVIF = "avif"


@dataclass
class TransformConfig:
    target_width: int
    target_height: int
    fit_mode: FitMode = FitMode.COVER
    output_format: OutputFormat = OutputFormat.WEBP
    quality: int = 85


@dataclass
class TransformResult:
    data: bytes
    width: int
    height: int
    format: str
    size_bytes: int


class TransformationPipeline:
    """
    Transformation pipeline — pure image processing, no I/O side effects.

    INPUT:  raw image bytes + TransformConfig
    OUTPUT: TransformResult (processed bytes + metadata)

    Steps (to be implemented with pyvips):
      1. Validate
      2. Read metadata
      3. Auto-orient
      4. Calculate target dimensions
      5. Resize
      6. Crop / Fit / Cover / Contain
      7. Format conversion
      8. Compression
      9. Return output
    """

    def process(self, image_bytes: bytes, config: TransformConfig) -> TransformResult:
        raise NotImplementedError(
            "TransformationPipeline.process() — implement in Module 4 with pyvips"
        )
