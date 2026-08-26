import React from "react"
import { GenerationResult } from "@/services/api/types"

interface Props {
  result: GenerationResult
  onReset: () => void
}

export function DownloadButton({ result, onReset }: Props) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = result.url
    link.download = `formatflow-${result.width}x${result.height}.webp`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-4 mt-8 w-full">
      <button
        onClick={handleDownload}
        className="w-full py-4 px-6 bg-primary-text text-background text-sm font-semibold rounded-lg hover:bg-primary-text/90 transition-all active:scale-[0.96]"
      >
        Download Wallpaper
      </button>
      <button
        onClick={onReset}
        className="w-full py-3 px-6 bg-surface text-primary-text text-sm font-medium rounded-lg hover:bg-border transition-all active:scale-[0.96]"
      >
        Format another
      </button>
    </div>
  )
}
