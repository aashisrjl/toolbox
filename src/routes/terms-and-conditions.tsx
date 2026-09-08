import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () =>
    buildSeoMeta({
      title: "Terms and Conditions — Toolbox",
      description:
        "Review the Terms and Conditions for using the Toolbox media and document utility platform.",
      path: "/terms-and-conditions",
      keywords: [
        "terms and conditions",
        "terms of service",
        "toolbox terms",
        "acceptable use policy",
      ],
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex items-center gap-3.5">
          <img
            src="/tools-logo.png"
            alt="Toolbox logo"
            className="h-11 w-11 rounded-xl border border-border/80 bg-card p-1 shadow-sm object-contain"
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms & Conditions</h1>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: September 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Agreement to Terms</h2>
            <p>
              By accessing or using Toolbox, you agree to comply with and be bound by these Terms
              and Conditions. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Permitted & Acceptable Use</h2>
            <p>
              Toolbox is provided for lawful personal and commercial utility. When using our
              services, you agree that:
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-xs">
              <li>You will only upload files and media that you have legal rights to process.</li>
              <li>
                You will not use the service to process, generate, or distribute malicious software,
                illegal materials, or copyright-infringing content.
              </li>
              <li>
                You will not attempt to disrupt or abuse the platform through automated denial of
                service attacks or scraping beyond reasonable API consumption.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              3. Disclaimer of Warranties & Availability
            </h2>
            <p>
              Toolbox is provided on an "as is" and "as available" basis without any express or
              implied warranties. While we strive for maximum accuracy, uptime, and processing
              quality, we do not guarantee uninterrupted availability or error-free conversions for
              every file format.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Limitation of Liability</h2>
            <p>
              Under no circumstances shall Toolbox or its creators be liable for any direct,
              indirect, incidental, or consequential damages resulting from your use of or inability
              to use the service, including data corruption or loss of media files.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              5. Open Source & Modifications
            </h2>
            <p>
              Toolbox source code is available on{" "}
              <a
                href="https://github.com/aashisrjl/toolshub-aashis"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                GitHub
              </a>
              . We reserve the right to update or modify these Terms at any time without prior
              notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
            <p>
              For legal or administrative inquiries, reach out to{" "}
              <a href="mailto:aashisrijal252@gmail.com" className="text-primary hover:underline">
                aashisrijal252@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
