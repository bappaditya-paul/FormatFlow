import { DisplayProfile } from "@/data/devices/types"

export type GenerationInput = {
  imageFile?: File | null
  imageSrc: string
  displayProfile: DisplayProfile
  options?: {
    fitMode?: "cover" | "contain" | "crop" | "fit"
    format?: "WEBP" | "JPEG" | "JPG" | "PNG" | "webp" | "jpeg" | "png"
    quality?: number
  }
}

export type VariantResultItem = {
  expansion_method: string
  output_url: string
  action_taken: string
  execution_time_seconds: number
}

export type GenerationResult = {
  id: string
  url: string
  width: number
  height: number
  output_format?: string
  variants?: VariantResultItem[]
  total_execution_time_seconds?: number
}

