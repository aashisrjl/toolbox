import { submitUrlJob } from "@/services/api";
import type { Job } from "@/types/tool";

export type DownloadPlatform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "download-youtube-videos"
  | "download-instagram-videos"
  | "download-tiktok-videos"
  | "download-facebook-reels";

export interface DownloadOptions {
  format?: "video" | "audio";
}

const ENDPOINT_MAP: Record<string, string> = {
  tiktok: "/download-tiktok-videos",
  "download-tiktok-videos": "/download-tiktok-videos",
  facebook: "/download-facebook-reels",
  "download-facebook-reels": "/download-facebook-reels",
  youtube: "/download-youtube-videos",
  "download-youtube-videos": "/download-youtube-videos",
  instagram: "/download-instagram-videos",
  "download-instagram-videos": "/download-instagram-videos",
};

export const downloadMedia = (
  platform: DownloadPlatform,
  url: string,
  options: DownloadOptions = { format: "video" },
): Promise<Job> => {
  const endpoint = ENDPOINT_MAP[platform] || `/${platform}/download`;
  return submitUrlJob(endpoint, url, { format: options.format || "video" });
};
