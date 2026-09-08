import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import logo from "/tools-logo.png";
import { TOOLS } from "@/lib/tools";
import type { ToolCategory } from "@/types/tool";

interface NavCategory {
  key: ToolCategory;
  label: string;
}

const CATEGORIES: NavCategory[] = [
  { key: "image", label: "Image" },
  { key: "video", label: "Video" },
  { key: "audio", label: "Audio" },
  { key: "utility", label: "PDF & Docs" },
  { key: "download", label: "Downloaders" },
];

export function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDropdown = (categoryKey: string) => {
    setOpenDropdown((prev) => (prev === categoryKey ? null : categoryKey));
  };

  const closeAll = () => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div ref={navRef} className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        {/* Logo and Brand */}
        <Link to="/" onClick={closeAll} className="flex items-center gap-2.5">
          <img src={logo} alt="tools-logo" height={40} width={40} className="rounded-lg" />
          <span className="font-display text-lg font-bold tracking-tight">Toolbox</span>
        </Link>

        {/* Desktop Navigation with Dropdowns */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {CATEGORIES.map((cat) => {
            const catTools = TOOLS.filter((t) => t.category === cat.key);
            const isOpen = openDropdown === cat.key;

            return (
              <div key={cat.key} className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown(cat.key)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isOpen
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                  aria-expanded={isOpen}
                >
                  <span>{cat.label}</span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground/70"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95">
                    <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                      {cat.label} Tools
                    </div>
                    <div className="mt-1 space-y-1">
                      {catTools.map((tool) => (
                        <Link
                          key={tool.slug}
                          to={`/${tool.slug}` as string as never}
                          onClick={closeAll}
                          className="group flex flex-col rounded-xl px-3 py-2 transition-colors hover:bg-muted"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                              {tool.name}
                            </span>
                            {tool.status === "soon" && (
                              <span className="rounded-full border border-border px-1.5 py-0.2 text-[9px] uppercase tracking-wider text-muted-foreground">
                                Soon
                              </span>
                            )}
                          </div>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {tool.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center text-sm">
          <a
            href="/#tools"
            onClick={closeAll}
            className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            All tools
          </a>
        </div>

        {/* Mobile menu hamburger toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/70 bg-background/95 px-5 py-4 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const catTools = TOOLS.filter((t) => t.category === cat.key);
              return (
                <div key={cat.key} className="space-y-1.5">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-primary">
                    {cat.label}
                  </span>
                  <div className="grid gap-1 pl-1">
                    {catTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        to={`/${tool.slug}` as string as never}
                        onClick={closeAll}
                        className="flex items-center justify-between rounded-xl px-2.5 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        <span>{tool.name}</span>
                        <span className="text-xs text-muted-foreground">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-border/60">
              <a
                href="/#tools"
                onClick={closeAll}
                className="block text-center rounded-xl border border-primary/30 bg-primary/10 py-2 text-xs font-medium text-primary"
              >
                All tools
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
