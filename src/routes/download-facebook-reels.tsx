import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { UrlDownloaderForm } from "@/components/tools/UrlDownloaderForm";
import { DOWNLOAD_TOOL_CONFIGS } from "@/components/tools/downloadToolConfigs";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/download-facebook-reels")({
  head: () =>
    buildSeoMeta({
      title: "Download Facebook Reels & Videos Online — Toolbox | Free HD MP4",
      description:
        "Fast, private Facebook reels and video downloader. Save public Facebook videos, reels, and stories in high-definition 1080p MP4 or MP3 sound without registration.",
      path: "/download-facebook-reels",
      keywords: [
        "facebook reels downloader",
        "download facebook video",
        "fb reel download",
        "facebook video to mp4",
        "fb video saver",
      ],
    }),
  component: DownloadFacebookPage,
});

function DownloadFacebookPage() {
  const config = DOWNLOAD_TOOL_CONFIGS["download-facebook-reels"];

  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Download Facebook Reels & Videos",
          description: "Save public Facebook videos and reels in high resolution MP4 or MP3 sound.",
          slug: "download-facebook-reels",
          category: "download",
        })}
      />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex items-center gap-3.5">
          <img
            src="/tools-logo.png"
            alt="Toolbox logo"
            className="h-10 w-10 rounded-xl border border-border/80 bg-card p-1 shadow-sm object-contain"
          />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Download Facebook Reels</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Download public Facebook reels and videos quickly without watermarks in crisp HD MP4 or
          audio format.
        </p>

        <div className="mt-10">
          <UrlDownloaderForm {...config} />
        </div>
      </div>
    </SiteLayout>
  );
}
