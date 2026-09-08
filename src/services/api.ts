import type { Job } from "@/types/tool";

/** Base URL of the ToolsHub FastAPI backend. */
export const API_BASE_URL =
  (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000";

export const API_PREFIX = "/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, init);
  } catch {
    throw new ApiError(
      "Can't reach the ToolsHub API. Start the backend or set VITE_API_BASE_URL.",
      0,
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(text || `Request failed with status ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

/** Uploads a file to a processing endpoint and returns the created job. */
export function submitFileJob(
  endpoint: string,
  file: File,
  options: Record<string, string> = {},
): Promise<Job> {
  const form = new FormData();
  form.append("file", file);
  for (const [key, value] of Object.entries(options)) form.append(key, value);
  return request<Job>(endpoint, { method: "POST", body: form });
}

/** Submits a URL-based job (downloaders). */
export function submitUrlJob(endpoint: string, url: string): Promise<Job> {
  return request<Job>(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export function getJob(jobId: string): Promise<Job> {
  return request<Job>(`/jobs/${jobId}`);
}

export function cancelJob(jobId: string): Promise<Job> {
  return request<Job>(`/jobs/${jobId}`, { method: "DELETE" });
}

export function resolveDownloadUrl(downloadUrl: string): string {
  return downloadUrl.startsWith("http") ? downloadUrl : `${API_BASE_URL}${downloadUrl}`;
}
