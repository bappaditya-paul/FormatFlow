import { Device, DisplayProfile } from "./types"
import { MOBILE_DEVICES, MOBILE_DISPLAY_PROFILES } from "./mobile"
import { DESKTOP_DEVICES, DESKTOP_DISPLAY_PROFILES } from "./desktop"
import { RESOLUTION_PRESETS } from "./presets"

const ALL_DEVICES = [...MOBILE_DEVICES, ...DESKTOP_DEVICES]
const ALL_PROFILES = { ...MOBILE_DISPLAY_PROFILES, ...DESKTOP_DISPLAY_PROFILES }

export const DeviceCatalog = {
  getDevice(id: string): Device | undefined {
    return ALL_DEVICES.find(d => d.id === id)
  },

  getDisplayProfile(id: string): DisplayProfile | undefined {
    // Check devices first
    if (ALL_PROFILES[id]) return ALL_PROFILES[id]
    // Check presets
    return RESOLUTION_PRESETS.find(p => p.id === id)
  },

  searchDevices(query: string, category: "mobile" | "desktop"): Device[] {
    const devices = category === "mobile" ? MOBILE_DEVICES : DESKTOP_DEVICES
    if (!query) return devices

    const lowerQuery = query.toLowerCase()
    return devices.filter(d => 
      d.brand.toLowerCase().includes(lowerQuery) ||
      d.model.toLowerCase().includes(lowerQuery) ||
      (d.series && d.series.toLowerCase().includes(lowerQuery)) ||
      (d.aliases && d.aliases.some(a => a.toLowerCase().includes(lowerQuery)))
    )
  },

  getPopularPresets(): DisplayProfile[] {
    return RESOLUTION_PRESETS
  },

  getBrands(category: "mobile" | "desktop"): string[] {
    const devices = category === "mobile" ? MOBILE_DEVICES : DESKTOP_DEVICES
    const brands = new Set(devices.map(d => d.brand))
    return Array.from(brands).sort()
  }
}

export * from "./types"
