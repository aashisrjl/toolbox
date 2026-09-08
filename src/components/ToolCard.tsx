import { Link } from "@tanstack/react-router";
import type { Tool } from "@/types/tool";

interface ToolVisual {
  badge: string;
  iconBg: string;
  iconColor: string;
  icon: JSX.Element;
}

const TOOL_VISUALS: Record<string, ToolVisual> = {
  "remove-image-bg": {
    badge: "AI Matting",
    iconBg: "from-teal-500/20 to-emerald-500/10",
    iconColor: "text-emerald-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        />
      </svg>
    ),
  },
  "compress-image": {
    badge: "Optimization",
    iconBg: "from-cyan-500/20 to-blue-500/10",
    iconColor: "text-cyan-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    ),
  },
  "convert-image": {
    badge: "Format Swap",
    iconBg: "from-blue-500/20 to-indigo-500/10",
    iconColor: "text-blue-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
  },
  "resize-image": {
    badge: "Dimensions",
    iconBg: "from-indigo-500/20 to-violet-500/10",
    iconColor: "text-indigo-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
        />
      </svg>
    ),
  },
  "image-collage": {
    badge: "2–4 Photos",
    iconBg: "from-pink-500/20 to-rose-500/10",
    iconColor: "text-pink-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4 5a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h6a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z"
        />
      </svg>
    ),
  },
  "image-college": {
    badge: "2–4 Photos",
    iconBg: "from-pink-500/20 to-rose-500/10",
    iconColor: "text-pink-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4 5a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h6a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z"
        />
      </svg>
    ),
  },
  "remove-video-bg": {
    badge: "Neural Matting",
    iconBg: "from-purple-500/20 to-pink-500/10",
    iconColor: "text-purple-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  "convert-video": {
    badge: "Transcoding",
    iconBg: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
        />
      </svg>
    ),
  },
  "trim-video": {
    badge: "Precision Cut",
    iconBg: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242 3 3 0 014.242 0L12 12zm0 0l-2.879-2.879a3 3 0 10-4.242 4.242 3 3 0 004.242 0L12 12z"
        />
      </svg>
    ),
  },
  "extract-audio": {
    badge: "Demuxer",
    iconBg: "from-amber-500/20 to-yellow-500/10",
    iconColor: "text-amber-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    ),
  },
  "convert-audio": {
    badge: "Bitrate Control",
    iconBg: "from-yellow-500/20 to-orange-500/10",
    iconColor: "text-yellow-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
      </svg>
    ),
  },
  "image-to-pdf": {
    badge: "Multi-Image",
    iconBg: "from-red-500/20 to-rose-500/10",
    iconColor: "text-red-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  "merge-pdf": {
    badge: "Combine Files",
    iconBg: "from-sky-500/20 to-blue-500/10",
    iconColor: "text-sky-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  "pdf-to-word": {
    badge: "Editable DOCX",
    iconBg: "from-blue-500/20 to-indigo-500/10",
    iconColor: "text-blue-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  "word-to-pdf": {
    badge: "Print Ready",
    iconBg: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
    ),
  },
  "protect-pdf": {
    badge: "AES-256",
    iconBg: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  "qr-code-generator": {
    badge: "Custom Colors",
    iconBg: "from-fuchsia-500/20 to-purple-500/10",
    iconColor: "text-fuchsia-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
        />
      </svg>
    ),
  },
  "download-youtube-videos": {
    badge: "4K / MP3",
    iconBg: "from-red-600/20 to-rose-600/10",
    iconColor: "text-red-500",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  youtube: {
    badge: "4K / MP3",
    iconBg: "from-red-600/20 to-rose-600/10",
    iconColor: "text-red-500",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  "download-instagram-videos": {
    badge: "Reels & Posts",
    iconBg: "from-pink-600/20 to-purple-600/10",
    iconColor: "text-pink-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={1.8} />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth={1.8} />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    ),
  },
  instagram: {
    badge: "Reels & Posts",
    iconBg: "from-pink-600/20 to-purple-600/10",
    iconColor: "text-pink-400",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={1.8} />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth={1.8} />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    ),
  },
  "download-tiktok-videos": {
    badge: "No Watermark",
    iconBg: "from-cyan-500/20 to-pink-500/10",
    iconColor: "text-cyan-400",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.83c0 1.9-.66 3.82-1.99 5.23-1.62 1.74-4.04 2.66-6.42 2.37-2.73-.31-5.14-2.17-6.14-4.73-.89-2.27-.67-4.94.61-7.01 1.34-2.18 3.82-3.52 6.38-3.41.05.94.04 1.88.04 2.82-1.53.02-3.09.68-4.01 1.88-1.08 1.4-.98 3.49.25 4.77.98 1.04 2.5 1.54 3.91 1.31 1.28-.2 2.4-1.12 2.82-2.34.18-.54.27-1.12.26-1.7V.02z" />
      </svg>
    ),
  },
  tiktok: {
    badge: "No Watermark",
    iconBg: "from-cyan-500/20 to-pink-500/10",
    iconColor: "text-cyan-400",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.83c0 1.9-.66 3.82-1.99 5.23-1.62 1.74-4.04 2.66-6.42 2.37-2.73-.31-5.14-2.17-6.14-4.73-.89-2.27-.67-4.94.61-7.01 1.34-2.18 3.82-3.52 6.38-3.41.05.94.04 1.88.04 2.82-1.53.02-3.09.68-4.01 1.88-1.08 1.4-.98 3.49.25 4.77.98 1.04 2.5 1.54 3.91 1.31 1.28-.2 2.4-1.12 2.82-2.34.18-.54.27-1.12.26-1.7V.02z" />
      </svg>
    ),
  },
  "download-facebook-reels": {
    badge: "Reels & Video",
    iconBg: "from-blue-600/20 to-indigo-600/10",
    iconColor: "text-blue-500",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
};

const DEFAULT_VISUAL: ToolVisual = {
  badge: "Fast Utility",
  iconBg: "from-primary/20 to-primary/5",
  iconColor: "text-primary",
  icon: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
};

export function ToolCard({ tool }: { tool: Tool }) {
  const visual = TOOL_VISUALS[tool.slug] || DEFAULT_VISUAL;

  return (
    <Link
      to={`/${tool.slug}` as string as never}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]"
    >
      {/* Top subtle glow blob */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-40" />

      <div>
        {/* Header: Icon + Category Badge */}
        <div className="mb-4 flex items-center justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${visual.iconBg} ${visual.iconColor} border border-white/5 transition-transform duration-300 group-hover:scale-105`}
          >
            {visual.icon}
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border/80 bg-background/80 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {visual.badge}
            </span>
            {tool.status === "soon" && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-amber-400">
                Soon
              </span>
            )}
          </div>
        </div>

        {/* Title and description */}
        <h3 className="font-display text-base font-semibold text-foreground transition-colors group-hover:text-primary">
          {tool.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {tool.description}
        </p>
      </div>

      {/* Footer launch button */}
      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
        <span className="font-mono text-[10px] text-muted-foreground/80 uppercase">
          {tool.category}
        </span>
        <div className="flex items-center gap-1 font-medium text-foreground/80 transition-colors group-hover:text-primary">
          <span>Open</span>
          <svg
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
