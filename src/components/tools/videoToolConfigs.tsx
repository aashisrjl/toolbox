import type { VideoToolFormProps } from "@/components/tools/VideoToolForm";
import { convertVideo, extractAudio, removeVideoBackground, trimVideo } from "@/services/video";

const VIDEO_FORMATS = [
  { value: "mp4", label: "MP4 (H.264)" },
  { value: "webm", label: "WEBM (VP9)" },
  { value: "mov", label: "MOV (QuickTime)" },
  { value: "gif", label: "Animated GIF" },
];

const AUDIO_FORMATS = [
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV (Lossless)" },
  { value: "aac", label: "AAC" },
  { value: "ogg", label: "OGG Vorbis" },
];

export const VIDEO_TOOL_CONFIGS: Record<string, VideoToolFormProps> = {
  "remove-video-bg": {
    actionLabel: "Remove video background",
    runningLabel: "Matting video frames",
    hint: "Short MP4, MOV or WEBM clips up to 50 MB",
    defaults: { model: "u2net", smooth_edges: "true" },
    fields: [
      {
        kind: "select",
        name: "model",
        label: "AI Matting Model",
        options: [
          { value: "u2net", label: "U2-Net (Fast & Balanced)" },
          { value: "isnet-general-use", label: "IS-Net (High Definition & Crisp Silhouette)" },
          { value: "u2net_human_seg", label: "Human / Portrait (Best for people & presenters)" },
        ],
      },
      {
        kind: "select",
        name: "smooth_edges",
        label: "Edge Refinement & Matting",
        options: [
          { value: "true", label: "Enabled (Feathered boundary blending)" },
          { value: "false", label: "Standard" },
        ],
      },
    ],
    submit: (file, v) =>
      removeVideoBackground(file, {
        model: v["model"] ?? "u2net",
        smooth_edges: v["smooth_edges"] ?? "true",
      }),
  },

  "convert-video": {
    actionLabel: "Convert video",
    runningLabel: "Converting video",
    defaults: { format: "mp4", quality: "medium" },
    fields: [
      { kind: "select", name: "format", label: "Output format", options: VIDEO_FORMATS },
      {
        kind: "select",
        name: "quality",
        label: "Quality preset",
        options: [
          { value: "high", label: "High (Larger file)" },
          { value: "medium", label: "Balanced (Recommended)" },
          { value: "low", label: "Small (Faster)" },
        ],
      },
    ],
    submit: (file, v) =>
      convertVideo(file, {
        format: v["format"] ?? "mp4",
        quality: v["quality"] ?? "medium",
      }),
  },

  "trim-video": {
    actionLabel: "Trim video",
    runningLabel: "Trimming video",
    defaults: { start_time: "0", end_time: "10" },
    fields: [
      {
        kind: "text",
        name: "start_time",
        label: "Start Time (seconds or HH:MM:SS)",
        placeholder: "0 or 00:00:00",
      },
      {
        kind: "text",
        name: "end_time",
        label: "End Time (seconds or HH:MM:SS)",
        placeholder: "10 or 00:00:10",
      },
    ],
    validate: (v) => {
      if (!v["start_time"]?.trim()) return "Start time is required.";
      return null;
    },
    submit: (file, v) =>
      trimVideo(file, {
        start_time: v["start_time"] ?? "0",
        end_time: v["end_time"] ?? "",
      }),
  },

  "extract-audio": {
    actionLabel: "Extract soundtrack",
    runningLabel: "Extracting audio",
    defaults: { format: "mp3", bitrate: "192k" },
    fields: [
      { kind: "select", name: "format", label: "Audio format", options: AUDIO_FORMATS },
      {
        kind: "select",
        name: "bitrate",
        label: "Audio bitrate",
        options: [
          { value: "320k", label: "320 kbps (Studio)" },
          { value: "192k", label: "192 kbps (High Quality)" },
          { value: "128k", label: "128 kbps (Standard)" },
        ],
      },
    ],
    submit: (file, v) =>
      extractAudio(file, {
        format: v["format"] ?? "mp3",
        bitrate: v["bitrate"] ?? "192k",
      }),
  },
};
