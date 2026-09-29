import React from "react"

interface Props {
  platform: "mobile" | "desktop" | null
  onChange: (platform: "mobile" | "desktop") => void
}

export function PlatformSelector({ platform, onChange }: Props) {
  return (
    <div className="flex bg-surface p-1 rounded-xl border border-border w-full max-w-[240px]">
      <button
        onClick={() => onChange("mobile")}
        className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-colors ${
          platform === "mobile" 
            ? "bg-accent text-primary-text shadow-sm" 
            : "text-secondary-text hover:text-primary-text"
        }`}
      >
        Mobile
      </button>
      <button
        onClick={() => onChange("desktop")}
        className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-colors ${
          platform === "desktop" 
            ? "bg-accent text-primary-text shadow-sm" 
            : "text-secondary-text hover:text-primary-text"
        }`}
      >
        Desktop
      </button>
    </div>
  )
}
