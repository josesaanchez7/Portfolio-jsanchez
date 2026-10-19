import { useEffect, useState } from "react";
import { useLatest } from "../../hooks/useLatest";
import { INITIAL_FRAME, type BootFrame, type BootTimeline } from "./bootTimeline";

/**
 * Reproduce la línea de tiempo con un único setTimeout encadenado y devuelve el fotograma actual.
 * Al desactivarse o desmontarse se cancela el temporizador pendiente, así que en StrictMode
 * (montaje → limpieza → montaje) la secuencia se reinicia sin duplicar nada.
 */
export const useBootPlayback = (
  timeline: BootTimeline,
  enabled: boolean,
  onComplete: () => void,
): BootFrame => {
  const [frame, setFrame] = useState<BootFrame>(INITIAL_FRAME);
  const onCompleteRef = useLatest(onComplete);

  useEffect(() => {
    if (!enabled) return;

    let index = 0;
    let timeoutId: number | undefined;

    const scheduleNext = () => {
      const event = timeline.events[index];
      if (!event) {
        timeoutId = window.setTimeout(() => onCompleteRef.current(), timeline.endDelay);
        return;
      }
      timeoutId = window.setTimeout(() => {
        setFrame(event.frame);
        index += 1;
        scheduleNext();
      }, event.delay);
    };

    scheduleNext();
    return () => window.clearTimeout(timeoutId);
  }, [timeline, enabled, onCompleteRef]);

  return frame;
};
