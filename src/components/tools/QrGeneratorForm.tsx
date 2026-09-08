import { useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { ProgressBar } from "@/components/ProgressBar";
import { useJob } from "@/hooks/useJob";
import { resolveDownloadUrl } from "@/services/api";
import { generateQrCode } from "@/services/qr";

export function QrGeneratorForm() {
  const [data, setData] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorCorrection, setErrorCorrection] = useState("m");
  const [scale, setScale] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const { job, error, setError, isRunning, track, reset } = useJob();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setData(text.trim());
    } catch {
      // Ignored
    }
  };

  const handleStart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanData = data.trim();
    if (!cleanData) {
      setError("Please enter a URL or text to generate your QR code.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const initialJob = await generateQrCode({
        data: cleanData,
        format: "png",
        scale,
        border: 4,
        foreground_color: fgColor,
        background_color: bgColor,
        error_correction: errorCorrection,
      });
      track(initialJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate QR code.");
    } finally {
      setSubmitting(false);
    }
  };

  const done = job?.status === "completed" && job.download_url;
  const downloadUrl = done ? resolveDownloadUrl(job.download_url!) : null;

  return (
    <div className="space-y-6">
      <form onSubmit={handleStart} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            URL or Text Content
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="https://yourwebsite.com or any text / Wi-Fi / phone number"
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
          <p className="mt-1.5 text-xs text-muted-foreground">
            Supports web URLs, plain text messages, contact info, or Wi-Fi credentials.
          </p>
        </div>

        <div className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 md:grid-cols-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Foreground Color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-9 w-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-mono uppercase"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Background Color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-9 w-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-mono uppercase"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Resolution
            </span>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value={8}>Standard (300px)</option>
              <option value={12}>High Definition (600px)</option>
              <option value={20}>Ultra-HD Print (1000px)</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Error Correction
            </span>
            <select
              value={errorCorrection}
              onChange={(e) => setErrorCorrection(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="l">Low (7% recovery)</option>
              <option value="m">Medium (15% - Balanced)</option>
              <option value="q">Quality (25% recovery)</option>
              <option value="h">High (30% recovery)</option>
            </select>
          </label>
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        {isRunning && <ProgressBar value={job?.progress ?? 30} label="Generating QR code…" />}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!data.trim() || submitting || isRunning}
            className="rounded-xl px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.02]"
            style={{ backgroundImage: "var(--gradient-accent)" }}
          >
            {submitting || isRunning ? "Generating…" : "Generate QR Code"}
          </button>

          {done && <DownloadButton href={downloadUrl!} label="Download QR Code PNG" />}

          {(data || job) && (
            <button
              type="button"
              onClick={() => {
                setData("");
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
            Generated QR Code
          </span>
          <div className="inline-block rounded-2xl border border-border bg-white p-4 shadow-sm">
            <img
              src={downloadUrl}
              alt="Generated QR Code"
              className="mx-auto max-h-72 max-w-full object-contain"
            />
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">
              Scan with your phone's camera to verify the link.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
