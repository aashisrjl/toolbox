import { useCallback, useEffect, useRef, useState } from "react";
import { getJob } from "@/services/api";
import type { Job } from "@/types/tool";

const POLL_MS = 1500;

/** Polls a job until it completes or fails. */
export function useJob() {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    setJob(null);
    setError(null);
  }, [stop]);

  const track = useCallback(
    (initial: Job) => {
      stop();
      setError(null);
      setJob(initial);

      const poll = async (id: string) => {
        try {
          const next = await getJob(id);
          setJob(next);
          if (next.status === "queued" || next.status === "processing") {
            timer.current = setTimeout(() => void poll(id), POLL_MS);
          } else if (next.status === "failed") {
            setError(next.error ?? "Processing failed.");
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : "Lost contact with the server.");
        }
      };

      if (initial.status === "queued" || initial.status === "processing") {
        timer.current = setTimeout(() => void poll(initial.job_id), POLL_MS);
      }
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  const isRunning = job?.status === "queued" || job?.status === "processing";

  return { job, error, setError, isRunning, track, reset };
}
