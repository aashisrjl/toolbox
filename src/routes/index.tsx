import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS, CATEGORY_LABELS } from "@/lib/tools";
import type { ToolCategory } from "@/types/tool";

import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    buildSeoMeta({
      title: "Toolbox — Free Private Media & Document Tools",
      description:
        "Fast, open-source media utilities: remove backgrounds, make photo collages, convert, merge, compress, and trim images, videos, audio, and PDFs in your browser with zero accounts.",
      path: "/",
      keywords: [
        "media converter",
        "pdf tools online",
        "remove image background",
        "photo collage maker",
        "youtube downloader",
        "audio extractor",
      ],
    }),
  component: Home,
});

const CATEGORY_TABS: { key: "all" | ToolCategory; label: string }[] = [
  { key: "all", label: "All Utilities" },
  { key: "image", label: "Image" },
  { key: "video", label: "Video" },
  { key: "utility", label: "PDF & Docs" },
  { key: "audio", label: "Audio" },
  { key: "download", label: "Downloaders" },
];

function Home() {
  const [activeTab, setActiveTab] = useState<"all" | ToolCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory = activeTab === "all" || tool.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <SiteLayout>
      {/* Hero Section with Mesh Grid and Radial Light */}
      <section className="relative border-b border-border/70 bg-grid-mesh px-5 py-24 sm:py-32 overflow-hidden">
        {/* Radial top glow */}
        <div className="pointer-events-none absolute inset-0 bg-radial-beam" />
        <div className="pointer-events-none absolute left-1/2 -top-40 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-primary/10 blur-[100px] animate-gentle-pulse" />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Logo Brand Header */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/25 bg-card/80 p-2.5 shadow-xl shadow-primary/5 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary/40">
            <img
              src="/tools-logo.png"
              alt="Toolbox logo"
              className="h-full w-full rounded-xl object-contain drop-shadow"
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Open Source & Private Media Suite</span>
            <span className="text-primary/60">•</span>
            <span className="font-mono text-[11px] text-foreground/80">
              {TOOLS.length} Live Tools
            </span>
          </div>

          {/* Main Title */}
          <h1 className="mt-7 font-display text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.1] text-foreground">
            Fast, private tools for every{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              media & document
            </span>{" "}
            task.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            Cut out backgrounds, merge PDFs, convert formats, shrink files, and trim videos.
            Processed in memory and wiped immediately. Zero tracking, no subscriptions.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-10 mx-auto max-w-xl">
            <div className="relative flex items-center rounded-2xl border border-border/80 bg-card/90 p-2 shadow-2xl backdrop-blur-xl focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="flex items-center pl-3 text-muted-foreground">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g., 'remove background', 'pdf', 'mp4', 'compress')..."
                className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground mr-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>100% In-Memory Cleanup</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>No Accounts or Paywalls</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Direct Fast URLs</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Drag, Drop & Paste (Ctrl+V)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="mx-auto max-w-6xl px-5 py-16">
        {/* Category Tabs */}
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4 border-b border-border/70 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_TABS.map((tab) => {
              const count =
                tab.key === "all"
                  ? TOOLS.length
                  : TOOLS.filter((t) => t.category === tab.key).length;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-foreground text-background shadow-md"
                      : "bg-card/70 text-muted-foreground hover:bg-card hover:text-foreground border border-border/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-xs text-muted-foreground font-mono">
            Showing {filteredTools.length} of {TOOLS.length} tools
          </span>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="font-display text-base font-semibold text-foreground">No tools found</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              No utilities match your search query "{searchQuery}". Try searching for another
              keyword or browse by category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
              className="mt-5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
