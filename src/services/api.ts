import type { Job } from "@/types/tool";

const rawBaseUrl =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.trim().replace(/\/+$/, "") ??
  "http://localhost:8000";

export const API_BASE_URL = rawBaseUrl.endsWith("/api/v1")
  ? rawBaseUrl.slice(0, -"/api/v1".length)
  : rawBaseUrl;

export const API_PREFIX = "/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, init);
  } catch {
    throw new ApiError(
      "Can't reach the Toolbox API. Start the backend or set VITE_API_BASE_URL.",
      0,
    );
  }
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) {
        message = data.error;
      } else if (data?.detail) {
        message = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }
    throw new ApiError(message, res.status);
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

/** Uploads multiple files to a processing endpoint and returns the created job. */
export function submitMultiFileJob(
  endpoint: string,
  files: File[],
  fieldName = "files",
  options: Record<string, string> = {},
): Promise<Job> {
  const form = new FormData();
  for (const file of files) {
    form.append(fieldName, file);
  }
  for (const [key, value] of Object.entries(options)) form.append(key, value);
  return request<Job>(endpoint, { method: "POST", body: form });
}

/** Submits a URL-based job (downloaders). */
export function submitUrlJob(
  endpoint: string,
  url: string,
  extra: Record<string, unknown> = {},
): Promise<Job> {
  return request<Job>(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, ...extra }),
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
