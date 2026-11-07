import type { BootStep } from "./bootSequence";

// Rápida a propósito (≈ 1,6 s en total): es lo primero que ve quien llega con prisa, y se puede saltar.
export const CHAR_DELAY_MS = 6;
export const OUTPUT_DELAY_MS = 40;
export const COMMAND_PAUSE_MS = 90;
export const START_DELAY_MS = 100;
/** Tiempo con el prompt vacío y el cursor parpadeando antes de cerrar. */
export const IDLE_DELAY_MS = 200;
export const EXIT_DURATION_MS = 300;

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
