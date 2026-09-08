import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { buildSeoMeta, SITE_URL, CREATOR_NAME, CREATOR_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/contact")({
  head: () =>
    buildSeoMeta({
      title: "Contact Us & Developer Support — Toolbox",
      description:
        "Have questions, feature suggestions, or feedback for Toolbox? Contact Aashis Rijal via direct email, GitHub, or portfolio website.",
      path: "/contact",
      keywords: ["contact toolbox", "developer email", "github support", "aashis rijal contact"],
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Toolbox",
          description: "Get in touch with the Toolbox developer.",
          url: `${SITE_URL}/contact`,
          author: {
            "@type": "Person",
            name: CREATOR_NAME,
            url: CREATOR_URL,
          },
        }}
      />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex items-center gap-3.5">
          <img
            src="/tools-logo.png"
            alt="Toolbox logo"
            className="h-11 w-11 rounded-xl border border-border/80 bg-card p-1 shadow-sm object-contain"
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact Us</h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground">
          Have questions, bug reports, feature suggestions, or want to say hi? We would love to hear
          from you.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {/* Email Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Direct Email</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Drop an email directly to the developer for inquiries or support.
              </p>
            </div>
            <div className="mt-6">
              <a
                href="mailto:aashisrijal252@gmail.com"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                style={{ backgroundImage: "var(--gradient-accent)" }}
              >
                <span>Email Aashis</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Website Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Personal Portfolio</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Explore developer portfolio, other projects, blogs, and background.
              </p>
            </div>
            <div className="mt-6">
              <a
                href="https://aashishrijal.com.np"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <span>aashishrijal.com.np</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* GitHub Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-foreground">GitHub Issues & Code</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Contribute code, request features, or report reproducible bugs on GitHub.
              </p>
            </div>
            <div className="mt-6">
              <a
                href="https://github.com/aashisrjl/toolshub-aashis"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <span>GitHub Repository</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* FAQ or quick note */}
        <div className="mt-12 rounded-2xl border border-border/80 bg-card/60 p-6">
          <h3 className="font-semibold text-foreground">Frequently Asked Inquiries</h3>
          <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Do you store our files?</strong> No. All media
              files uploaded to Toolbox are automatically purged from our servers once the job is
              complete and downloaded.
            </p>
            <p>
              <strong className="text-foreground">Can I request a new tool?</strong> Absolutely!
              Send an email to{" "}
              <a href="mailto:aashisrijal252@gmail.com" className="text-primary hover:underline">
                aashisrijal252@gmail.com
              </a>{" "}
              or open an issue on GitHub.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
