import type { ImageToolFormProps } from "@/components/tools/ImageToolForm";
import { compressImage, convertImage, removeImageBackground, resizeImage } from "@/services/image";

const FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "webp", label: "WEBP" },
  { value: "avif", label: "AVIF" },
];

/** Per-tool configuration for the shared image tool form. */
export const IMAGE_TOOL_CONFIGS: Record<string, ImageToolFormProps> = {
  "remove-image-bg": {
    actionLabel: "Remove background",
    runningLabel: "Removing background",
    submit: (file) => removeImageBackground(file),
  },

  "compress-image": {
    actionLabel: "Compress image",
    runningLabel: "Compressing",
    defaults: { quality: "75", format: "auto" },
    fields: [
      { kind: "range", name: "quality", label: "Quality", min: 30, max: 95, step: 5, suffix: "%" },
      {
        kind: "select",
        name: "format",
        label: "Output format",
        options: [{ value: "auto", label: "Keep original" }, ...FORMATS],
      },
    ],
    submit: (file, v) =>
      compressImage(file, { quality: v['quality'] ?? "75", format: v['format'] ?? "auto" }),
  },

  "convert-image": {
    actionLabel: "Convert image",
    runningLabel: "Converting",
    defaults: { format: "webp" },
    fields: [{ kind: "select", name: "format", label: "Convert to", options: FORMATS }],
    submit: (file, v) => convertImage(file, { format: v['format'] ?? "webp" }),
  },

  "resize-image": {
    actionLabel: "Resize image",
    runningLabel: "Resizing",
    defaults: { mode: "resize", width: "1280", height: "720", keep_aspect: "true" },
    fields: [
      {
        kind: "select",
        name: "mode",
        label: "Mode",
        options: [
          { value: "resize", label: "Resize to fit" },
          { value: "crop", label: "Crop to exact size" },
        ],
      },
      { kind: "toggle", name: "keep_aspect", label: "Keep aspect ratio" },
      { kind: "number", name: "width", label: "Width (px)", min: 1, max: 10000 },
      { kind: "number", name: "height", label: "Height (px)", min: 1, max: 10000 },
    ],
    validate: (v) => {
      const w = Number(v['width']);
      const h = Number(v['height']);
      if (!Number.isFinite(w) || w < 1 || !Number.isFinite(h) || h < 1) {
        return "Enter a width and height of at least 1 pixel.";
      }
      if (w > 10000 || h > 10000) return "Maximum size is 10000 pixels per side.";
      return null;
    },
    submit: (file, v) =>
      resizeImage(file, {
        mode: v['mode'] ?? "resize",
        width: v['width'] ?? "",
        height: v['height'] ?? "",
        keep_aspect: v['keep_aspect'] ?? "true",
      }),
  },
};
