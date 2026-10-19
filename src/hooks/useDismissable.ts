import { useEffect, type RefObject } from "react";
import { useLatest } from "./useLatest";

export type DismissReason = "escape" | "outside";

/** Llama a `onDismiss` al pulsar Escape o al interactuar fuera de `containerRef` mientras `enabled`. */
export const useDismissable = (
  enabled: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onDismiss: (reason: DismissReason) => void,
): void => {
  const onDismissRef = useLatest(onDismiss);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismissRef.current("escape");
    };
    const onPointerDown = (event: PointerEvent) => {
      const { target } = event;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        onDismissRef.current("outside");
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [enabled, containerRef, onDismissRef]);
};
