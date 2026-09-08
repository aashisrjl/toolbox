export type ToolCategory = "download" | "image" | "video" | "audio";

export type ToolStatus = "live" | "soon";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  /** Backend endpoint this tool maps to, e.g. /api/v1/image/remove-background */
  endpoint: string;
}

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface Job {
  job_id: string;
  status: JobStatus;
  progress?: number;
  download_url?: string;
  error?: string;
}
