import { useState, useEffect } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ProgressBar } from "@/components/ProgressBar";
import { DownloadButton } from "@/components/DownloadButton";
import { useJob } from "@/hooks/useJob";
import { resolveDownloadUrl } from "@/services/api";
import { convertImageToPdf } from "@/services/pdf";

export function ImageToPdfForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("auto");
  const [margin, setMargin] = useState("10");
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

  const handleStart = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const initialJob = await convertImageToPdf(file, {
        page_size: pageSize,
        orientation: orientation,
        margin: margin,
      });
      track(initialJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert image to PDF.");
    } finally {
      setSubmitting(false);
    }
  };

  const done = job?.status === "completed" && job.download_url;
  const downloadUrl = done ? resolveDownloadUrl(job.download_url!) : null;

  return (
    <div className="space-y-6">
      <FileUploader
        accept="image/*"
        maxSizeMb={20}
        file={file}
        onSelect={(f) => {
          setFile(f);
          reset();
        }}
        onError={setError}
        hint="PNG, JPG, WEBP or AVIF up to 20 MB (Paste via Ctrl+V supported)"
      />

      {preview && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 text-center">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">
              Source Image
            </span>
            <img
              src={preview}
              alt="Source"
              className="mx-auto max-h-64 rounded-xl object-contain shadow-sm"
            />
          </div>

          {done && downloadUrl ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="font-display font-semibold text-foreground">PDF Document Ready</p>
              <p className="mt-1 text-xs text-muted-foreground mb-4">
                High resolution PDF generated successfully.
              </p>
              <DownloadButton href={downloadUrl!} label="Download PDF" />
            </div>
          ) : (
            <div className="hidden sm:flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
              {isRunning ? "Generating PDF document…" : "PDF preview will appear here"}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Page Size
          </span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            disabled={isRunning || submitting}
            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
          >
            <option value="a4">A4 (Standard Document)</option>
            <option value="letter">US Letter</option>
            <option value="fit">Fit to Image Aspect</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Page Orientation
          </span>
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            disabled={isRunning || submitting}
            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
          >
            <option value="auto">Auto (Match Image)</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Page Margins
          </span>
          <select
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            disabled={isRunning || submitting}
            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
          >
            <option value="0">No Margins (Edge-to-edge)</option>
            <option value="10">Small (10pt)</option>
            <option value="25">Standard (25pt)</option>
          </select>
        </label>
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      {isRunning && <ProgressBar value={job?.progress ?? 20} label="Creating PDF document…" />}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void handleStart()}
          disabled={!file || submitting || isRunning}
          className="rounded-xl px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.02]"
          style={{ backgroundImage: "var(--gradient-accent)" }}
        >
          {submitting || isRunning ? "Creating PDF…" : "Convert Image to PDF"}
        </button>

        {done && <DownloadButton href={downloadUrl!} label="Download PDF" />}

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
