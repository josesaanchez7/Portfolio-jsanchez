import { PROMPT } from "../boot/bootSequence";
import { normalizeInput, runCommand } from "./commands";
import type { CommandContext, ConsoleEffect, ConsoleLine } from "./consoleTypes";

/** Todo lo que la sesión necesita de la interfaz: ella decide cómo pintar y qué hacer con los efectos. */
export interface ConsoleSessionHooks {
  /** Contexto vigente de los comandos (se consulta en cada ejecución). */
  getContext: () => CommandContext;
  onEffect: (effect: ConsoleEffect) => void;
  /** Añade líneas a la transcripción. */
  onAppend: (lines: readonly ConsoleLine[]) => void;
  /** Vacía la transcripción (comando `clear`). */
  onClear: () => void;
  /** Cambia mientras un comando escalonado (p. ej. `run tests`) está escribiendo su salida. */
  onBusyChange: (busy: boolean) => void;
}

export interface ConsoleSession {
  /** Ejecuta una línea escrita por el usuario. Se ignora mientras hay un comando escribiendo. */
  submit: (raw: string) => void;
  /** Flecha arriba: comando anterior (o null si no hay historial). */
  previous: (currentValue: string) => string | null;
  /** Flecha abajo: comando siguiente; al pasar del último, vuelve a lo que se estaba escribiendo. */
  next: () => string | null;
  /** Cancela los temporizadores pendientes. */
  dispose: () => void;
}

/** El comando escrito, repetido en los resultados como en una terminal. */
const echoLine = (raw: string): ConsoleLine => [
  { text: PROMPT, tone: "info" },
  { text: ` ${raw.trim()}` },
];

/**
 * Estado de la consola: historial de comandos y ejecución. No toca la página; todo sale por `hooks`.
 * Vive mientras la página esté abierta (el diálogo no se destruye al cerrarse).
 */
export const createConsoleSession = (hooks: ConsoleSessionHooks): ConsoleSession => {
  let busy = false;
  const history: string[] = [];
  /** Posición en el historial al navegar con las flechas; null = escribiendo una línea nueva. */
  let cursor: number | null = null;
  let draft = "";
  const timers: number[] = [];

  const setBusy = (value: boolean) => {
    busy = value;
    hooks.onBusyChange(value);
  };

  const submit = (raw: string) => {
    if (busy) return;

    hooks.onAppend([echoLine(raw)]);
    const input = normalizeInput(raw);
    if (!input) return;

    if (history[history.length - 1] !== input) history.push(input);
    cursor = null;
    draft = "";

    const result = runCommand(raw, hooks.getContext());
    if (result.clear) hooks.onClear();

    const runEffects = () => result.effects?.forEach((effect) => hooks.onEffect(effect));
    const { lines, lineDelayMs } = result;

    if (!lineDelayMs || lines.length === 0) {
      hooks.onAppend(lines);
      runEffects();
      return;
    }

    // Salida escalonada: una línea ahora y el resto con una pausa entre ellas.
    setBusy(true);
    let index = 0;
    const showNext = () => {
      const line = lines[index];
      if (line) hooks.onAppend([line]);
      index += 1;
      if (index < lines.length) {
        timers.push(window.setTimeout(showNext, lineDelayMs));
        return;
      }
      setBusy(false);
      runEffects();
    };
    showNext();
  };

  const previous = (currentValue: string): string | null => {
    if (history.length === 0) return null;
    if (cursor === null) {
      draft = currentValue;
      cursor = history.length - 1;
    } else {
      cursor = Math.max(0, cursor - 1);
    }
    return history[cursor] ?? null;
  };

  const next = (): string | null => {
    if (cursor === null) return null;
    if (cursor >= history.length - 1) {
      cursor = null;
      return draft;
    }
    cursor += 1;
    return history[cursor] ?? null;
  };

  const dispose = () => timers.forEach((timer) => window.clearTimeout(timer));

  return { submit, previous, next, dispose };
};
