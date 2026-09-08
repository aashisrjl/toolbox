import { useEffect, useMemo, useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ProgressBar } from "@/components/ProgressBar";
import { DownloadButton } from "@/components/DownloadButton";
import { ToolOptionField, type OptionField } from "@/components/tools/ToolOptionField";
import { useJob } from "@/hooks/useJob";
import { resolveDownloadUrl } from "@/services/api";
import type { Job } from "@/types/tool";

export interface VideoToolFormProps {
  fields?: OptionField[];
  defaults?: Record<string, string>;
  submit: (file: File, values: Record<string, string>) => Promise<Job>;
  actionLabel: string;
  runningLabel: string;
  maxSizeMb?: number;
  hint?: string;
  validate?: (values: Record<string, string>) => string | null;
}

export function VideoToolForm({
  fields = [],
  defaults = {},
  submit,
  actionLabel,
  runningLabel,
  maxSizeMb = 100,
  hint,
  validate,
}: VideoToolFormProps) {
  const initial = useMemo(() => ({ ...defaults }), [defaults]);
  const [values, setValues] = useState<Record<string, string>>(initial);
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
    const invalid = validate?.(values) ?? null;
    if (invalid) {
      setError(invalid);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      track(await submit(file, values));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the job.");
    } finally {
      setSubmitting(false);
    }
  };

  const done = job?.status === "completed" && job.download_url;
  const downloadUrl = done ? resolveDownloadUrl(job.download_url!) : null;
  const isAudioResult = downloadUrl && /\.(mp3|wav|aac|ogg)(\?.*)?$/i.test(downloadUrl);
  const isGifResult = downloadUrl && /\.gif(\?.*)?$/i.test(downloadUrl);

  return (
    <div className="space-y-6">
      <FileUploader
        accept="video/*"
        maxSizeMb={maxSizeMb}
        file={file}
        onSelect={(f) => {
          setFile(f);
          reset();
        }}
        onError={setError}
        hint={hint ?? `MP4, MOV, WEBM or AVI up to ${maxSizeMb} MB`}
      />

      {preview && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 text-center">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">
              Original Video
            </span>
            <video src={preview} controls className="mx-auto max-h-72 rounded-xl" />
          </div>

          {done && downloadUrl ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 text-center">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">
                Processed Result
              </span>
              {isAudioResult ? (
                <div className="flex h-56 flex-col items-center justify-center space-y-4">
                  <p className="text-sm font-semibold">Audio Ready</p>
                  <audio src={downloadUrl} controls className="w-full" />
                </div>
              ) : isGifResult ? (
                <img
                  src={downloadUrl}
                  alt="GIF output"
                  className="mx-auto max-h-72 rounded-xl object-contain"
                />
              ) : (
                <video src={downloadUrl} controls className="mx-auto max-h-72 rounded-xl" />
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
              {isRunning ? `${runningLabel}…` : "Result preview will appear here"}
            </div>
          )}
        </div>
      )}

      {fields.length > 0 && (
        <div className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
          {fields.map((field) => (
            <ToolOptionField
              key={field.name}
              field={field}
              value={values[field.name] ?? ""}
              onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      {isRunning && <ProgressBar value={job?.progress ?? 10} label={runningLabel} />}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void start()}
          disabled={!file || submitting || isRunning}
          className="rounded-xl px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.02]"
          style={{ backgroundImage: "var(--gradient-accent)" }}
        >
          {submitting || isRunning ? `${runningLabel}…` : actionLabel}
        </button>
        {done && <DownloadButton href={downloadUrl!} />}
        {(file || job) && (
          <button
            onClick={() => {
              setFile(null);
              setValues(initial);
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
