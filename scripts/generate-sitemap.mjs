import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SITE_URL = process.env.VITE_SITE_URL || "https://toolbox.aashishrijal.com.np";
const TODAY = new Date().toISOString().split("T")[0];

const ROUTES = [
  // Homepage
  { path: "/", priority: "1.0", changefreq: "daily" },

  // Primary Tools - Images
  { path: "/image-collage", priority: "0.9", changefreq: "weekly" },
  { path: "/remove-image-bg", priority: "0.9", changefreq: "weekly" },
  { path: "/compress-image", priority: "0.9", changefreq: "weekly" },
  { path: "/convert-image", priority: "0.9", changefreq: "weekly" },
  { path: "/resize-image", priority: "0.9", changefreq: "weekly" },

  // PDF & Document Tools
  { path: "/image-to-pdf", priority: "0.9", changefreq: "weekly" },
  { path: "/merge-pdf", priority: "0.9", changefreq: "weekly" },
  { path: "/pdf-to-word", priority: "0.9", changefreq: "weekly" },
  { path: "/word-to-pdf", priority: "0.9", changefreq: "weekly" },
  { path: "/protect-pdf", priority: "0.9", changefreq: "weekly" },
  { path: "/qr-code-generator", priority: "0.9", changefreq: "weekly" },

  // Video & Audio Tools
  { path: "/convert-video", priority: "0.8", changefreq: "weekly" },
  { path: "/trim-video", priority: "0.8", changefreq: "weekly" },
  { path: "/extract-audio", priority: "0.8", changefreq: "weekly" },
  { path: "/remove-video-bg", priority: "0.8", changefreq: "weekly" },
  { path: "/convert-audio", priority: "0.8", changefreq: "weekly" },

  // Downloaders
  { path: "/download-youtube-videos", priority: "0.9", changefreq: "weekly" },
  { path: "/download-tiktok-videos", priority: "0.9", changefreq: "weekly" },
  { path: "/download-facebook-reels", priority: "0.9", changefreq: "weekly" },
  { path: "/download-instagram-videos", priority: "0.9", changefreq: "weekly" },

  // Information & Legal
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.4", changefreq: "monthly" },
  { path: "/terms-and-conditions", priority: "0.4", changefreq: "monthly" },
];

function generateSitemapXml() {
  const xmlItems = ROUTES.map((item) => {
    const loc = `${SITE_URL}${item.path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlItems}
</urlset>
`;
}

const sitemapPath = path.join(rootDir, "public", "sitemap.xml");
fs.writeFileSync(sitemapPath, generateSitemapXml().trim() + "\n", "utf8");
console.log(`✓ Generated sitemap.xml with ${ROUTES.length} routes at ${sitemapPath}`);
