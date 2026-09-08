import { useEffect, useRef, useState, useCallback } from "react";

interface FileUploaderProps {
  accept: string;
  maxSizeMb: number;
  file: File | null;
  onSelect: (file: File | null) => void;
  onError: (message: string) => void;
  hint?: string;
}

export function FileUploader({
  accept,
  maxSizeMb,
  file,
  onSelect,
  onError,
  hint,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accepted = accept.split(",").map((a) => a.trim().toLowerCase());

  const validate = useCallback(
    (candidate: File) => {
      const candidateType = (candidate.type || "").toLowerCase();
      const filename = candidate.name.toLowerCase();

      const typeOk = accepted.some((a) => {
        if (a.endsWith("/*")) {
          const category = a.slice(0, -2);
          if (candidateType.startsWith(`${category}/`)) return true;
          if (category === "image") {
            return /\.(png|jpe?g|webp|avif|gif|bmp|tiff|heic|heif)$/i.test(filename);
          }
          if (category === "video") {
            return /\.(mp4|webm|mov|mkv|avi|m4v|flv|wmv)$/i.test(filename);
          }
          if (category === "audio") {
            return /\.(mp3|wav|flac|aac|ogg|m4a|wma|opus)$/i.test(filename);
          }
        }
        return candidateType === a || filename.endsWith(a);
      });

      if (!typeOk) {
        onError(`Unsupported file type. Accepted format(s): ${accept}`);
        return;
      }

      if (candidate.size > maxSizeMb * 1024 * 1024) {
        onError(`File exceeds maximum size of ${maxSizeMb} MB.`);
        return;
      }

      onSelect(candidate);
    },
    [accept, accepted, maxSizeMb, onSelect, onError],
  );

  const extractPastedFile = useCallback((dataTransfer: DataTransfer | null): File | null => {
    if (!dataTransfer) return null;

    if (dataTransfer.files && dataTransfer.files.length > 0) {
      return dataTransfer.files[0];
    }

    if (dataTransfer.items && dataTransfer.items.length > 0) {
      for (const item of Array.from(dataTransfer.items)) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f) {
            if (!f.name || f.name === "image.png") {
              const ext = f.type.split("/")[1] || "png";
              return new File([f], `pasted_${Date.now()}.${ext}`, { type: f.type });
            }
            return f;
          }
        }
      }
    }

    return null;
  }, []);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const pasted = extractPastedFile(e.clipboardData);
      if (pasted) {
        e.preventDefault();
        validate(pasted);
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [extractPastedFile, validate]);

  const handleManualClipboardPaste = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!navigator.clipboard?.read) {
        onError("Press Ctrl+V (or Cmd+V) to paste directly from your clipboard.");
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (
            type.startsWith("image/") ||
            type.startsWith("video/") ||
            type.startsWith("audio/") ||
            type === "application/pdf"
          ) {
            const blob = await item.getType(type);
            const ext = type.split("/")[1]?.replace("jpeg", "jpg") || "bin";
            const candidate = new File([blob], `pasted_${Date.now()}.${ext}`, { type });
            validate(candidate);
            return;
          }
        }
      }
      onError("No copied media found in clipboard.");
    } catch {
      onError("Clipboard access denied. You can press Ctrl+V or Cmd+V to paste.");
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) validate(dropped);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={`group relative overflow-hidden rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer ${
        dragging
          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(20,184,166,0.2)] scale-[1.01]"
          : "border-border/70 bg-card/50 hover:border-primary/50 hover:bg-card/80 hover:shadow-xl"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) validate(picked);
          e.target.value = "";
        }}
      />

      {file ? (
        <div className="flex flex-col items-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="font-display text-base font-semibold text-foreground truncate max-w-md mx-auto">
              {file.name}
            </p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-primary font-medium hover:underline">
                Click to change file
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/20 transition-transform duration-300 group-hover:scale-110 shadow-sm">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="font-display text-base font-semibold text-foreground">
              Drop your file here, or browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{hint ?? `Up to ${maxSizeMb} MB`}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleManualClipboardPaste}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/90 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted"
            >
              <svg
                className="h-3.5 w-3.5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>Paste from clipboard</span>
            </button>

            <span className="hidden sm:inline text-xs text-muted-foreground">
              or press{" "}
              <kbd className="rounded-md border border-border/80 bg-muted/80 px-2 py-0.5 font-mono text-[11px] text-foreground shadow-sm">
                Ctrl + V
              </kbd>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
