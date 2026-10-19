import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copied" | "error";

export const useCopyToClipboard = (resetDelayMs = 2500) => {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setStatus("copied");
      } catch {
        // También cubre contextos sin Clipboard API (p. ej. http sin TLS).
        setStatus("error");
      }
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setStatus("idle"), resetDelayMs);
    },
    [resetDelayMs],
  );

  return { status, copy };
};
