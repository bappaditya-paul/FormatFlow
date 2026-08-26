import { GenerationInput, GenerationResult } from "./types"

/**
 * Simulates a backend API call for wallpaper generation.
 * This can be swapped with a real `fetch` call to FastAPI later.
 */
export async function generateWallpaper(input: GenerationInput): Promise<GenerationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // For MVP, just return the source image to simulate result
      resolve({
        id: "simulated-result-" + Date.now(),
        url: input.imageSrc,
        width: input.displayProfile.width,
        height: input.displayProfile.height
      })
    }, 2000)
  })
}
