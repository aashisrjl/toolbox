import type { Tool, ToolCategory } from "@/types/tool";

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  download: "Downloaders",
  image: "Image",
  video: "Video",
  audio: "Audio",
};

export const TOOLS: Tool[] = [
  {
    slug: "remove-image-bg",
    name: "Remove Image Background",
    description: "Cut out the subject and get a clean transparent PNG.",
    category: "image",
    status: "live",
    endpoint: "/image/remove-background",
  },
  {
    slug: "compress-image",
    name: "Compress Image",
    description: "Shrink file size while keeping the detail that matters.",
    category: "image",
    status: "soon",
    endpoint: "/image/compress",
  },
  {
    slug: "convert-image",
    name: "Convert Image",
    description: "Move between PNG, JPG, WEBP and AVIF in one step.",
    category: "image",
    status: "soon",
    endpoint: "/image/convert",
  },
  {
    slug: "resize-image",
    name: "Resize & Crop",
    description: "Exact dimensions for any platform or print size.",
    category: "image",
    status: "soon",
    endpoint: "/image/resize",
  },
  {
    slug: "remove-video-bg",
    name: "Remove Video Background",
    description: "Frame-by-frame matting, processed in the background.",
    category: "video",
    status: "soon",
    endpoint: "/video/remove-background",
  },
  {
    slug: "convert-video",
    name: "Convert Video",
    description: "MP4, MOV, WEBM and GIF with sensible presets.",
    category: "video",
    status: "soon",
    endpoint: "/video/convert",
  },
  {
    slug: "trim-video",
    name: "Trim Video",
    description: "Cut a clean segment without re-encoding everything.",
    category: "video",
    status: "soon",
    endpoint: "/video/trim",
  },
  {
    slug: "extract-audio",
    name: "Extract Audio",
    description: "Pull the soundtrack out of any video file.",
    category: "video",
    status: "soon",
    endpoint: "/video/extract-audio",
  },
  {
    slug: "convert-audio",
    name: "Convert Audio",
    description: "MP3, WAV, FLAC and AAC with bitrate control.",
    category: "audio",
    status: "soon",
    endpoint: "/audio/convert",
  },
  {
    slug: "youtube",
    name: "YouTube Downloader",
    description: "Grab video or audio from a public YouTube link.",
    category: "download",
    status: "soon",
    endpoint: "/youtube/download",
  },
  {
    slug: "instagram",
    name: "Instagram Downloader",
    description: "Save reels, posts and stories from a public profile.",
    category: "download",
    status: "soon",
    endpoint: "/instagram/download",
  },
  {
    slug: "tiktok",
    name: "TikTok Downloader",
    description: "Watermark-free downloads from a public TikTok URL.",
    category: "download",
    status: "soon",
    endpoint: "/tiktok/download",
  },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
