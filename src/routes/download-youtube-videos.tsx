import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { UrlDownloaderForm } from "@/components/tools/UrlDownloaderForm";
import { DOWNLOAD_TOOL_CONFIGS } from "@/components/tools/downloadToolConfigs";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/download-youtube-videos")({
  head: () =>
    buildSeoMeta({
      title: "Download YouTube Videos & Shorts Online — Toolbox | Free MP4 & MP3",
      description:
        "Fast, private YouTube video and Shorts downloader. Save public YouTube videos in 1080p/720p MP4 or convert audio directly to MP3 without ads or software.",
      path: "/download-youtube-videos",
      keywords: [
        "download youtube videos",
        "youtube shorts downloader",
        "youtube to mp4",
        "youtube to mp3",
        "save youtube video online",
      ],
    }),
  component: DownloadYouTubePage,
});

function DownloadYouTubePage() {
  const config = DOWNLOAD_TOOL_CONFIGS["download-youtube-videos"];

  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Download YouTube Videos & Shorts",
          description:
            "Save public YouTube videos and Shorts in MP4 or convert directly to MP3 audio online.",
          slug: "download-youtube-videos",
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Download YouTube Videos</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Save YouTube videos, Shorts, and audio tracks straight to your device at original quality
          with fast conversion speeds.
        </p>

        <div className="mt-10">
          <UrlDownloaderForm {...config} />
        </div>
      </div>
    </SiteLayout>
  );
}
