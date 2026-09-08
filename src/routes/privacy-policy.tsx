import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    buildSeoMeta({
      title: "Privacy Policy — Toolbox | Zero File Storage & Zero Tracking",
      description:
        "Read the official Privacy Policy for Toolbox. We respect your privacy: no mandatory registration, no persistent file storage, and no tracking cookies.",
      path: "/privacy-policy",
      keywords: [
        "privacy policy",
        "toolbox privacy",
        "private file processing",
        "no logs media tool",
      ],
    }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex items-center gap-3.5">
          <img
            src="/tools-logo.png"
            alt="Toolbox logo"
            className="h-11 w-11 rounded-xl border border-border/80 bg-card p-1 shadow-sm object-contain"
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: September 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Our Core Commitment</h2>
            <p>
              At Toolbox, your privacy is our highest priority. We do not require accounts, we do
              not track your online activity across other sites, and we do not monetize your
              personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. File Handling & Retention</h2>
            <p>When you upload images, videos, audio tracks, or documents to Toolbox:</p>
            <ul className="list-disc space-y-1.5 pl-5 text-xs">
              <li>
                Your files are stored in isolated, temporary job folders exclusively for the purpose
                of executing your requested operation (e.g. background removal, conversion, or
                compression).
              </li>
              <li>
                We do not inspect, catalog, train AI models on, or share your uploaded media or
                processed outputs.
              </li>
              <li>
                Temporary processing files are automatically deleted after download or within a
                short expiration window.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              3. No Account or Personal Data
            </h2>
            <p>
              Toolbox does not require usernames, passwords, credit cards, or email addresses to use
              any of our services. You can use all tools freely and anonymously.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Cookies & Analytics</h2>
            <p>
              We do not use invasive third-party tracking cookies or advertising pixels. Any local
              storage used by your browser is strictly functional (such as remembering your theme or
              session preferences).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Contact Information</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please contact us
              directly at{" "}
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
