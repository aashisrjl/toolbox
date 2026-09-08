import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { getTool } from "@/lib/tools";
import { RemoveImageBackground } from "@/components/tools/RemoveImageBackground";
import { ImageToolForm } from "@/components/tools/ImageToolForm";
import { IMAGE_TOOL_CONFIGS } from "@/components/tools/imageToolConfigs";
import { VideoToolForm } from "@/components/tools/VideoToolForm";
import { VIDEO_TOOL_CONFIGS } from "@/components/tools/videoToolConfigs";

import { AudioToolForm } from "@/components/tools/AudioToolForm";
import { AUDIO_TOOL_CONFIGS } from "@/components/tools/audioToolConfigs";
import { UrlDownloaderForm } from "@/components/tools/UrlDownloaderForm";
import { DOWNLOAD_TOOL_CONFIGS } from "@/components/tools/downloadToolConfigs";
import { ImageToPdfForm } from "@/components/tools/ImageToPdfForm";
import { QrGeneratorForm } from "@/components/tools/QrGeneratorForm";
import { MergePdfForm } from "@/components/tools/MergePdfForm";
import { PdfToWordForm } from "@/components/tools/PdfToWordForm";
import { WordToPdfForm } from "@/components/tools/WordToPdfForm";
import { ProtectPdfForm } from "@/components/tools/ProtectPdfForm";

import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return tool;
  },
  head: ({ loaderData, params }) => {
    const canonicalSlug = loaderData?.slug ?? params.slug;
    return buildSeoMeta({
      title: loaderData ? `${loaderData.name} — Toolbox` : "Toolbox",
      description: loaderData?.description ?? "Media tools on Toolbox.",
      path: `/tools/${params.slug}`,
      canonicalPath: `/${canonicalSlug}`,
    });
  },
  component: ToolPage,
});

function ToolPage() {
  const tool = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-bold">{tool.name}</h1>
        <p className="mt-3 text-muted-foreground">{tool.description}</p>

        <div className="mt-10">
          {tool.slug === "remove-image-bg" ? (
            <RemoveImageBackground endpoint={tool.endpoint} />
          ) : IMAGE_TOOL_CONFIGS[tool.slug] ? (
            <ImageToolForm {...IMAGE_TOOL_CONFIGS[tool.slug]} />
          ) : VIDEO_TOOL_CONFIGS[tool.slug] ? (
            <VideoToolForm {...VIDEO_TOOL_CONFIGS[tool.slug]} />
          ) : AUDIO_TOOL_CONFIGS[tool.slug] ? (
            <AudioToolForm {...AUDIO_TOOL_CONFIGS[tool.slug]} />
          ) : DOWNLOAD_TOOL_CONFIGS[tool.slug] ? (
            <UrlDownloaderForm {...DOWNLOAD_TOOL_CONFIGS[tool.slug]} />
          ) : tool.slug === "image-to-pdf" ? (
            <ImageToPdfForm />
          ) : tool.slug === "qr-code-generator" ? (
            <QrGeneratorForm />
          ) : tool.slug === "merge-pdf" ? (
            <MergePdfForm />
          ) : tool.slug === "pdf-to-word" ? (
            <PdfToWordForm />
          ) : tool.slug === "word-to-pdf" ? (
            <WordToPdfForm />
          ) : tool.slug === "protect-pdf" ? (
            <ProtectPdfForm />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="font-display font-semibold">This tool is on the way</p>
              <p className="mt-2 text-sm text-muted-foreground">
                It will use <code className="text-primary">POST /api/v1{tool.endpoint}</code> once
                the backend endpoint is live.
              </p>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
