/**
 * FormatFlow Web Client API Client Utilities
 */

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // When running in browser, return empty string so API calls use relative paths (/api/v1/...)
  // Next.js rewrites in next.config.ts automatically proxy /api/v1 and /uploads to http://127.0.0.1:8001!
  // This enables public links (ngrok, localtunnel, zrok, public IP) to work on 5G mobile devices seamlessly without CORS/port issues.
  if (typeof window !== "undefined") {
    return "";
  }
  return "http://127.0.0.1:8001";
}

export interface TransformResponse {
  file_id: string;
  output_url: string;
  target_width: number;
  target_height: number;
  expansion_method: string;
  action_taken: string;
  execution_time_seconds: number;
}

export interface VariantItem {
  expansion_method: string;
  output_url: string;
  action_taken: string;
  execution_time_seconds: number;
}

export interface BatchTransformResponse {
  file_id: string;
  target_width: number;
  target_height: number;
  output_format: string;
  variants: VariantItem[];
  total_execution_time_seconds: number;
}

export interface ImageMetadata {
  id: string;
  url: string;
  width?: number;
  height?: number;
}

export interface TransformConfig {
  target_w: number;
  target_h: number;
  prompt?: string;
  expansion_method?: string;
  output_format?: string;
}


export function normalizeMediaUrl(url: string): string {
  if (!url) return url;
  if (url.includes("/uploads/")) {
    const parts = url.split("/uploads/");
    return `/uploads/${parts[1]}`;
  }
  if (url.startsWith("/")) {
    return url;
  }
  return url;
}

export async function processImageDirect(
  file: File,
  targetW: number = 768,
  targetH: number = 768,
  prompt: string = "high quality seamless extension",
  expansionMethod: string = "AI Outpainting",
  outputFormat: string = "PNG"
): Promise<TransformResponse> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("target_w", targetW.toString());
  formData.append("target_h", targetH.toString());
  formData.append("prompt", prompt);
  formData.append("expansion_method", expansionMethod);
  formData.append("output_format", outputFormat.toUpperCase());

  const response = await fetch(`${baseUrl}/api/v1/transform`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Transformation failed: ${errText}`);
  }

  const data = await response.json();
  if (data.output_url) {
    data.output_url = normalizeMediaUrl(data.output_url);
  }
  return data;
}

export async function processBatchImageDirect(
  file: File,
  targetW: number = 768,
  targetH: number = 768,
  outputFormat: string = "PNG"
): Promise<BatchTransformResponse> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("target_w", targetW.toString());
  formData.append("target_h", targetH.toString());
  formData.append("output_format", outputFormat.toUpperCase());

  const response = await fetch(`${baseUrl}/api/v1/transform/batch`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Batch transformation failed: ${errText}`);
  }

  const data = await response.json();
  if (data.variants && Array.isArray(data.variants)) {
    data.variants = data.variants.map((v: any) => ({
      ...v,
      output_url: normalizeMediaUrl(v.output_url)
    }));
  }
  return data;
}


export async function uploadImage(file: File): Promise<ImageMetadata> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseUrl}/api/v1/images/upload`, {
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
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/images/transform`, {
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


