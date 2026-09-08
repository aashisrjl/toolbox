import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ProgressBar } from "@/components/ProgressBar";
import { DownloadButton } from "@/components/DownloadButton";
import { useJob } from "@/hooks/useJob";
import { resolveDownloadUrl } from "@/services/api";
import { convertPdfToWord } from "@/services/pdf";

export function PdfToWordForm() {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { job, error, setError, isRunning, track, reset } = useJob();

  const handleStart = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const initialJob = await convertPdfToWord(file);
      track(initialJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert PDF to Word.");
    } finally {
      setSubmitting(false);
    }
  };

  const done = job?.status === "completed" && job.download_url;
  const downloadUrl = done ? resolveDownloadUrl(job.download_url!) : null;

  return (
    <div className="space-y-6">
      <FileUploader
        accept=".pdf,application/pdf"
        maxSizeMb={50}
        file={file}
        onSelect={(f) => {
          setFile(f);
          reset();
        }}
        onError={setError}
        hint="PDF document up to 50 MB"
      />

      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      {isRunning && (
        <ProgressBar value={job?.progress ?? 20} label="Converting PDF to Word (.docx)…" />
      )}

      {done && downloadUrl && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="font-display font-semibold text-foreground">Word Document (.docx) Ready</p>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">
            Editable text, layouts, and tables have been formatted.
          </p>
          <DownloadButton href={downloadUrl} label="Download Word Document (.docx)" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void handleStart()}
          disabled={!file || submitting || isRunning}
          className="rounded-xl px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.02]"
          style={{ backgroundImage: "var(--gradient-accent)" }}
        >
          {submitting || isRunning ? "Converting…" : "Convert to Word"}
        </button>

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
