import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { buildSeoMeta, SITE_URL, CREATOR_NAME, CREATOR_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/about")({
  head: () =>
    buildSeoMeta({
      title: "About Us & Mission — Toolbox | Private Media & Document Utilities",
      description:
        "Learn about Toolbox: a fast, private, free suite of media and document utilities built by Aashis Rijal with zero ads, tracking, or mandatory logins.",
      path: "/about",
      keywords: [
        "about toolbox",
        "media utility platform",
        "aashis rijal developer",
        "private file converter mission",
      ],
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Toolbox",
          description:
            "A fast, private, free suite of media and document utilities built by Aashis Rijal.",
          url: `${SITE_URL}/about`,
          author: {
            "@type": "Person",
            name: CREATOR_NAME,
            url: CREATOR_URL,
          },
        }}
      />
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="flex items-center gap-3.5">
          <img
            src="/tools-logo.png"
            alt="Toolbox logo"
            className="h-11 w-11 rounded-xl border border-border/80 bg-card p-1 shadow-sm object-contain"
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About Toolbox</h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground">
          Toolbox is a modern, high-speed media and document utility suite built for developers,
          creators, and everyday computer users.
        </p>

        <div className="mt-12 space-y-12 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Our Philosophy</h2>
            <p>
              Most online file conversion and image editing tools are cluttered with spammy ads,
              artificial waiting timers, low-resolution limits, and mandatory email registrations.
            </p>
            <p>
              Toolbox was built to provide an honest, lightning-fast alternative: upload your file,
              let our optimized server processes handle the conversion or editing task in real time,
              and immediately download your clean output.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Built With Modern Standards</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">Privacy-First Architecture</h3>
                <p className="mt-2 text-xs">
                  Files are processed transiently in temporary workspace sandboxes and scrubbed
                  after job completion. No permanent storage, no tracking cookies, and no data
                  monetization.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">High-Performance Processing</h3>
                <p className="mt-2 text-xs">
                  Powered by a Python backend running FFmpeg, ONNX Runtime AI models, PyMuPDF,
                  headless LibreOffice, and Pillow, paired with a React & TanStack frontend.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Open Source & Creator</h2>
            <p>
              Toolbox is created and actively maintained by{" "}
              <a
                href="https://aashishrijal.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary"
              >
                Aashis Rijal
              </a>
              . The project is open-source and free to use.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="https://aashishrijal.com.np"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <span>Website (aashishrijal.com.np)</span>
                <span>↗</span>
              </a>
              <a
                href="https://github.com/aashisrjl/toolshub-aashis"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <span>View on GitHub</span>
                <span>↗</span>
              </a>
              <a
                href="mailto:aashisrijal252@gmail.com"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <span>Get in Touch</span>
                <span>→</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
