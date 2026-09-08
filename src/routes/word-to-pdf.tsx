import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { WordToPdfForm } from "@/components/tools/WordToPdfForm";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/word-to-pdf")({
  head: () =>
    buildSeoMeta({
      title: "Word to PDF Converter Online Free — Toolbox | DOCX to PDF",
      description:
        "Convert DOCX and DOC documents into crisp, secure PDF files in seconds. Headless server conversion keeps your formatting, fonts, and tables identical.",
      path: "/word-to-pdf",
      keywords: [
        "word to pdf",
        "docx to pdf",
        "doc to pdf",
        "convert word to pdf online",
        "free docx converter",
      ],
    }),
  component: WordToPdfPage,
});

function WordToPdfPage() {
  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Word to PDF Converter",
          description:
            "Convert Microsoft Word documents (.docx, .doc) into high-quality PDF files.",
          slug: "word-to-pdf",
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Word to PDF</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Convert Microsoft Word files (.docx and .doc) into clean, universal, print-ready PDF
          documents.
        </p>

        <div className="mt-10">
          <WordToPdfForm />
        </div>
      </div>
    </SiteLayout>
  );
}
