import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { UrlDownloaderForm } from "@/components/tools/UrlDownloaderForm";
import { DOWNLOAD_TOOL_CONFIGS } from "@/components/tools/downloadToolConfigs";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/download-tiktok-videos")({
  head: () =>
    buildSeoMeta({
      title: "Download TikTok Videos Without Watermark — Toolbox | Free HD MP4",
      description:
        "Fast, watermark-free TikTok video downloader. Save TikTok videos in high-definition MP4 or extract original MP3 sounds with no watermarks and no login.",
      path: "/download-tiktok-videos",
      keywords: [
        "tiktok downloader",
        "download tiktok without watermark",
        "tiktok to mp4",
        "tiktok sound downloader",
        "save tiktok video",
      ],
    }),
  component: DownloadTikTokPage,
});

function DownloadTikTokPage() {
  const config = DOWNLOAD_TOOL_CONFIGS["download-tiktok-videos"];

  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Download TikTok Videos Without Watermark",
          description:
            "Save TikTok videos in high-definition MP4 or extract original MP3 sounds with no watermarks and no login.",
          slug: "download-tiktok-videos",
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Download TikTok Videos</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Save watermark-free TikTok videos directly to your device in original HD quality, or
          extract high-fidelity MP3 sound.
        </p>

        <div className="mt-10">
          <UrlDownloaderForm {...config} />
        </div>
      </div>
    </SiteLayout>
  );
}
