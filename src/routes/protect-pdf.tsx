import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { ProtectPdfForm } from "@/components/tools/ProtectPdfForm";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/protect-pdf")({
  head: () =>
    buildSeoMeta({
      title: "Password Protect PDF Online — Toolbox | AES-256 PDF Encryption",
      description:
        "Encrypt and password-protect your confidential PDF documents with military-grade AES-256 encryption. Prevent unauthorized viewing and copying.",
      path: "/protect-pdf",
      keywords: [
        "protect pdf",
        "password protect pdf",
        "encrypt pdf",
        "secure pdf online",
        "pdf password locker",
      ],
    }),
  component: ProtectPdfPage,
});

function ProtectPdfPage() {
  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Password Protect PDF Online",
          description:
            "Encrypt and password-protect your PDF files with military-grade AES-256 encryption.",
          slug: "protect-pdf",
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Protect PDF</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Secure sensitive documents with AES-256 password protection. Unauthorized users cannot
          open or view your file without the password.
        </p>

        <div className="mt-10">
          <ProtectPdfForm />
        </div>
      </div>
    </SiteLayout>
  );
}
