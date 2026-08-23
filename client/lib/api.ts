/**
 * FormatFlow Web Client API Client Utilities
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ImageMetadata {
  id: string;
  original_filename: string;
  mime_type: string;
  width: number;
  height: number;
  file_size_bytes: number;
  public_url?: string;
  created_at: string;
}

export interface TransformConfig {
  source_image_id: string;
  preset_name?: string;
  target_width: number;
  target_height: number;
  fit_mode: "cover" | "contain" | "crop" | "fit";
  output_format: "jpeg" | "png" | "webp" | "avif";
  quality: number;
}

export interface TransformResponse {
  transformation_id: string;
  public_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

export async function uploadImage(file: File): Promise<ImageMetadata> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/v1/images/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await response.json();
  return data.image;
}

export async function transformImage(config: TransformConfig): Promise<TransformResponse> {
  const response = await fetch(`${API_URL}/v1/images/transform`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error("Failed to transform image");
  }

  return response.json();
}
