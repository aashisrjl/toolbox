import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { MergePdfForm } from "@/components/tools/MergePdfForm";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/merge-pdf")({
  head: () =>
    buildSeoMeta({
      title: "Merge PDF Files Online Free — Toolbox | Combine Multiple PDFs",
      description:
        "Easily merge multiple PDF files into one clean, organized document. Drag and drop to reorder pages and combine PDFs in seconds with zero data tracking.",
      path: "/merge-pdf",
      keywords: [
        "merge pdf",
        "combine pdf",
        "join pdf files",
        "merge pdf online free",
        "pdf binder",
      ],
    }),
  component: MergePdfPage,
});

function MergePdfPage() {
  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Merge PDF Files Online",
          description: "Combine multiple PDF documents into a single organized PDF file.",
          slug: "merge-pdf",
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Merge PDF</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Combine multiple PDF files into one clean document with custom ordering. Fast, secure, and
          right in your browser.
        </p>

        <div className="mt-10">
          <MergePdfForm />
        </div>
      </div>
    </SiteLayout>
  );
}
