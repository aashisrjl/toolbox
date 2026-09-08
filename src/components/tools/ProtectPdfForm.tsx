import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ProgressBar } from "@/components/ProgressBar";
import { DownloadButton } from "@/components/DownloadButton";
import { useJob } from "@/hooks/useJob";
import { resolveDownloadUrl } from "@/services/api";
import { protectPdf } from "@/services/pdf";

export function ProtectPdfForm() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { job, error, setError, isRunning, track, reset } = useJob();

  const handleStart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!file) return;

    const cleanPwd = password.trim();
    if (!cleanPwd) {
      setError("Please choose a password to protect your PDF.");
      return;
    }

    if (cleanPwd !== confirmPassword.trim()) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const initialJob = await protectPdf(file, cleanPwd);
      track(initialJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to encrypt PDF.");
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

      {file && (
        <form
          onSubmit={handleStart}
          className="space-y-4 rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Set Document Password
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  disabled={isRunning || submitting}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Confirm Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  disabled={isRunning || submitting}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="show-pwd"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="show-pwd" className="text-xs text-muted-foreground cursor-pointer">
              Show password characters
            </label>
          </div>
        </form>
      )}

      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      {isRunning && (
        <ProgressBar value={job?.progress ?? 30} label="Encrypting PDF document with AES-256…" />
      )}

      {done && downloadUrl && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="font-display font-semibold text-foreground">Password Protected PDF Ready</p>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">
            This document requires your password to open and view.
          </p>
          <DownloadButton href={downloadUrl} label="Download Protected PDF" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void handleStart()}
          disabled={!file || !password || submitting || isRunning}
          className="rounded-xl px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.02]"
          style={{ backgroundImage: "var(--gradient-accent)" }}
        >
          {submitting || isRunning ? "Encrypting…" : "Protect PDF"}
        </button>

        {(file || job) && (
          <button
            onClick={() => {
              setFile(null);
              setPassword("");
              setConfirmPassword("");
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
