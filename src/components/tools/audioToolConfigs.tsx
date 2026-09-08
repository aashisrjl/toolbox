import type { AudioToolFormProps } from "@/components/tools/AudioToolForm";
import { convertAudio } from "@/services/audio";

const AUDIO_FORMATS = [
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV (Lossless)" },
  { value: "flac", label: "FLAC (High-res)" },
  { value: "aac", label: "AAC" },
  { value: "ogg", label: "OGG Vorbis" },
];

const BITRATES = [
  { value: "320k", label: "320 kbps (Studio Quality)" },
  { value: "256k", label: "256 kbps (Very High)" },
  { value: "192k", label: "192 kbps (High / Balanced)" },
  { value: "128k", label: "128 kbps (Standard)" },
  { value: "64k", label: "64 kbps (Voice / Smallest)" },
];

export const AUDIO_TOOL_CONFIGS: Record<string, AudioToolFormProps> = {
  "convert-audio": {
    actionLabel: "Convert audio",
    runningLabel: "Converting audio",
    defaults: { format: "mp3", bitrate: "192k" },
    fields: [
      { kind: "select", name: "format", label: "Target audio format", options: AUDIO_FORMATS },
      { kind: "select", name: "bitrate", label: "Target bitrate", options: BITRATES },
    ],
    submit: (file, v) =>
      convertAudio(file, {
        format: v["format"] ?? "mp3",
        bitrate: v["bitrate"] ?? "192k",
      }),
  },
};
