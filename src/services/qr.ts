import { request } from "@/services/api";
import type { Job } from "@/types/tool";

export interface GenerateQrOptions {
  data: string;
  format?: string;
  scale?: number;
  border?: number;
  foreground_color?: string;
  background_color?: string;
  error_correction?: string;
}

export const generateQrCode = (options: GenerateQrOptions): Promise<Job> =>
  request<Job>("/qr-code-generator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
