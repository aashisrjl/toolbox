import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { UrlDownloaderForm } from "@/components/tools/UrlDownloaderForm";
import { DOWNLOAD_TOOL_CONFIGS } from "@/components/tools/downloadToolConfigs";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/download-instagram-videos")({
  head: () =>
    buildSeoMeta({
      title: "Download Instagram Reels & Videos Online — Toolbox | Free MP4",
      description:
        "Fast Instagram video and reels downloader. Save public Instagram reels, video clips, and posts in original high quality MP4 format without login.",
      path: "/download-instagram-videos",
      keywords: [
        "instagram downloader",
        "download instagram reels",
        "instagram video to mp4",
        "save ig reels",
        "instagram video saver online",
      ],
    }),
  component: DownloadInstagramPage,
});

function DownloadInstagramPage() {
  const config = DOWNLOAD_TOOL_CONFIGS["download-instagram-videos"];

  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Download Instagram Reels & Videos",
          description:
            "Save public Instagram reels, video clips, and media in full quality MP4 format.",
          slug: "download-instagram-videos",
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Download Instagram Videos
          </h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Download high-quality Instagram reels and public videos directly with no registration
          required.
        </p>

        <div className="mt-10">
          <UrlDownloaderForm {...config} />
        </div>
      </div>
    </SiteLayout>
  );
}
