import type { UrlDownloaderFormProps } from "@/components/tools/UrlDownloaderForm";

const youtubeConfig: UrlDownloaderFormProps = {
  platform: "download-youtube-videos",
  placeholder: "https://www.youtube.com/watch?v=... or https://youtu.be/...",
  actionLabel: "Download YouTube Media",
  runningLabel: "Downloading from YouTube",
  helperText: "Supports standard YouTube videos, Shorts, and music tracks in MP4 or MP3.",
  validate: (url) => {
    if (!/youtube\.com|youtu\.be/i.test(url)) {
      return "Please enter a valid YouTube link (youtube.com or youtu.be).";
    }
    return null;
  },
};

const instagramConfig: UrlDownloaderFormProps = {
  platform: "download-instagram-videos",
  placeholder: "https://www.instagram.com/reel/... or /p/...",
  actionLabel: "Download Instagram Media",
  runningLabel: "Downloading from Instagram",
  helperText: "Supports public Instagram reels, video posts, and carousel media.",
  validate: (url) => {
    if (!/instagram\.com/i.test(url)) {
      return "Please enter a valid Instagram link (instagram.com).";
    }
    return null;
  },
};

const tiktokConfig: UrlDownloaderFormProps = {
  platform: "download-tiktok-videos",
  placeholder: "https://www.tiktok.com/@user/video/... or https://vm.tiktok.com/...",
  actionLabel: "Download TikTok Video",
  runningLabel: "Downloading from TikTok",
  helperText: "Downloads high-definition, watermark-free TikTok videos or extracted audio.",
  validate: (url) => {
    if (!/tiktok\.com/i.test(url)) {
      return "Please enter a valid TikTok link (tiktok.com).";
    }
    return null;
  },
};

const facebookConfig: UrlDownloaderFormProps = {
  platform: "download-facebook-reels",
  placeholder: "https://www.facebook.com/reel/... or https://fb.watch/...",
  actionLabel: "Download Facebook Reel",
  runningLabel: "Downloading Facebook Reel",
  helperText: "Downloads high-definition public Facebook reels and videos in MP4 or MP3.",
  validate: (url) => {
    if (!/facebook\.com|fb\.watch|fb\.com/i.test(url)) {
      return "Please enter a valid Facebook link (facebook.com or fb.watch).";
    }
    return null;
  },
};

export const DOWNLOAD_TOOL_CONFIGS: Record<string, UrlDownloaderFormProps> = {
  "download-tiktok-videos": tiktokConfig,
  tiktok: tiktokConfig,
  "download-facebook-reels": facebookConfig,
  facebook: facebookConfig,
  "download-youtube-videos": youtubeConfig,
  youtube: youtubeConfig,
  "download-instagram-videos": instagramConfig,
  instagram: instagramConfig,
};
