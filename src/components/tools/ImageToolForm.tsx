import { useEffect, useMemo, useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ProgressBar } from "@/components/ProgressBar";
import { DownloadButton } from "@/components/DownloadButton";
import { ToolOptionField, type OptionField } from "@/components/tools/ToolOptionField";
import { useJob } from "@/hooks/useJob";
import { resolveDownloadUrl } from "@/services/api";
import type { Job } from "@/types/tool";

export interface ImageToolFormProps {
  /** Fields rendered above the action button. */
  fields?: OptionField[];
  /** Initial values, keyed by field name. */
  defaults?: Record<string, string>;
  /** Submits the job to the backend. */
  submit: (file: File, values: Record<string, string>) => Promise<Job>;
  actionLabel: string;
  runningLabel: string;
  maxSizeMb?: number;
  hint?: string;
  /** Optional extra validation of the option values before submitting. */
  validate?: (values: Record<string, string>) => string | null;
}

export function ImageToolForm({
  fields = [],
  defaults = {},
  submit,
  actionLabel,
  runningLabel,
  maxSizeMb = 20,
  hint,
  validate,
}: ImageToolFormProps) {
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

  return (
    <div className="space-y-6">
      <FileUploader
        accept="image/*"
        maxSizeMb={maxSizeMb}
        file={file}
        onSelect={(f) => {
          setFile(f);
          reset();
        }}
        onError={setError}
        hint={hint ?? `PNG, JPG or WEBP up to ${maxSizeMb} MB`}
      />

      {preview && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
          <img src={preview} alt="Selected image preview" className="mx-auto max-h-72 rounded-xl" />
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
        {done && <DownloadButton href={resolveDownloadUrl(job.download_url!)} />}
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
