import React from "react"
import { DisplayProfile } from "@/data/devices/types"

interface Props {
  profile: DisplayProfile | null
  imageSrc: string | null
}

export function AspectRatioPreview({ profile, imageSrc }: Props) {
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] border border-border border-dashed rounded-xl p-6 text-secondary-text">
        <span className="text-sm">Select a device to preview shape</span>
      </div>
    )
  }

  // Calculate box dimensions that fit within a 300x300 bounding box
  const MAX_SIZE = 300
  let renderWidth = MAX_SIZE
  let renderHeight = MAX_SIZE

  if (profile.aspectRatio < 1) {
    // Portrait (e.g. mobile)
    renderHeight = MAX_SIZE
    renderWidth = MAX_SIZE * profile.aspectRatio
  } else {
    // Landscape (e.g. desktop)
    renderWidth = MAX_SIZE
    renderHeight = MAX_SIZE / profile.aspectRatio
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] p-8">
      {/* The Dynamic Box */}
      <div 
        className="relative border border-border bg-surface transition-all duration-500 ease-out flex items-center justify-center overflow-hidden"
        style={{ width: `${renderWidth}px`, height: `${renderHeight}px` }}
      >
        {imageSrc ? (
          <img src={imageSrc} className="w-full h-full object-cover opacity-80 mix-blend-screen" alt="Preview" />
        ) : (
          <span className="text-secondary-text font-mono text-xs uppercase tracking-widest">Image</span>
        )}
      </div>

      {/* The Dimensions Label */}
      <div className="mt-8 flex flex-col items-center font-mono">
        <span className="text-primary-text text-sm">
          {profile.width} &times; {profile.height}
        </span>
        <span className="text-secondary-text text-xs mt-1 capitalize">
          {profile.orientation}
        </span>
      </div>
    </div>
  )
}
