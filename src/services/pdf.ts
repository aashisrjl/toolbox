import { submitFileJob, submitMultiFileJob } from "@/services/api";
import type { Job } from "@/types/tool";

export interface ImageToPdfOptions {
  page_size?: string;
  orientation?: string;
  margin?: string;
}

export const convertImageToPdf = (file: File, options: ImageToPdfOptions = {}): Promise<Job> =>
  submitFileJob("/image-to-pdf", file, { ...options });

export const convertImagesToPdf = (
  files: File[],
  options: ImageToPdfOptions = {},
): Promise<Job> => {
  if (files.length === 1) {
    return convertImageToPdf(files[0], options);
  }
  return submitMultiFileJob("/image-to-pdf", files, "files", { ...options });
};

export const mergePdfs = (files: File[]): Promise<Job> =>
  submitMultiFileJob("/merge-pdf", files, "files");

export const convertPdfToWord = (file: File): Promise<Job> => submitFileJob("/pdf-to-word", file);

export const convertWordToPdf = (file: File): Promise<Job> => submitFileJob("/word-to-pdf", file);

export const protectPdf = (file: File, password: string): Promise<Job> =>
  submitFileJob("/protect-pdf", file, { password });
