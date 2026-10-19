import type { BootStep } from "./bootSequence";

export const CHAR_DELAY_MS = 18;
export const OUTPUT_DELAY_MS = 120;
export const COMMAND_PAUSE_MS = 220;
export const START_DELAY_MS = 200;
/** Tiempo con el prompt vacío y el cursor parpadeando antes de cerrar. */
export const IDLE_DELAY_MS = 700;
export const EXIT_DURATION_MS = 500;

/**
 * Qué se ve en cada momento:
 * - los pasos anteriores a `shown` están completos;
 * - si `typed` no es null, se muestra una línea de comando con ese número de caracteres
 *   escritos (el paso `shown`; si no existe, es el prompt vacío final).
 */
export interface BootFrame {
  shown: number;
  typed: number | null;
}

export interface BootTimelineEvent {
  /** Espera, en ms, desde el evento anterior. */
  delay: number;
  frame: BootFrame;
}

export interface BootTimeline {
  events: BootTimelineEvent[];
  /** Espera tras el último evento antes de dar la secuencia por terminada. */
  endDelay: number;
}

export const INITIAL_FRAME: BootFrame = { shown: 0, typed: null };

/** Convierte el guion en una lista de eventos con sus esperas. Función pura. */
export const buildTimeline = (steps: readonly BootStep[]): BootTimeline => {
  const events: BootTimelineEvent[] = [];

  steps.forEach((step, index) => {
    if (step.type === "out") {
      events.push({ delay: OUTPUT_DELAY_MS, frame: { shown: index + 1, typed: null } });
      return;
    }

    events.push({
      delay: index === 0 ? START_DELAY_MS : COMMAND_PAUSE_MS,
      frame: { shown: index, typed: 0 },
    });
    for (let typed = 1; typed <= step.text.length; typed += 1) {
      events.push({ delay: CHAR_DELAY_MS, frame: { shown: index, typed } });
    }
  });

  // Prompt vacío final con el cursor parpadeando.
  events.push({ delay: COMMAND_PAUSE_MS, frame: { shown: steps.length, typed: 0 } });

  return { events, endDelay: IDLE_DELAY_MS };
};

export const getTimelineDuration = ({ events, endDelay }: BootTimeline): number =>
  events.reduce((total, event) => total + event.delay, endDelay);
