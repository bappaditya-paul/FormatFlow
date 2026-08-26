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
  const [desktopMode, setDesktopMode] = useState<"device" | "resolution" | "custom">("device")

  // Mobile Flow
  if (platform === "mobile") {
    const results = DeviceCatalog.searchDevices(query, "mobile")
    return (
      <div className="flex flex-col gap-6 w-full max-w-md">
        <input 
          type="text" 
          placeholder="Search device..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface border border-border px-4 py-3 text-sm text-primary-text placeholder-secondary-text focus:outline-none focus:border-accent transition-colors"
        />
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {results.map(device => (
            <button
              key={device.id}
              onClick={() => {
                const profile = DeviceCatalog.getDisplayProfile(device.displayProfileId)
                if (profile) onSelectDevice(device, profile)
              }}
              className={`text-left px-4 py-3 border-b border-border transition-colors ${
                selectedDevice?.id === device.id ? "bg-accent/10 text-accent" : "hover:bg-surface text-primary-text"
              }`}
            >
              <div className="font-medium">{device.model}</div>
              <div className={`text-xs mt-1 ${selectedDevice?.id === device.id ? "text-accent/80" : "text-secondary-text"}`}>
                {device.brand} {device.series ? `• ${device.series}` : ""}
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <div className="text-secondary-text text-sm py-4">No devices found.</div>
          )}
        </div>
      </div>
    )
  }

  // Desktop Flow
  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <div className="flex gap-4 border-b border-border">
        {(["device", "resolution", "custom"] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setDesktopMode(mode)}
            className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${
              desktopMode === mode 
                ? "border-accent text-primary-text" 
                : "border-transparent text-secondary-text hover:text-primary-text"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {desktopMode === "device" && (
          <DesktopDeviceList 
            selectedDevice={selectedDevice} 
            onSelectDevice={onSelectDevice} 
          />
        )}
        
        {desktopMode === "resolution" && (
          <DesktopResolutionList 
            selectedProfile={selectedProfile} 
            onSelectCustom={onSelectCustom} 
          />
        )}

        {desktopMode === "custom" && (
          <CustomResolutionForm 
            selectedProfile={selectedProfile}
            onSelectCustom={onSelectCustom}
          />
        )}
      </div>
    </div>
  )
}

interface DesktopDeviceListProps {
  selectedDevice: Device | null;
  onSelectDevice: (device: Device, profile: DisplayProfile) => void;
}

function DesktopDeviceList({ selectedDevice, onSelectDevice }: DesktopDeviceListProps) {
  const devices = useMemo(() => DeviceCatalog.searchDevices("", "desktop"), [])
  return (
    <div className="flex flex-col gap-2">
      {devices.map(device => (
        <button
          key={device.id}
          onClick={() => {
            const profile = DeviceCatalog.getDisplayProfile(device.displayProfileId)
            if (profile) onSelectDevice(device, profile)
          }}
          className={`text-left px-4 py-3 border-b border-border transition-colors ${
            selectedDevice?.id === device.id ? "bg-accent/10 text-accent" : "hover:bg-surface text-primary-text"
          }`}
        >
          <div className="font-medium">{device.model}</div>
          <div className="text-xs mt-1 text-secondary-text">{device.brand}</div>
        </button>
      ))}
    </div>
  )
}

interface DesktopResolutionListProps {
  selectedProfile: DisplayProfile | null;
  onSelectCustom: (profile: DisplayProfile) => void;
}

function DesktopResolutionList({ selectedProfile, onSelectCustom }: DesktopResolutionListProps) {
  const presets = useMemo(() => DeviceCatalog.getPopularPresets(), [])
  return (
    <div className="flex flex-col gap-2">
      {presets.map(profile => (
        <button
          key={profile.id}
          onClick={() => onSelectCustom(profile)}
          className={`text-left px-4 py-3 border-b border-border transition-colors ${
            selectedProfile?.id === profile.id ? "bg-accent/10 text-accent" : "hover:bg-surface text-primary-text"
          }`}
        >
          <div className="font-mono text-sm">{profile.width} &times; {profile.height}</div>
        </button>
      ))}
    </div>
  )
}

interface CustomResolutionFormProps {
  selectedProfile: DisplayProfile | null;
  onSelectCustom: (profile: DisplayProfile) => void;
}

function CustomResolutionForm({ selectedProfile, onSelectCustom }: CustomResolutionFormProps) {
  const [width, setWidth] = useState(selectedProfile?.width || 2560)
  const [height, setHeight] = useState(selectedProfile?.height || 1440)

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs text-secondary-text uppercase tracking-wider">Width</label>
          <input 
            type="number" 
            value={width} 
            onChange={e => setWidth(Number(e.target.value))} 
            className="w-full bg-surface border border-border px-3 py-2 text-sm text-primary-text font-mono focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs text-secondary-text uppercase tracking-wider">Height</label>
          <input 
            type="number" 
            value={height} 
            onChange={e => setHeight(Number(e.target.value))} 
            className="w-full bg-surface border border-border px-3 py-2 text-sm text-primary-text font-mono focus:outline-none focus:border-accent"
          />
        </div>
      </div>
      <button 
        onClick={handleApply}
        className="mt-2 bg-surface hover:bg-border text-primary-text px-4 py-2 text-sm transition-colors"
      >
        Apply
      </button>
    </div>
  )
}
