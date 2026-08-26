import { Device, DisplayProfile } from "./types"

export const MOBILE_DISPLAY_PROFILES: Record<string, DisplayProfile> = {
  "iphone-17-pro": { id: "iphone-17-pro", width: 1179, height: 2556, aspectRatio: 1179 / 2556, orientation: "portrait" },
  "iphone-17-pro-max": { id: "iphone-17-pro-max", width: 1290, height: 2796, aspectRatio: 1290 / 2796, orientation: "portrait" },
  "iphone-13-14": { id: "iphone-13-14", width: 1170, height: 2532, aspectRatio: 1170 / 2532, orientation: "portrait" },
  "galaxy-s24-ultra": { id: "galaxy-s24-ultra", width: 1440, height: 3120, aspectRatio: 1440 / 3120, orientation: "portrait" },
  "pixel-8-pro": { id: "pixel-8-pro", width: 1344, height: 2992, aspectRatio: 1344 / 2992, orientation: "portrait" },
}

export const MOBILE_DEVICES: Device[] = [
  { id: "m-ap-17p", category: "mobile", brand: "Apple", series: "iPhone 17", model: "iPhone 17 Pro", displayProfileId: "iphone-17-pro", aliases: ["apple 17 pro", "17 pro"] },
  { id: "m-ap-17pm", category: "mobile", brand: "Apple", series: "iPhone 17", model: "iPhone 17 Pro Max", displayProfileId: "iphone-17-pro-max", aliases: ["apple 17 pro max", "17 pro max"] },
  { id: "m-ap-14", category: "mobile", brand: "Apple", series: "iPhone 14", model: "iPhone 14", displayProfileId: "iphone-13-14", aliases: ["apple 14", "14"] },
  { id: "m-sa-s24u", category: "mobile", brand: "Samsung", series: "Galaxy S24", model: "Galaxy S24 Ultra", displayProfileId: "galaxy-s24-ultra", aliases: ["s24 ultra", "samsung 24 ultra"] },
  { id: "m-go-p8p", category: "mobile", brand: "Google", series: "Pixel 8", model: "Pixel 8 Pro", displayProfileId: "pixel-8-pro", aliases: ["pixel 8 pro", "google 8 pro"] },
]
