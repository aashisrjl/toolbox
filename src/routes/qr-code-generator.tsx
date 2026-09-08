import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { QrGeneratorForm } from "@/components/tools/QrGeneratorForm";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/qr-code-generator")({
  head: () =>
    buildSeoMeta({
      title: "Free Custom QR Code Generator — Toolbox | High-Res PNG & SVG",
      description:
        "Generate custom high-resolution QR codes for websites, WiFi, and contact cards with custom colors, sizing, and error correction levels.",
      path: "/qr-code-generator",
      keywords: [
        "qr code generator",
        "create qr code free",
        "custom qr code",
        "high res qr code",
        "qr maker",
      ],
    }),
  component: QrGeneratorPage,
});

function QrGeneratorPage() {
  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Free Custom QR Code Generator",
          description:
            "Generate custom high-resolution QR codes with custom colors and error correction.",
          slug: "qr-code-generator",
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">QR Code Generator</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Create clean, scannable QR codes for your website, Wi-Fi network, vCard, or text message
          with custom colors and resolutions.
        </p>

        <div className="mt-10">
          <QrGeneratorForm />
        </div>
      </div>
    </SiteLayout>
  );
}
