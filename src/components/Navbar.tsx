import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
            T
          </span>
          <span className="font-display text-lg font-bold tracking-tight">ToolsHub</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/#tools" className="transition-colors hover:text-foreground">
            All tools
          </a>
          <Link
            to="/tools/$slug"
            params={{ slug: "remove-image-bg" }}
            className="rounded-full border border-primary/40 px-4 py-1.5 font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Remove background
          </Link>
        </div>
      </nav>
    </header>
  );
}
