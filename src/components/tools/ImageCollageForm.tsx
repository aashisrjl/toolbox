import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { DownloadButton } from "@/components/DownloadButton";
import { useJob } from "@/hooks/useJob";
import { resolveDownloadUrl } from "@/services/api";
import { createImageCollage } from "@/services/image";

type PhotoCount = 2 | 3 | 4;

interface LayoutOption {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
}

const LAYOUTS_BY_COUNT: Record<PhotoCount, LayoutOption[]> = {
  2: [
    {
      id: "side_by_side",
      name: "Side by Side",
      description: "2 vertical split columns",
      icon: (
        <div className="flex h-7 w-9 gap-1 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
        </div>
      ),
    },
    {
      id: "stacked",
      name: "Stacked Rows",
      description: "2 horizontal split rows",
      icon: (
        <div className="flex h-7 w-9 flex-col gap-1 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
        </div>
      ),
    },
  ],
  3: [
    {
      id: "top1_bottom2",
      name: "1 Top, 2 Bottom",
      description: "Hero banner on top, 2 photos below",
      icon: (
        <div className="flex h-7 w-9 flex-col gap-1 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="h-2.5 rounded-sm bg-primary/40" />
          <div className="flex flex-1 gap-1">
            <div className="flex-1 rounded-sm bg-primary/40" />
            <div className="flex-1 rounded-sm bg-primary/40" />
          </div>
        </div>
      ),
    },
    {
      id: "top2_bottom1",
      name: "2 Top, 1 Bottom",
      description: "2 photos on top, wide banner below",
      icon: (
        <div className="flex h-7 w-9 flex-col gap-1 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="flex flex-1 gap-1">
            <div className="flex-1 rounded-sm bg-primary/40" />
            <div className="flex-1 rounded-sm bg-primary/40" />
          </div>
          <div className="h-2.5 rounded-sm bg-primary/40" />
        </div>
      ),
    },
    {
      id: "columns_3",
      name: "3 Columns",
      description: "3 side-by-side vertical strips",
      icon: (
        <div className="flex h-7 w-9 gap-1 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
        </div>
      ),
    },
    {
      id: "rows_3",
      name: "3 Rows",
      description: "3 horizontal stacked strips",
      icon: (
        <div className="flex h-7 w-9 flex-col gap-0.5 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
        </div>
      ),
    },
  ],
  4: [
    {
      id: "grid_2x2",
      name: "2x2 Classic Grid",
      description: "Balanced four-quadrant grid",
      icon: (
        <div className="grid h-7 w-9 grid-cols-2 grid-rows-2 gap-1 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="rounded-sm bg-primary/40" />
          <div className="rounded-sm bg-primary/40" />
          <div className="rounded-sm bg-primary/40" />
          <div className="rounded-sm bg-primary/40" />
        </div>
      ),
    },
    {
      id: "featured_left",
      name: "Hero Left + 3",
      description: "1 large spotlight left, 3 stacked right",
      icon: (
        <div className="flex h-7 w-9 gap-1 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex-1 rounded-sm bg-primary/40" />
            <div className="flex-1 rounded-sm bg-primary/40" />
            <div className="flex-1 rounded-sm bg-primary/40" />
          </div>
        </div>
      ),
    },
    {
      id: "columns_4",
      name: "4 Columns",
      description: "4 vertical strips",
      icon: (
        <div className="flex h-7 w-9 gap-0.5 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
        </div>
      ),
    },
    {
      id: "rows_4",
      name: "4 Rows",
      description: "4 horizontal strips",
      icon: (
        <div className="flex h-7 w-9 flex-col gap-0.5 rounded border border-border/80 bg-muted/40 p-0.5">
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
          <div className="flex-1 rounded-sm bg-primary/40" />
        </div>
      ),
    },
  ],
};

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 Square", hint: "Instagram / Avatars" },
  { id: "4:3", label: "4:3 Standard", hint: "Landscape Photos" },
  { id: "16:9", label: "16:9 Cinema", hint: "HD Desktop & Banners" },
  { id: "9:16", label: "9:16 Mobile", hint: "Stories & Reels" },
  { id: "3:4", label: "3:4 Portrait", hint: "Editorial Prints" },
];

