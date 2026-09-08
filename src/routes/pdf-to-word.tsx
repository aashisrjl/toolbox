import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { PdfToWordForm } from "@/components/tools/PdfToWordForm";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/pdf-to-word")({
  head: () =>
    buildSeoMeta({
      title: "PDF to Word Converter Online Free — Toolbox | Editable DOCX",
      description:
        "Convert PDF documents into fully editable Microsoft Word (.docx) files. Fast, private conversion with layout and typography preserved.",
      path: "/pdf-to-word",
      keywords: [
        "pdf to word",
        "convert pdf to docx",
        "editable word from pdf",
        "pdf to doc",
        "free pdf converter",
      ],
    }),
  component: PdfToWordPage,
});

function PdfToWordPage() {
  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "PDF to Word Converter",
          description: "Convert PDF documents into editable Microsoft Word (.docx) documents.",
          slug: "pdf-to-word",
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">PDF to Word</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Turn static PDF files into fully editable Microsoft Word (.docx) documents with preserved
          layouts, text, and tables.
        </p>

        <div className="mt-10">
          <PdfToWordForm />
        </div>
      </div>
    </SiteLayout>
  );
}
