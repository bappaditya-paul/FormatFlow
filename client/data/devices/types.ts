export type DisplayProfile = {
  id: string
  width: number
  height: number
  aspectRatio: number
  orientation: "portrait" | "landscape"
}

export type Device = {
  id: string
  category: "mobile" | "desktop"
  brand: string
  series?: string
  model: string
  displayProfileId: string
  aliases?: string[]
}
