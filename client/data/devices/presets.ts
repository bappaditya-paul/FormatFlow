import { DisplayProfile } from "./types"

export const RESOLUTION_PRESETS: DisplayProfile[] = [
  { id: "res-1080p", width: 1920, height: 1080, aspectRatio: 1920 / 1080, orientation: "landscape" },
  { id: "res-1440p", width: 2560, height: 1440, aspectRatio: 2560 / 1440, orientation: "landscape" },
  { id: "res-4k", width: 3840, height: 2160, aspectRatio: 3840 / 2160, orientation: "landscape" },
  { id: "res-ultrawide", width: 3440, height: 1440, aspectRatio: 3440 / 1440, orientation: "landscape" },
  { id: "res-super-ultrawide", width: 5120, height: 1440, aspectRatio: 5120 / 1440, orientation: "landscape" },
]
