import { DisplayProfile } from "@/data/devices/types"

export type GenerationInput = {
  imageSrc: string
  displayProfile: DisplayProfile
  options?: {
    fitMode: "cover" | "contain" | "crop" | "fit"
    format: "webp" | "jpeg" | "png" | "avif"
    quality: number
  }
}

export type GenerationResult = {
  id: string
  url: string
  width: number
  height: number
}
