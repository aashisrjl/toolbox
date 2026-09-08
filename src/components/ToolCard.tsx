import { Link } from "@tanstack/react-router";
import type { Tool } from "@/types/tool";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
      style={{ boxShadow: "var(--shadow-panel)" }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold leading-snug">{tool.name}</h3>
        {tool.status === "soon" && (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Soon
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{tool.description}</p>
      <span className="mt-4 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Open tool →
      </span>
    </Link>
  );
}
