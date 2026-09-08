import type { Tool, ToolCategory } from "@/types/tool";

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  download: "Downloaders",
  image: "Image",
  video: "Video",
  audio: "Audio",
  utility: "Utilities & Documents",
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
    status: "live",
    endpoint: "/image/compress",
  },
  {
    slug: "convert-image",
    name: "Convert Image",
    description: "Move between PNG, JPG, WEBP and AVIF in one step.",
    category: "image",
    status: "live",
    endpoint: "/image/convert",
  },
  {
    slug: "resize-image",
    name: "Resize & Crop",
    description: "Exact dimensions for any platform or print size.",
    category: "image",
    status: "live",
    endpoint: "/image/resize",
  },
  {
    slug: "image-collage",
    name: "Image Collage",
    description: "Combine 2, 3, or 4 photos into stylish grid and magazine-style collages.",
    category: "image",
    status: "live",
    endpoint: "/image-collage",
  },
  {
    slug: "remove-video-bg",
    name: "Remove Video Background",
    description: "Frame-by-frame matting, processed in the background.",
    category: "video",
    status: "live",
    endpoint: "/video/remove-background",
  },
  {
    slug: "convert-video",
    name: "Convert Video",
    description: "MP4, MOV, WEBM and GIF with sensible presets.",
    category: "video",
    status: "live",
    endpoint: "/video/convert",
  },
  {
    slug: "trim-video",
    name: "Trim Video",
    description: "Cut a clean segment without re-encoding everything.",
    category: "video",
    status: "live",
    endpoint: "/video/trim",
  },
  {
    slug: "extract-audio",
    name: "Extract Audio",
    description: "Pull the soundtrack out of any video file.",
    category: "video",
    status: "live",
    endpoint: "/video/extract-audio",
  },
  {
    slug: "convert-audio",
    name: "Convert Audio",
    description: "MP3, WAV, FLAC and AAC with bitrate control.",
    category: "audio",
    status: "live",
    endpoint: "/audio/convert",
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert single or multiple images into a unified PDF document.",
    category: "utility",
    status: "live",
    endpoint: "/image-to-pdf",
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one clean document with custom order.",
    category: "utility",
    status: "live",
    endpoint: "/merge-pdf",
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    description: "Convert PDF documents into editable Word (.docx) documents.",
    category: "utility",
    status: "live",
    endpoint: "/pdf-to-word",
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Microsoft Word documents (.docx, .doc) into clean PDFs.",
    category: "utility",
    status: "live",
    endpoint: "/word-to-pdf",
  },
  {
    slug: "protect-pdf",
    name: "Protect PDF",
    description: "Encrypt and password-protect your PDF files with AES-256 encryption.",
    category: "utility",
    status: "live",
    endpoint: "/protect-pdf",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    description: "Generate custom high-resolution QR codes with custom colors and sizes.",
    category: "utility",
    status: "live",
    endpoint: "/qr-code-generator",
  },
  {
    slug: "download-tiktok-videos",
    name: "TikTok Downloader",
    description: "Watermark-free downloads from a public TikTok URL in MP4 or MP3.",
    category: "download",
    status: "live",
    endpoint: "/download-tiktok-videos",
  },
  {
    slug: "download-facebook-reels",
    name: "Facebook Reels Downloader",
    description: "Download public Facebook reels and videos in HD MP4 or audio.",
    category: "download",
    status: "live",
    endpoint: "/download-facebook-reels",
  },
  {
    slug: "download-youtube-videos",
    name: "YouTube Downloader",
    description: "Grab video or audio from a public YouTube link in HD quality.",
    category: "download",
    status: "live",
    endpoint: "/download-youtube-videos",
  },
  {
    slug: "download-instagram-videos",
    name: "Instagram Downloader",
    description: "Save reels, posts and stories from a public profile in high quality.",
    category: "download",
    status: "live",
    endpoint: "/download-instagram-videos",
  },
];

export const getTool = (slug: string) => {
  const found = TOOLS.find((t) => t.slug === slug);
  if (found) return found;
  const legacyAliases: Record<string, string> = {
    "image-college": "image-collage",
    tiktok: "download-tiktok-videos",
    facebook: "download-facebook-reels",
    youtube: "download-youtube-videos",
    instagram: "download-instagram-videos",
  };
  const targetSlug = legacyAliases[slug];
  if (targetSlug) {
    return TOOLS.find((t) => t.slug === targetSlug);
  }
  return undefined;
};
