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
import { ImageCollageForm } from "@/components/tools/ImageCollageForm";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return tool;
  },
  head: ({ loaderData, params }) => {
    const title = loaderData ? `${loaderData.name} — Free Online Tool | Toolbox` : "Toolbox";
    const description = loaderData?.description ?? "Private online media tools on Toolbox.";
    return buildSeoMeta({
      title,
      description,
      path: `/${params.slug}`,
      canonicalPath: `/${loaderData?.slug ?? params.slug}`,
      keywords: [
        loaderData?.name.toLowerCase() ?? "",
        loaderData?.category ?? "",
        "online converter",
        "free browser utility",
      ],
    });
  },
  component: SlugToolPage,
});

function SlugToolPage() {
  const tool = Route.useLoaderData();

  return (
    <SiteLayout>
      <JsonLd data={buildWebApplicationSchema(tool)} />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex items-center gap-3.5">
          <img
            src="/tools-logo.png"
            alt="Toolbox logo"
            className="h-10 w-10 rounded-xl border border-border/80 bg-card p-1 shadow-sm object-contain"
          />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{tool.name}</h1>
        </div>
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
          ) : tool.slug === "image-collage" || tool.slug === "image-college" ? (
            <ImageCollageForm />
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
