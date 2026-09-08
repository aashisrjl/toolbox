import { useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { ProgressBar } from "@/components/ProgressBar";
import { useJob } from "@/hooks/useJob";
import { resolveDownloadUrl } from "@/services/api";
import { downloadMedia, type DownloadPlatform } from "@/services/download";

export interface UrlDownloaderFormProps {
  platform: DownloadPlatform;
  placeholder: string;
  actionLabel: string;
  runningLabel: string;
  helperText?: string;
  validate?: (url: string) => string | null;
}

export function UrlDownloaderForm({
  platform,
  placeholder,
  actionLabel,
  runningLabel,
  helperText,
  validate,
}: UrlDownloaderFormProps) {
  const [url, setUrl] = useState("");
  const [formatChoice, setFormatChoice] = useState<"video" | "audio">("video");
  const [submitting, setSubmitting] = useState(false);
  const { job, error, setError, isRunning, track, reset } = useJob();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      // Clipboard permissions denied or not supported
    }
  };

  const handleStart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError("Please enter a media URL.");
      return;
    }

    const invalid = validate?.(cleanUrl) ?? null;
    if (invalid) {
      setError(invalid);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const initialJob = await downloadMedia(platform, cleanUrl, { format: formatChoice });
      track(initialJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate download.");
    } finally {
      setSubmitting(false);
    }
  };

  const done = job?.status === "completed" && job.download_url;
  const downloadUrl = done ? resolveDownloadUrl(job.download_url!) : null;
  const isAudioResult =
    formatChoice === "audio" || (downloadUrl && /\.(mp3|wav|aac|ogg)(\?.*)?$/i.test(downloadUrl));

  return (
    <div className="space-y-6">
      <form onSubmit={handleStart} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Paste Media Link
          </label>
          <div className="relative flex items-center">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              disabled={isRunning || submitting}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 pr-20 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handlePaste}
              disabled={isRunning || submitting}
              className="absolute right-2 rounded-xl bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              Paste
            </button>
          </div>
          {helperText && <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Download As:
          </label>
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setFormatChoice("video")}
              disabled={isRunning || submitting}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                formatChoice === "video"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Video (MP4)
            </button>
            <button
              type="button"
              onClick={() => setFormatChoice("audio")}
              disabled={isRunning || submitting}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                formatChoice === "audio"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Audio (MP3)
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        {isRunning && <ProgressBar value={job?.progress ?? 20} label={runningLabel} />}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!url.trim() || submitting || isRunning}
            className="rounded-xl px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.02]"
            style={{ backgroundImage: "var(--gradient-accent)" }}
          >
            {submitting || isRunning ? `${runningLabel}…` : actionLabel}
          </button>

          {done && <DownloadButton href={downloadUrl!} label="Download Saved Media" />}

          {(url || job) && (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                reset();
              }}
              className="rounded-xl border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {done && downloadUrl && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
          <span className="mb-3 block text-xs font-medium text-muted-foreground">
            Downloaded Media Preview
          </span>
          {isAudioResult ? (
            <div className="mx-auto max-w-md space-y-4 py-2">
              <audio src={downloadUrl} controls className="w-full" />
              <p className="text-xs text-emerald-500 font-medium">
                Soundtrack extracted and ready!
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-lg">
              <video src={downloadUrl} controls className="mx-auto max-h-80 rounded-xl" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
