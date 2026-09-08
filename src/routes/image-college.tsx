import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { ImageCollageForm } from "@/components/tools/ImageCollageForm";
import { buildSeoMeta, buildWebApplicationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/image-college")({
  head: () =>
    buildSeoMeta({
      title: "Photo Collage Maker (2, 3, 4 Photos) — Toolbox",
      description: "Create beautiful multi-photo collages with strictly 2, 3, or 4 pictures.",
      path: "/image-college",
      canonicalPath: "/image-collage",
    }),
  component: ImageCollegeAliasPage,
});

function ImageCollegeAliasPage() {
  return (
    <SiteLayout>
      <JsonLd
        data={buildWebApplicationSchema({
          name: "Photo Collage Maker (2, 3, 4 Photos)",
          description:
            "Combine 2, 3, or 4 photos into stylish grid and magazine-style collages directly in your browser with real-time live preview.",
          slug: "image-collage",
          category: "image",
        })}
      />
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="flex items-center gap-3.5">
          <img
            src="/tools-logo.png"
            alt="Toolbox logo"
            className="h-10 w-10 rounded-xl border border-border/80 bg-card p-1 shadow-sm object-contain"
          />
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Image Collage Maker</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Strictly 2, 3, or 4 Photos
              </span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-muted-foreground">
          Arrange your photos into clean, high-resolution compositions. Pick 2, 3, or 4 photos,
          choose from multi-tile layout blueprints, and download your finished collage.
        </p>

        <div className="mt-10">
          <ImageCollageForm />
        </div>
      </div>
    </SiteLayout>
  );
}
