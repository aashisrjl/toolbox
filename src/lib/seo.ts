/**
 * Centralized SEO & Metadata utilities for Toolbox.
 */

export const SITE_URL =
  (typeof process !== "undefined" && process.env?.VITE_SITE_URL) ||
  import.meta.env.VITE_SITE_URL ||
  "https://toolbox.aashishrijal.com.np";

export const SITE_NAME = "Toolbox";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/tools-logo.png`;
export const TWITTER_HANDLE = "@aashisrjl";
export const CREATOR_NAME = "Aashis Rijal";
export const CREATOR_URL = "https://aashishrijal.com.np";

export interface SeoOptions {
  title: string;
  description: string;
  path: string;
  canonicalPath?: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article";
  noindex?: boolean;
}

export function buildSeoMeta(options: SeoOptions) {
  const {
    title,
    description,
    path,
    canonicalPath,
    image = DEFAULT_OG_IMAGE,
    keywords = [],
    type = "website",
    noindex = false,
  } = options;

  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const canonicalUrl = `${SITE_URL}${
    (canonicalPath ?? path).startsWith("/") ? (canonicalPath ?? path) : `/${canonicalPath ?? path}`
  }`;

  const defaultKeywords = [
    "toolbox",
    "online media tools",
    "free file utilities",
    "video converter",
    "audio converter",
    "image compressor",
    "remove background",
    "photo collage",
    "pdf merger",
    "image to pdf",
    "word to pdf",
    "pdf to word",
    "protect pdf",
    "qr code generator",
    "youtube downloader",
    "tiktok downloader",
    "facebook reels downloader",
    "instagram downloader",
    "no watermark",
    "private file converter",
    "open source utilities",
  ];

  const combinedKeywords = Array.from(new Set([...keywords, ...defaultKeywords])).join(", ");

  const meta = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: combinedKeywords },
    {
      name: "robots",
      content: noindex
        ? "noindex, follow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { name: "author", content: CREATOR_NAME },
    { name: "creator", content: CREATOR_NAME },
    { name: "publisher", content: SITE_NAME },

    // Open Graph / Facebook
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "512" },
    { property: "og:image:height", content: "512" },
    { property: "og:image:alt", content: `${title} preview on Toolbox` },
    { property: "og:locale", content: "en_US" },

    // Twitter Cards
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:creator", content: TWITTER_HANDLE },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: title },
  ];

  const links = [{ rel: "canonical", href: canonicalUrl }];

  return { meta, links };
}

export function buildWebApplicationSchema(tool: {
  name: string;
  description: string;
  slug: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/${tool.slug}`,
    applicationCategory:
      tool.category === "image"
        ? "MultimediaApplication"
        : tool.category === "video"
          ? "VideoApplication"
          : tool.category === "audio"
            ? "AudioApplication"
            : "UtilitiesApplication",
    operatingSystem: "All (Web Browser)",
    browserRequirements: "Requires modern web browser with HTML5 and JavaScript support",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    author: {
      "@type": "Person",
      name: CREATOR_NAME,
      url: CREATOR_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Toolbox Media Utilities",
    url: SITE_URL,
    description:
      "A private, high-speed media and document utility suite. Convert, compress, trim, and edit videos, audio, images, and documents without clutter or signups.",
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: CREATOR_NAME,
      url: CREATOR_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
  };
}
