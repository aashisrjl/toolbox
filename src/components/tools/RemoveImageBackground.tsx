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
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
          <img src={preview} alt="Selected image preview" className="mx-auto max-h-72 rounded-xl" />
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
