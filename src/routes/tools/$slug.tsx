import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { getTool } from "@/lib/tools";
import { RemoveImageBackground } from "@/components/tools/RemoveImageBackground";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return tool;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — ToolsHub` : "ToolsHub";
    const description = loaderData?.description ?? "Media tools on ToolsHub.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const tool = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← All tools
        </Link>
        <h1 className="mt-4 text-4xl font-bold">{tool.name}</h1>
        <p className="mt-3 text-muted-foreground">{tool.description}</p>

        <div className="mt-10">
          {tool.slug === "remove-image-bg" ? (
            <RemoveImageBackground endpoint={tool.endpoint} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="font-display font-semibold">This tool is on the way</p>
              <p className="mt-2 text-sm text-muted-foreground">
                It will use <code className="text-primary">POST /api/v1{tool.endpoint}</code> once
                the backend endpoint is live.
              </p>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
