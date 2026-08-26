import { Device, DisplayProfile } from "./types"

export const DESKTOP_DISPLAY_PROFILES: Record<string, DisplayProfile> = {
  "macbook-pro-14": { id: "macbook-pro-14", width: 3024, height: 1964, aspectRatio: 3024 / 1964, orientation: "landscape" },
  "macbook-pro-16": { id: "macbook-pro-16", width: 3456, height: 2234, aspectRatio: 3456 / 2234, orientation: "landscape" },
  "studio-display": { id: "studio-display", width: 5120, height: 2880, aspectRatio: 5120 / 2880, orientation: "landscape" },
  "dell-xps-15": { id: "dell-xps-15", width: 3456, height: 2160, aspectRatio: 3456 / 2160, orientation: "landscape" },
}

export const DESKTOP_DEVICES: Device[] = [
  { id: "d-ap-mbp14", category: "desktop", brand: "Apple", model: "MacBook Pro 14\"", displayProfileId: "macbook-pro-14", aliases: ["mac 14", "mbp 14"] },
  { id: "d-ap-mbp16", category: "desktop", brand: "Apple", model: "MacBook Pro 16\"", displayProfileId: "macbook-pro-16", aliases: ["mac 16", "mbp 16"] },
  { id: "d-ap-sd", category: "desktop", brand: "Apple", model: "Studio Display", displayProfileId: "studio-display", aliases: ["apple monitor", "studio"] },
  { id: "d-de-xps15", category: "desktop", brand: "Dell", model: "XPS 15", displayProfileId: "dell-xps-15", aliases: ["dell xps"] },
]
