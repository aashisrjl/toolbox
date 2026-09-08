import { submitFileJob } from "@/services/api";
import type { Job } from "@/types/tool";

export interface ConvertVideoOptions {
  format: string;
  quality: string;
}

export interface TrimVideoOptions {
  start_time: string;
  end_time: string;
}

export interface ExtractAudioOptions {
  format: string;
  bitrate: string;
}

export interface RemoveVideoBgOptions {
  model?: string;
  smooth_edges?: string;
}

export const removeVideoBackground = (
  file: File,
  options: RemoveVideoBgOptions = {},
): Promise<Job> => submitFileJob("/video/remove-background", file, { ...options });

export const convertVideo = (file: File, options: ConvertVideoOptions): Promise<Job> =>
  submitFileJob("/video/convert", file, { ...options });

export const trimVideo = (file: File, options: TrimVideoOptions): Promise<Job> =>
  submitFileJob("/video/trim", file, { ...options });

export const extractAudio = (file: File, options: ExtractAudioOptions): Promise<Job> =>
  submitFileJob("/video/extract-audio", file, { ...options });
