import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS, CATEGORY_LABELS } from "@/lib/tools";
import type { ToolCategory } from "@/types/tool";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ToolsHub — Free Media Tools for Image, Video & Audio" },
      {
        name: "description",
        content:
          "ToolsHub is a fast media utility platform: remove backgrounds, compress, convert and trim image, video and audio files in your browser.",
      },
      { property: "og:title", content: "ToolsHub — Free Media Tools" },
      {
        property: "og:description",
        content:
          "Remove backgrounds, compress, convert and trim image, video and audio files in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ORDER: ToolCategory[] = ["image", "video", "audio", "download"];

function Home() {
  return (
    <SiteLayout>
      <section
        className="border-b border-border/70 px-5 py-24"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary">
            {TOOLS.length} tools and counting
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] sm:text-6xl">
            One hub for every media chore.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            Cut out backgrounds, shrink files, convert formats and trim clips. Upload, wait a
            moment, download. No accounts, no clutter.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/tools/$slug"
              params={{ slug: "remove-image-bg" }}
              className="rounded-xl px-6 py-3 font-display text-sm font-semibold text-primary-foreground"
              style={{
                backgroundImage: "var(--gradient-accent)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              Remove an image background
            </Link>
            <a
              href="#tools"
              className="rounded-xl border border-border px-6 py-3 font-display text-sm font-semibold transition-colors hover:border-primary/50"
            >
              Browse all tools
            </a>
          </div>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-6xl px-5 py-20">
        {ORDER.map((category) => {
          const tools = TOOLS.filter((t) => t.category === category);
          if (!tools.length) return null;
          return (
            <div key={category} className="mb-14 last:mb-0">
              <h2 className="mb-5 text-xl font-semibold">{CATEGORY_LABELS[category]}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </SiteLayout>
  );
}
