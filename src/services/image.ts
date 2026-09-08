import { submitFileJob, submitMultiFileJob } from "@/services/api";
import type { Job } from "@/types/tool";

export interface CompressOptions {
  quality: string;
  format: string;
}

export interface ConvertOptions {
  format: string;
}

export interface ResizeOptions {
  mode: string;
  width: string;
  height: string;
  keep_aspect: string;
}

export interface CollageOptions {
  layout?: string;
  spacing?: number | string;
  border_radius?: number | string;
  bg_color?: string;
  aspect_ratio?: string;
  format?: string;
}

export const removeImageBackground = (file: File): Promise<Job> =>
  submitFileJob("/image/remove-background", file, { format: "png" });

export const compressImage = (file: File, options: CompressOptions): Promise<Job> =>
  submitFileJob("/image/compress", file, { ...options });

export const convertImage = (file: File, options: ConvertOptions): Promise<Job> =>
  submitFileJob("/image/convert", file, { ...options });

export const resizeImage = (file: File, options: ResizeOptions): Promise<Job> =>
  submitFileJob("/image/resize", file, { ...options });

export const createImageCollage = (files: File[], options: CollageOptions = {}): Promise<Job> => {
  const opts: Record<string, string> = {
    layout: options.layout || "auto",
    spacing: String(options.spacing ?? 16),
    border_radius: String(options.border_radius ?? 0),
    bg_color: options.bg_color || "#ffffff",
    aspect_ratio: options.aspect_ratio || "1:1",
    format: options.format || "png",
  };
  return submitMultiFileJob("/image-collage", files, "files", opts);
};
