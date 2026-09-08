import { submitFileJob } from "@/services/api";
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

export const removeImageBackground = (file: File): Promise<Job> =>
  submitFileJob("/image/remove-background", file, { format: "png" });

export const compressImage = (file: File, options: CompressOptions): Promise<Job> =>
  submitFileJob("/image/compress", file, { ...options });

export const convertImage = (file: File, options: ConvertOptions): Promise<Job> =>
  submitFileJob("/image/convert", file, { ...options });

export const resizeImage = (file: File, options: ResizeOptions): Promise<Job> =>
  submitFileJob("/image/resize", file, { ...options });
