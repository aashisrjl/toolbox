import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/70 px-5 py-8">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          ToolsHub — media utilities. Files are processed on request and cleaned up afterwards.
        </p>
      </footer>
    </div>
  );
}
