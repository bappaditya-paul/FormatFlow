import React from "react"
import { ConverterStatus } from "@/lib/hooks/useWallpaperConverter"

interface Props {
  status: ConverterStatus
  disabled: boolean
  onGenerate: () => void
}

export function GenerateButton({ status, disabled, onGenerate }: Props) {
  const isGenerating = status === "generating"

  return (
    <button
      onClick={onGenerate}
      disabled={disabled || isGenerating}
      className={`w-full py-4 px-6 text-sm font-semibold rounded-lg transition-all active:scale-[0.96] ${
        disabled
          ? "bg-surface text-secondary-text cursor-not-allowed"
          : "bg-accent text-primary-text hover:bg-accent/90"
      }`}
    >
      {isGenerating ? "Generating..." : "Generate Wallpaper"}
    </button>
  )
}
