import { HOME_DIR, normalizeInput, promptFor, runCommand } from "./commands";
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
  /** Cambia la carpeta actual (tras `cd`): la interfaz actualiza el prompt de la línea de comandos. */
  onCwdChange?: (cwd: string) => void;
}

export interface ConsoleSession {
  /** Ejecuta una línea escrita por el usuario. */
  submit: (raw: string) => void;
  /** Flecha arriba: comando anterior (o null si no hay historial). */
  previous: (currentValue: string) => string | null;
  /** Flecha abajo: comando siguiente; al pasar del último, vuelve a lo que se estaba escribiendo. */
  next: () => string | null;
}

/** El comando escrito, repetido en los resultados como en una terminal (con la carpeta en la que se escribió). */
const echoLine = (raw: string, cwd: string): ConsoleLine => [
  { text: promptFor(cwd), tone: "info" },
  { text: ` ${raw.trim()}` },
];

/**
 * Estado de la consola: carpeta actual, historial de comandos y ejecución. No toca la página; todo sale por `hooks`.
 * Vive mientras la página esté abierta (el diálogo no se destruye al cerrarse).
 */
export const createConsoleSession = (hooks: ConsoleSessionHooks): ConsoleSession => {
  const history: string[] = [];
  /** Posición en el historial al navegar con las flechas; null = escribiendo una línea nueva. */
  let cursor: number | null = null;
  let draft = "";
  let cwd = HOME_DIR;

  const submit = (raw: string) => {
    hooks.onAppend([echoLine(raw, cwd)]);
    const input = normalizeInput(raw);
    if (!input) return;

    if (history[history.length - 1] !== input) history.push(input);
    cursor = null;
    draft = "";

    const result = runCommand(raw, { ...hooks.getContext(), cwd });
    if (result.clear) hooks.onClear();
    if (result.cwd !== undefined && result.cwd !== cwd) {
      cwd = result.cwd;
      hooks.onCwdChange?.(cwd);
    }
    hooks.onAppend(result.lines);
    result.effects?.forEach((effect) => hooks.onEffect(effect));
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

  return { submit, previous, next };
};
