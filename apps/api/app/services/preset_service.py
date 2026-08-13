"""
FormatFlow — Preset Definitions

These are the built-in transformation presets.
Adding a new preset does NOT require changing the engine.
"""

from dataclasses import dataclass


@dataclass
class Preset:
    name: str
    label: str
    width: int
    height: int
    fit: str
    format: str
    quality: int


PRESETS: dict[str, Preset] = {
    "phone_wallpaper": Preset(
        name="phone_wallpaper",
        label="Phone Wallpaper",
        width=1080,
        height=1920,
        fit="cover",
        format="webp",
        quality=85,
    ),
    "desktop_wallpaper": Preset(
        name="desktop_wallpaper",
        label="Desktop Wallpaper",
        width=1920,
        height=1080,
        fit="cover",
        format="webp",
        quality=85,
    ),
    "instagram_post": Preset(
        name="instagram_post",
        label="Instagram Post",
        width=1080,
        height=1080,
        fit="cover",
        format="jpeg",
        quality=90,
    ),
    "instagram_story": Preset(
        name="instagram_story",
        label="Instagram Story",
        width=1080,
        height=1920,
        fit="cover",
        format="webp",
        quality=85,
    ),
    "youtube_thumbnail": Preset(
        name="youtube_thumbnail",
        label="YouTube Thumbnail",
        width=1280,
        height=720,
        fit="cover",
        format="jpeg",
        quality=90,
    ),
    "twitter_post": Preset(
        name="twitter_post",
        label="Twitter / X Post",
        width=1200,
        height=675,
        fit="cover",
        format="webp",
        quality=85,
    ),
    "og_image": Preset(
        name="og_image",
        label="Open Graph Image",
        width=1200,
        height=630,
        fit="cover",
        format="jpeg",
        quality=85,
    ),
}


def get_preset(name: str) -> Preset | None:
    return PRESETS.get(name)


def list_presets() -> list[Preset]:
    return list(PRESETS.values())
