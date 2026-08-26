import { useState } from "react"
import { Device, DisplayProfile } from "@/data/devices/types"
import { generateWallpaper } from "@/services/api/wallpaper"
import { GenerationResult } from "@/services/api/types"

export type ConverterStatus = "idle" | "uploading" | "ready" | "generating" | "complete" | "error"

export function useWallpaperConverter() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [platform, setPlatform] = useState<"mobile" | "desktop" | null>(null)
  const [device, setDevice] = useState<Device | null>(null)
  const [displayProfile, setDisplayProfile] = useState<DisplayProfile | null>(null)
  
  const [status, setStatus] = useState<ConverterStatus>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)

  const handleUpload = (file: File) => {
    setStatus("uploading")
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string)
        setStatus("ready")
        // Default to mobile platform on first upload
        if (!platform) setPlatform("mobile")
      }
    }
    reader.onerror = () => {
      setStatus("error")
      setErrorMsg("Failed to read image file.")
    }
    reader.readAsDataURL(file)
  }

  const selectDevice = (newDevice: Device, profile: DisplayProfile) => {
    setDevice(newDevice)
    setDisplayProfile(profile)
  }

  const selectCustomProfile = (profile: DisplayProfile) => {
    setDevice(null)
    setDisplayProfile(profile)
  }

  const generate = async () => {
    if (!imageSrc || !displayProfile) return

    setStatus("generating")
    try {
      const res = await generateWallpaper({
        imageSrc,
        displayProfile,
        options: { fitMode: "cover", format: "webp", quality: 90 }
      })
      setResult(res)
      setStatus("complete")
    } catch {
      setStatus("error")
      setErrorMsg("Failed to generate wallpaper.")
    }
  }

  const reset = () => {
    setImageSrc(null)
    setPlatform(null)
    setDevice(null)
    setDisplayProfile(null)
    setStatus("idle")
    setResult(null)
    setErrorMsg(null)
  }

  return {
    imageSrc,
    platform,
    setPlatform,
    device,
    displayProfile,
    selectDevice,
    selectCustomProfile,
    status,
    errorMsg,
    result,
    handleUpload,
    generate,
    reset,
    setStatus
  }
}
