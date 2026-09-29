import React, { useState } from "react"
import { GenerationResult } from "@/services/api/types"

interface Props {
  result: GenerationResult
  exportFormat?: string
  variantName?: string
  activeUrl?: string
  onReset: () => void
}

async function getImageBlob(imageUrl: string, targetFormat: string): Promise<{ blob: Blob; ext: string }> {
  const fmtLower = targetFormat.toLowerCase()
  const targetExt = fmtLower === "jpg" ? "jpg" : fmtLower

  let mimeType = "image/png"
  if (targetExt === "jpg" || targetExt === "jpeg") mimeType = "image/jpeg"
  else if (targetExt === "webp") mimeType = "image/webp"

  // 1. Check if the image URL already matches target extension for fast mobile fetch
  const urlClean = imageUrl.split("?")[0].toLowerCase()
  const currentExt = urlClean.endsWith(".jpg") || urlClean.endsWith(".jpeg") ? "jpg" : urlClean.endsWith(".webp") ? "webp" : "png"

  if (currentExt === targetExt || (currentExt === "jpg" && targetExt === "jpeg")) {
    try {
      const res = await fetch(imageUrl)
      if (res.ok) {
        const blob = await res.blob()
        return { blob, ext: targetExt }
      }
    } catch {
      // Fallback to canvas
    }
  }

  // 2. Canvas format conversion if format differs
  const img = new Image()
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    img.crossOrigin = "anonymous"
  }

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error("Failed to load image for conversion"))
    img.src = imageUrl
  })

  const canvas = document.createElement("canvas")
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(img, 0, 0)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      mimeType,
      0.92
    )
  })

  return { blob, ext: targetExt }
}

export function DownloadButton({ result, exportFormat = "PNG", variantName, activeUrl, onReset }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [canShare, setCanShare] = useState(false)

  React.useEffect(() => {
    if (typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare) {
      setCanShare(true)
    }
  }, [])

  const prepareFile = async () => {
    const downloadUrl = activeUrl || result.url
    const cleanVariant = (variantName || "wallpaper").toLowerCase().replace(/[^a-z0-9]/g, "_")
    const { blob, ext } = await getImageBlob(downloadUrl, exportFormat)
    const filename = `formatflow-${result.width}x${result.height}-${cleanVariant}.${ext}`
    
    let mimeType = "image/png"
    if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg"
    else if (ext === "webp") mimeType = "image/webp"

    const file = new File([blob], filename, { type: mimeType })
    return { file, blob, filename }
  }

  const handleDownload = async () => {
    setIsProcessing(true)
    try {
      const { blob, filename } = await prepareFile()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      link.target = "_self"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Delay revoke by 60 seconds so mobile download manager finishes saving file!
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 60000)
    } catch (err) {
      console.warn("Download error, using direct open fallback:", err)
      const downloadUrl = activeUrl || result.url
      window.open(downloadUrl, "_blank")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNativeShare = async () => {
    setIsProcessing(true)
    try {
      const { file } = await prepareFile()
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "FormatFlow Wallpaper",
          text: `Download ${result.width}x${result.height} Wallpaper`
        })
      } else {
        await handleDownload()
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Native share error:", err)
        await handleDownload()
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-2.5 mt-4 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        <button
          onClick={handleDownload}
          disabled={isProcessing}
          className="flex-1 w-full py-3.5 px-5 bg-accent text-white text-xs sm:text-sm font-semibold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isProcessing ? `Preparing ${exportFormat}...` : `Download Wallpaper (${exportFormat})`}</span>
          <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>

        {canShare && (
          <button
            onClick={handleNativeShare}
            disabled={isProcessing}
            className="w-full sm:w-auto py-3.5 px-4 bg-surface border border-border/80 text-primary-text hover:border-accent text-xs font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            title="Save to Photos / Camera Roll via Share Sheet"
          >
            <svg className="size-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            <span className="sm:hidden">Save to Photos</span>
          </button>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full py-2.5 px-5 bg-surface/60 border border-border/60 text-secondary-text hover:text-primary-text text-xs font-medium rounded-xl hover:bg-surface transition-all active:scale-[0.98] cursor-pointer"
      >
        Format another image
      </button>
    </div>
  )
}
