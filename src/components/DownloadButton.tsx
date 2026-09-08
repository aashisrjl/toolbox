export function DownloadButton({ href, filename }: { href: string; filename?: string }) {
  return (
    <a
      href={href}
      download={filename}
      className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
      style={{ backgroundImage: "var(--gradient-accent)", boxShadow: "var(--shadow-glow)" }}
    >
      Download result
    </a>
  );
}
