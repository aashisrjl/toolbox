import { useEffect, useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ProgressBar } from "@/components/ProgressBar";
import { DownloadButton } from "@/components/DownloadButton";
import { useJob } from "@/hooks/useJob";
import { resolveDownloadUrl, submitFileJob } from "@/services/api";

const MAX_MB = 20;

export function RemoveImageBackground({ endpoint }: { endpoint: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { job, error, setError, isRunning, track, reset } = useJob();

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const start = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await submitFileJob(endpoint, file, { format: "png" });
      track(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the job.");
    } finally {
      setSubmitting(false);
    }
  };

  const done = job?.status === "completed" && job.download_url;

  return (
    <div className="space-y-6">
      <FileUploader
        accept="image/*"
        maxSizeMb={MAX_MB}
        file={file}
        onSelect={(f) => {
          setFile(f);
          reset();
        }}
        onError={setError}
        hint={`PNG, JPG or WEBP up to ${MAX_MB} MB`}
      />

      {preview && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 text-center">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">Original</span>
            <img
              src={preview}
              alt="Original input"
              className="mx-auto max-h-72 rounded-xl object-contain"
            />
          </div>

          {done && job.download_url ? (
            <div
              className="overflow-hidden rounded-2xl border border-border p-4 text-center"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(rgba(128, 128, 128, 0.15) 0% 25%, transparent 0% 50%)",
                backgroundSize: "16px 16px",
              }}
            >
              <span className="mb-2 block text-xs font-medium text-muted-foreground">
                Transparent Result
              </span>
              <img
                src={resolveDownloadUrl(job.download_url)}
                alt="Background removed result"
                className="mx-auto max-h-72 rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="hidden sm:flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
              {isRunning ? "Removing background…" : "Result preview will appear here"}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      {isRunning && <ProgressBar value={job?.progress ?? 10} label="Removing background" />}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void start()}
          disabled={!file || submitting || isRunning}
          className="rounded-xl px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.02]"
          style={{ backgroundImage: "var(--gradient-accent)" }}
        >
          {submitting || isRunning ? "Working…" : "Remove background"}
        </button>
        {done && <DownloadButton href={resolveDownloadUrl(job.download_url!)} />}
        {(file || job) && (
          <button
            onClick={() => {
              setFile(null);
              reset();
            }}
            className="rounded-xl border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
