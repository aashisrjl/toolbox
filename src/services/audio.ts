import { submitFileJob } from "@/services/api";
import type { Job } from "@/types/tool";

export interface ConvertAudioOptions {
  format: string;
  bitrate: string;
}

export const convertAudio = (file: File, options: ConvertAudioOptions): Promise<Job> =>
  submitFileJob("/audio/convert", file, { ...options });
