import React, { useRef } from "react"

interface Props {
  imageSrc: string | null
  onUpload: (file: File) => void
}

export function ImageUploader({ imageSrc, onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-12 border-2 border-border border-dashed hover:border-secondary-text transition-colors cursor-pointer group"
         onClick={() => fileInputRef.current?.click()}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      {imageSrc ? (
        <div className="text-center">
          <p className="text-primary-text font-medium">Image Uploaded</p>
          <p className="text-secondary-text text-sm mt-2 group-hover:text-primary-text transition-colors">Click to replace</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-primary-text font-medium text-lg">Upload image</p>
          <p className="text-secondary-text text-sm mt-2">or drag & drop</p>
        </div>
      )}
    </div>
  )
}
