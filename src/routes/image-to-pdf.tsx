import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { ImageToPdfForm } from "@/components/tools/ImageToPdfForm";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/image-to-pdf")({
  head: () =>
    buildSeoMeta({
      title: "Image to PDF Converter — Toolbox | Free Online JPG & PNG to PDF",
      description:
        "Convert JPG, PNG, WEBP, and AVIF images into high-quality PDF documents online. Combine multiple photos into a single PDF with custom page orientation.",
      path: "/image-to-pdf",
      keywords: [
        "image to pdf",
        "jpg to pdf",
        "png to pdf",
        "convert images to pdf",
        "combine pictures into pdf",
      ],
    }),
  component: ImageToPdfPage,
});

function ImageToPdfPage() {
  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Image to PDF Converter",
          description: "Convert JPG, PNG, WEBP and AVIF images into high-quality PDF documents.",
          slug: "image-to-pdf",
          category: "utility",
        })}
      />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex items-center gap-3.5">
          <img
            src="/tools-logo.png"
            alt="Toolbox logo"
            className="h-10 w-10 rounded-xl border border-border/80 bg-card p-1 shadow-sm object-contain"
          />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Image to PDF</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Turn your photos, graphics, or scanned documents into clean, unified PDF files with custom
          margins and sizing.
        </p>

        <div className="mt-10">
          <ImageToPdfForm />
        </div>
      </div>
    </SiteLayout>
  );
}
