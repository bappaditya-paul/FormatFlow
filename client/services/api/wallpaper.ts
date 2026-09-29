import { GenerationInput, GenerationResult } from "./types"
import { processBatchImageDirect } from "@/lib/api"

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  if (dataUrl.startsWith("data:")) {
    try {
      const arr = dataUrl.split(",")
      const mimeMatch = arr[0].match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : "image/png"
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    } catch {
      // Fallback to fetch
    }
  }
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type || "image/png" })
}

export async function generateWallpaper(input: GenerationInput): Promise<GenerationResult> {
  let fileToUpload: File
  if (input.imageFile) {
    fileToUpload = input.imageFile
  } else {
    fileToUpload = await dataUrlToFile(input.imageSrc, "wallpaper_source.png")
  }

  const targetW = input.displayProfile.width
  const targetH = input.displayProfile.height
  const format = (input.options?.format || "PNG").toUpperCase()

  const batchRes = await processBatchImageDirect(fileToUpload, targetW, targetH, format)

  const primaryVariant = batchRes.variants[0]

  return {
    id: batchRes.file_id,
    url: primaryVariant ? primaryVariant.output_url : input.imageSrc,
    width: batchRes.target_width,
    height: batchRes.target_height,
    output_format: batchRes.output_format,
    variants: batchRes.variants,
    total_execution_time_seconds: batchRes.total_execution_time_seconds
  }
}