const COLOR_PRESETS = [
  { label: "White", value: "#ffffff", border: "border-slate-300" },
  { label: "Dark Slate", value: "#090d16", border: "border-slate-800" },
  { label: "Charcoal", value: "#1e293b", border: "border-slate-700" },
  { label: "Warm Sand", value: "#f5f5f4", border: "border-stone-300" },
  { label: "Midnight", value: "#000000", border: "border-slate-900" },
  { label: "Transparent", value: "transparent", border: "border-dashed border-slate-400" },
];

export function ImageCollageForm() {
  const [photoCount, setPhotoCount] = useState<PhotoCount>(2);
  const [files, setFiles] = useState<(File | null)[]>([null, null]);
  const [layout, setLayout] = useState("side_by_side");
  const [spacing, setSpacing] = useState(16);
  const [borderRadius, setBorderRadius] = useState(12);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [customBg, setCustomBg] = useState("#ffffff");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [format, setFormat] = useState("png");
  const [submitting, setSubmitting] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Hidden file inputs
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const singleSlotInputRef = useRef<HTMLInputElement>(null);
  const targetSlotIdxRef = useRef<number | null>(null);

  const { job, error, setError, isRunning, track, reset } = useJob();

  // Keep layout synchronized with current photoCount
  useEffect(() => {
    const available = LAYOUTS_BY_COUNT[photoCount];
    if (available && !available.some((l) => l.id === layout)) {
      setLayout(available[0].id);
    }
  }, [photoCount, layout]);

  // Object URLs for preview
  const previewUrls = useMemo(() => {
    return files.map((file) => (file ? URL.createObjectURL(file) : null));
  }, [files]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  // Change target photoCount (2, 3, or 4)
  const handlePhotoCountChange = (newCount: PhotoCount) => {
    setPhotoCount(newCount);
    reset();
    setFiles((prev) => {
      if (prev.length === newCount) return prev;
      if (prev.length < newCount) {
        const extra = Array.from({ length: newCount - prev.length }, () => null);
        return [...prev, ...extra];
      }
      return prev.slice(0, newCount);
    });
  };

  // Helper to ingest an array or FileList of new files
  const ingestFiles = useCallback(
    (incoming: FileList | File[]) => {
      const rawList = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
      if (rawList.length === 0) {
        setError("Please select valid image files (PNG, JPG, WEBP, AVIF).");
        return;
      }

      // Smart count detection: if user selects 2, 3, or 4 photos in bulk, auto-adjust photoCount!
      if (rawList.length >= 2 && rawList.length <= 4) {
        const count = rawList.length as PhotoCount;
        setPhotoCount(count);
        setFiles(rawList.slice(0, count));
        setError(null);
        reset();
        return;
      }

      // If more than 4, take first 4 and set to 4 photos
      if (rawList.length > 4) {
        setPhotoCount(4);
        setFiles(rawList.slice(0, 4));
        setError("Maximum 4 photos allowed for a collage. First 4 photos were selected.");
        reset();
        return;
      }

      // If single file uploaded via bulk or slot:
      if (rawList.length === 1) {
        setFiles((prev) => {
          const updated = [...prev];
          // If specific slot targeted
          if (targetSlotIdxRef.current !== null && targetSlotIdxRef.current < updated.length) {
            updated[targetSlotIdxRef.current] = rawList[0];
          } else {
            // Fill first empty slot
            const emptyIdx = updated.findIndex((f) => f === null);
            if (emptyIdx !== -1) {
              updated[emptyIdx] = rawList[0];
            } else {
              // All full: replace slot 0
              updated[0] = rawList[0];
            }
          }
          return updated;
        });
        setError(null);
      }
    },
    [reset, setError],
  );

  // Bulk input change (from main dropzone or "Choose Photos" button)
  const handleBulkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      targetSlotIdxRef.current = null;
      ingestFiles(e.target.files);
      e.target.value = "";
    }
  };

  // Slot-specific input change (from clicking a specific slot)
  const handleSlotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const targetIdx = targetSlotIdxRef.current;
      if (e.target.files.length === 1 && targetIdx !== null) {
        setFiles((prev) => {
          const updated = [...prev];
          if (targetIdx < updated.length) {
            updated[targetIdx] = e.target.files![0];
          }
          return updated;
        });
        setError(null);
      } else {
        // User selected multiple files inside slot picker
        ingestFiles(e.target.files);
      }
      e.target.value = "";
      targetSlotIdxRef.current = null;
    }
  };

  // Open slot picker for a specific slot index
  const openSlotPicker = (slotIdx: number) => {
    targetSlotIdxRef.current = slotIdx;
    singleSlotInputRef.current?.click();
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedImages: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const f = items[i].getAsFile();
          if (f) pastedImages.push(f);
        }
      }

      if (pastedImages.length > 0) {
        e.preventDefault();
        ingestFiles(pastedImages);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [ingestFiles]);

  const handleRemovePhoto = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleSwapSlots = (i: number, j: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[i];
      updated[i] = updated[j];
      updated[j] = temp;
      return updated;
    });
  };

  const filledCount = files.filter(Boolean).length;
  const isReady = filledCount === photoCount && filledCount >= 2 && filledCount <= 4;

  const handleStart = async () => {
    const validFiles = files.filter((f): f is File => f !== null);
    if (validFiles.length !== photoCount || ![2, 3, 4].includes(validFiles.length)) {
      setError(`Please provide all ${photoCount} photos to generate this collage.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const initialJob = await createImageCollage(validFiles, {
        layout,
        spacing,
        border_radius: borderRadius,
        bg_color: bgColor,
        aspect_ratio: aspectRatio,
        format,
      });
      track(initialJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate collage.");
    } finally {
      setSubmitting(false);
    }
  };

  const done = job?.status === "completed" && job.download_url;
  const downloadUrl = done ? resolveDownloadUrl(job.download_url!) : null;

  return (
    <div className="space-y-8">
      {/* Hidden file input for bulk selection */}
      <input
        ref={bulkInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleBulkInputChange}
      />

      {/* Hidden file input for single slot replacement */}
      <input
        ref={singleSlotInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSlotInputChange}
      />

      {/* Mode Selector: 2, 3, or 4 Photos */}
      <div className="rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold text-foreground">
                Number of Photos
              </h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {photoCount} Photo Composition
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose 2, 3, or 4 photos. You can select all photos at once or pick each slot
              individually.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-background p-1 shadow-sm">
            {([2, 3, 4] as PhotoCount[]).map((count) => {
              const active = photoCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handlePhotoCountChange(count)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{count} Photos</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Central Drag & Drop / Multi-file Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            targetSlotIdxRef.current = null;
            ingestFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => {
          targetSlotIdxRef.current = null;
          bulkInputRef.current?.click();
        }}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 ${
          isDraggingOver
            ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(20,184,166,0.2)] scale-[1.01]"
            : "border-border/80 bg-card/50 hover:border-primary/50 hover:bg-card/80 hover:shadow-lg"
        }`}
      >
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <p className="font-display text-sm sm:text-base font-semibold text-foreground">
          Drop {photoCount} photos here, or{" "}
          <span className="text-primary underline underline-offset-4">browse files</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select all {photoCount} photos at once, or paste from clipboard (Ctrl+V)
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground">
          <span>PNG, JPG, WEBP, AVIF up to 25 MB each</span>
          <span>•</span>
          <span className="font-semibold text-foreground">
            {filledCount} of {photoCount} ready
          </span>
        </div>
      </div>

      {/* Helper alert if user has 2 photos while in 3-photo mode or similar */}
      {filledCount === 2 && photoCount === 3 && (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
          <span>You have 2 photos uploaded. Want to make a 2-photo collage instead?</span>
          <button
            type="button"
            onClick={() => handlePhotoCountChange(2)}
            className="rounded-lg bg-primary px-3 py-1 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Switch to 2 Photos
          </button>
        </div>
      )}

      {filledCount === 3 && photoCount === 4 && (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
          <span>You have 3 photos uploaded. Want to make a 3-photo collage instead?</span>
          <button
            type="button"
            onClick={() => handlePhotoCountChange(3)}
            className="rounded-lg bg-primary px-3 py-1 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Switch to 3 Photos
          </button>
        </div>
      )}

      {/* Individual Photo Slots Manager */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Composition Slots ({filledCount}/{photoCount} filled)
          </label>
          <span className="text-[11px] text-muted-foreground">
            Click any slot to add or replace a photo
          </span>
        </div>

        <div
          className={`grid gap-3.5 ${
            photoCount === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : photoCount === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-4"
          }`}
        >
          {Array.from({ length: photoCount }).map((_, idx) => {
            const file = files[idx] || null;
            const preview = previewUrls[idx] || null;

            return (
              <div
                key={idx}
                onClick={() => openSlotPicker(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    targetSlotIdxRef.current = idx;
                    ingestFiles(e.dataTransfer.files);
                  }
                }}
                className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                  preview
                    ? "border-border bg-card shadow-sm hover:border-primary/60"
                    : "border-dashed border-border/80 bg-card/40 hover:border-primary/50 hover:bg-card/70"
                }`}
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt={`Slot ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 opacity-80 group-hover:opacity-95" />

                    {/* Top slot badge */}
                    <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-md">
                      <span className="text-[10px] font-semibold text-white">Photo #{idx + 1}</span>
                    </div>

                    {/* Action buttons: Swap, Replace, Remove */}
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          title="Swap with previous"
                          onClick={(e) => handleSwapSlots(idx, idx - 1, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/90"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                      )}
                      {idx < photoCount - 1 && (
                        <button
                          type="button"
                          title="Swap with next"
                          onClick={(e) => handleSwapSlots(idx, idx + 1, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/90"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        title="Remove photo"
                        onClick={(e) => handleRemovePhoto(idx, e)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/80 text-white backdrop-blur-md transition-colors hover:bg-rose-600"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Bottom file info & Replace prompt */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-left">
                      <p className="truncate text-xs font-medium text-white">{file?.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-white/75">
                        <span>{file && `${(file.size / (1024 * 1024)).toFixed(2)} MB`}</span>
                        <span className="font-semibold text-primary-foreground group-hover:underline">
                          Click to change
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-foreground">Slot {idx + 1}</span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">
                      Click to choose photo
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Configuration & Live Preview Split */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Options Controls (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Layout Template Selector */}
          <div className="rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collage Layout Template ({LAYOUTS_BY_COUNT[photoCount]?.length} available)
            </label>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {LAYOUTS_BY_COUNT[photoCount]?.map((opt) => {
                const active = layout === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLayout(opt.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/70 bg-background/60 hover:border-border hover:bg-background"
                    }`}
                  >
                    <div className="shrink-0">{opt.icon}</div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}
                      >
                        {opt.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Canvas Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ASPECT_RATIOS.map((ar) => {
                const active = aspectRatio === ar.id;
                return (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    className={`rounded-xl border p-2.5 text-center transition-all ${
                      active
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/70 bg-background/60 hover:border-border hover:bg-background"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}
                    >
                      {ar.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{ar.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spacing & Border Radius Controls */}
          <div className="rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm space-y-5">
            {/* Spacing Slider */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Gap & Border Spacing</label>
                <span className="font-mono text-xs text-primary">{spacing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="48"
                step="2"
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
              <div className="mt-2 flex gap-1.5">
                {[0, 8, 16, 24, 32].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSpacing(val)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      spacing === val
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {val}px
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius Slider */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Photo Corner Rounding</label>
                <span className="font-mono text-xs text-primary">{borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
              <div className="mt-2 flex gap-1.5">
                {[0, 8, 16, 24, 32].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBorderRadius(val)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      borderRadius === val
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {val === 0 ? "Square" : `${val}px`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Background Color & Format Selection */}
          <div className="rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Background Canvas Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const active = bgColor === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setBgColor(preset.value)}
                      className={`group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`h-3.5 w-3.5 rounded-full border ${preset.border}`}
                        style={{
                          backgroundColor:
                            preset.value === "transparent" ? "transparent" : preset.value,
                        }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}

                {/* Custom Color Input */}
                <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-2 py-1">
                  <input
                    type="color"
                    value={customBg}
                    onChange={(e) => {
                      setCustomBg(e.target.value);
                      setBgColor(e.target.value);
                    }}
                    className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span className="font-mono text-[11px] text-muted-foreground">{customBg}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Export Format
              </label>
              <div className="flex gap-2">
                {["png", "jpg", "webp"].map((fmt) => {
                  const active = format === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`flex-1 rounded-xl border py-2 text-center text-xs font-semibold uppercase tracking-wider transition-all ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Visual Blueprint Preview (5 cols) */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">
                  Live Layout Blueprint
                </h4>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {aspectRatio} • {photoCount} photos
              </span>
            </div>

            {/* Preview Frame */}
            <div className="flex flex-1 items-center justify-center rounded-xl border border-border/60 bg-muted/20 p-4">
              <div
                className={`relative w-full max-w-[340px] shadow-lg transition-all duration-300 ${
                  aspectRatio === "1:1"
                    ? "aspect-square"
                    : aspectRatio === "4:3"
                      ? "aspect-[4/3]"
                      : aspectRatio === "16:9"
                        ? "aspect-[16/9]"
                        : aspectRatio === "9:16"
                          ? "aspect-[9/16] max-w-[200px]"
                          : "aspect-[3/4] max-w-[240px]"
                }`}
                style={{
                  backgroundColor: bgColor === "transparent" ? "transparent" : bgColor,
                  backgroundImage:
                    bgColor === "transparent"
                      ? "radial-gradient(#94a3b8 1px, transparent 1px)"
                      : undefined,
                  backgroundSize: "12px 12px",
                  padding: `${Math.max(4, Math.round(spacing * 0.35))}px`,
                }}
              >
                {/* Visual Blueprint Render */}
                <div
                  className="h-full w-full"
                  style={{
                    display: "grid",
                    gap: `${Math.max(2, Math.round(spacing * 0.35))}px`,
                    ...(photoCount === 2
                      ? layout === "stacked"
                        ? { gridTemplateRows: "1fr 1fr", gridTemplateColumns: "1fr" }
                        : { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr" }
                      : photoCount === 3
                        ? layout === "columns_3"
                          ? { gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr" }
                          : layout === "rows_3"
                            ? { gridTemplateRows: "1fr 1fr 1fr", gridTemplateColumns: "1fr" }
                            : layout === "top2_bottom1"
                              ? {
                                  gridTemplateColumns: "1fr 1fr",
                                  gridTemplateRows: "1fr 1fr",
                                }
                              : {
                                  gridTemplateColumns: "1fr 1fr",
                                  gridTemplateRows: "1fr 1fr",
                                }
                        : layout === "columns_4"
                          ? { gridTemplateColumns: "1fr 1fr 1fr 1fr", gridTemplateRows: "1fr" }
                          : layout === "rows_4"
                            ? { gridTemplateRows: "1fr 1fr 1fr 1fr", gridTemplateColumns: "1fr" }
                            : layout === "featured_left"
                              ? { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr" }
                              : { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }),
                  }}
                >
                  {Array.from({ length: photoCount }).map((_, idx) => {
                    const preview = previewUrls[idx];
                    const radius = Math.round(borderRadius * 0.35);

                    // Determine grid positioning for non-uniform layouts
                    const customStyle: React.CSSProperties = {
                      borderRadius: `${radius}px`,
                      overflow: "hidden",
                    };

                    if (photoCount === 3) {
                      if (layout === "top1_bottom2") {
                        if (idx === 0) customStyle.gridColumn = "1 / span 2";
                      } else if (layout === "top2_bottom1") {
                        if (idx === 2) customStyle.gridColumn = "1 / span 2";
                      }
                    } else if (photoCount === 4) {
                      if (layout === "featured_left") {
                        if (idx === 0) customStyle.gridRow = "1 / span 3";
                      }
                    }

                    return (
                      <div
                        key={idx}
                        style={customStyle}
                        className="relative flex items-center justify-center bg-slate-800/80 text-white shadow-sm"
                      >
                        {preview ? (
                          <img
                            src={preview}
                            alt={`Photo ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-1 text-center">
                            <span className="font-mono text-[10px] font-semibold text-white/50">
                              #{idx + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Photos are centered and cropped seamlessly to fit each tile slot.
            </p>
          </div>

          {/* Result Card if Completed */}
          {done && downloadUrl && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="font-display text-sm font-semibold text-foreground">Collage Ready!</h4>
              <p className="mb-4 mt-0.5 text-xs text-muted-foreground">
                High-resolution {photoCount}-photo collage rendered successfully.
              </p>
              <DownloadButton
                href={downloadUrl}
                label={`Download ${format.toUpperCase()} Collage`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
          {error}
        </div>
      )}

      {/* Progress display */}
      {isRunning && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <ProgressBar progress={job?.progress ?? 10} label="Rendering photo collage…" />
        </div>
      )}

      {/* Start Button */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-6 sm:flex-row">
        <div>
          <p className="text-xs text-muted-foreground">
            {isReady
              ? `Ready to generate with all ${photoCount} photos selected.`
              : `Please upload ${photoCount - filledCount} more photo(s) to create your ${photoCount}-photo collage.`}
          </p>
        </div>

        <button
          type="button"
          disabled={!isReady || submitting || isRunning}
          onClick={handleStart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting || isRunning ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Rendering Collage…</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Create {photoCount}-Photo Collage</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
