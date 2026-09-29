import React, { useState, useMemo } from "react"
import { DeviceCatalog, Device, DisplayProfile } from "@/data/devices/index"

interface Props {
  platform: "mobile" | "desktop"
  selectedDevice: Device | null
  selectedProfile: DisplayProfile | null
  onSelectDevice: (device: Device, profile: DisplayProfile) => void
  onSelectCustom: (profile: DisplayProfile) => void
}

export function DeviceSelector({ platform, selectedDevice, selectedProfile, onSelectDevice, onSelectCustom }: Props) {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<"device" | "resolution" | "custom">("device")

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      {/* Mode Sub-Tabs (Parity for both Mobile & Desktop) */}
      <div className="flex gap-4 border-b border-border">
        {(["device", "resolution", "custom"] as const).map(tabMode => (
          <button
            key={tabMode}
            onClick={() => setMode(tabMode)}
            className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${
              mode === tabMode 
                ? "border-accent text-primary-text" 
                : "border-transparent text-secondary-text hover:text-primary-text"
            }`}
          >
            {tabMode}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {mode === "device" && (
          <div className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder={`Search ${platform} devices...`} 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface border border-border px-4 py-2.5 text-sm text-primary-text placeholder-secondary-text focus:outline-none focus:border-accent transition-colors rounded-lg"
            />
            <DeviceList 
              platform={platform}
              query={query}
              selectedDevice={selectedDevice} 
              onSelectDevice={onSelectDevice} 
            />
          </div>
        )}
        
        {mode === "resolution" && (
          <ResolutionList 
            platform={platform}
            selectedProfile={selectedProfile} 
            onSelectCustom={onSelectCustom} 
          />
        )}

        {mode === "custom" && (
          <CustomResolutionForm 
            platform={platform}
            selectedProfile={selectedProfile}
            onSelectCustom={onSelectCustom}
          />
        )}
      </div>
    </div>
  )
}

interface DeviceListProps {
  platform: "mobile" | "desktop"
  query: string
  selectedDevice: Device | null
  onSelectDevice: (device: Device, profile: DisplayProfile) => void
}

function DeviceList({ platform, query, selectedDevice, onSelectDevice }: DeviceListProps) {
  const devices = useMemo(() => DeviceCatalog.searchDevices(query, platform), [query, platform])

  return (
    <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
      {devices.map(device => (
        <button
          key={device.id}
          onClick={() => {
            const profile = DeviceCatalog.getDisplayProfile(device.displayProfileId)
            if (profile) onSelectDevice(device, profile)
          }}
          className={`text-left px-4 py-3 border-b border-border/50 rounded-lg transition-colors ${
            selectedDevice?.id === device.id ? "bg-accent/15 text-accent font-semibold" : "hover:bg-surface text-primary-text"
          }`}
        >
          <div className="font-medium text-sm">{device.model}</div>
          <div className="text-xs mt-0.5 text-secondary-text">{device.brand} {device.series ? `• ${device.series}` : ""}</div>
        </button>
      ))}
      {devices.length === 0 && (
        <div className="text-secondary-text text-sm py-6 text-center">No devices found.</div>
      )}
    </div>
  )
}

interface ResolutionListProps {
  platform: "mobile" | "desktop"
  selectedProfile: DisplayProfile | null
  onSelectCustom: (profile: DisplayProfile) => void
}

function ResolutionList({ platform, selectedProfile, onSelectCustom }: ResolutionListProps) {
  const presets: DisplayProfile[] = useMemo(() => {
    if (platform === "mobile") {
      return [
        { id: "res-mobile-fhd", width: 1080, height: 2400, aspectRatio: 1080/2400, orientation: "portrait" },
        { id: "res-mobile-qhd", width: 1440, height: 3200, aspectRatio: 1440/3200, orientation: "portrait" },
        { id: "res-mobile-hd", width: 720, height: 1600, aspectRatio: 720/1600, orientation: "portrait" },
        { id: "res-mobile-square", width: 1080, height: 1080, aspectRatio: 1.0, orientation: "portrait" },
      ]
    }
    return DeviceCatalog.getPopularPresets()
  }, [platform])

  return (
    <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
      {presets.map(profile => (
        <button
          key={profile.id}
          onClick={() => onSelectCustom(profile)}
          className={`text-left px-4 py-3 border-b border-border/50 rounded-lg transition-colors ${
            selectedProfile?.id === profile.id ? "bg-accent/15 text-accent font-semibold" : "hover:bg-surface text-primary-text"
          }`}
        >
          <div className="font-mono text-sm">{profile.width} &times; {profile.height}</div>
        </button>
      ))}
    </div>
  )
}

interface CustomResolutionFormProps {
  platform: "mobile" | "desktop"
  selectedProfile: DisplayProfile | null
  onSelectCustom: (profile: DisplayProfile) => void
}

function CustomResolutionForm({ platform, selectedProfile, onSelectCustom }: CustomResolutionFormProps) {
  const defaultW = platform === "mobile" ? 1080 : 2560
  const defaultH = platform === "mobile" ? 2400 : 1440
  const [width, setWidth] = useState(selectedProfile?.width || defaultW)
  const [height, setHeight] = useState(selectedProfile?.height || defaultH)

  const handleApply = () => {
    onSelectCustom({
      id: `custom-${width}x${height}`,
      width,
      height,
      aspectRatio: width / height,
      orientation: width >= height ? "landscape" : "portrait"
    })
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs text-secondary-text uppercase tracking-wider font-semibold">Width (px)</label>
          <input 
            type="number" 
            value={width} 
            onChange={e => setWidth(Number(e.target.value))} 
            className="w-full bg-surface border border-border px-3 py-2 text-sm text-primary-text font-mono rounded-lg focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs text-secondary-text uppercase tracking-wider font-semibold">Height (px)</label>
          <input 
            type="number" 
            value={height} 
            onChange={e => setHeight(Number(e.target.value))} 
            className="w-full bg-surface border border-border px-3 py-2 text-sm text-primary-text font-mono rounded-lg focus:outline-none focus:border-accent"
          />
        </div>
      </div>
      <button 
        onClick={handleApply}
        className="w-full bg-accent text-white font-medium px-4 py-2.5 text-sm rounded-lg hover:opacity-90 transition-opacity"
      >
        Set Custom Dimensions
      </button>
    </div>
  )
}
