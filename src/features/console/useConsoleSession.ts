import { useCallback, useEffect, useRef, useState } from "react";
import { useLatest } from "../../hooks/useLatest";
import { PROMPT } from "../boot/bootSequence";
import { normalizeInput, runCommand, welcomeLine } from "./commands";
import type { CommandContext, ConsoleEffect, ConsoleLine } from "./consoleTypes";

export interface ConsoleEntry {
  id: number;
  line: ConsoleLine;
}

let lastEntryId = 0;
const createEntries = (lines: readonly ConsoleLine[]): ConsoleEntry[] =>
  lines.map((line) => ({ id: ++lastEntryId, line }));

/** El comando escrito, repetido en los resultados como en una terminal. */
const echoLine = (raw: string): ConsoleLine => [
  { text: PROMPT, tone: "info" },
  { text: ` ${raw.trim()}` },
];

/**
 * Estado de la consola: transcripción, historial de comandos y ejecución.
 * Vive mientras la página esté abierta (el diálogo no se desmonta al cerrarse).
 */
export const useConsoleSession = (
  context: CommandContext,
  onEffect: (effect: ConsoleEffect) => void,
) => {
  const contextRef = useLatest(context);
  const onEffectRef = useLatest(onEffect);

  const [entries, setEntries] = useState<ConsoleEntry[]>(() => createEntries([welcomeLine(context)]));
  const [busy, setBusy] = useState(false);

  const busyRef = useRef(false);
  const history = useRef<string[]>([]);
  /** Posición en el historial al navegar con las flechas; null = escribiendo una línea nueva. */
  const cursor = useRef<number | null>(null);
  const draft = useRef("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const append = useCallback((lines: readonly ConsoleLine[]) => {
    const added = createEntries(lines);
    setEntries((previous) => [...previous, ...added]);
  }, []);

  const submit = useCallback(
    (raw: string) => {
      if (busyRef.current) return;

      append([echoLine(raw)]);
      const input = normalizeInput(raw);
      if (!input) return;

      if (history.current[history.current.length - 1] !== input) history.current.push(input);
      cursor.current = null;
      draft.current = "";

      const result = runCommand(raw, contextRef.current);
      if (result.clear) setEntries([]);

      const runEffects = () => result.effects?.forEach((effect) => onEffectRef.current(effect));
      const { lines, lineDelayMs } = result;

      if (!lineDelayMs || lines.length === 0) {
        append(lines);
        runEffects();
        return;
      }

      // Salida escalonada: una línea ahora y el resto con una pausa entre ellas.
      busyRef.current = true;
      setBusy(true);
      let index = 0;
      const showNext = () => {
        const line = lines[index];
        if (line) append([line]);
        index += 1;
        if (index < lines.length) {
          timers.current.push(window.setTimeout(showNext, lineDelayMs));
          return;
        }
        busyRef.current = false;
        setBusy(false);
        runEffects();
      };
      showNext();
    },
    [append, contextRef, onEffectRef],
  );

  /** Flecha arriba: comando anterior (o null si no hay historial). */
  const previous = useCallback((currentValue: string): string | null => {
    const items = history.current;
    if (items.length === 0) return null;
    if (cursor.current === null) {
      draft.current = currentValue;
      cursor.current = items.length - 1;
    } else {
      cursor.current = Math.max(0, cursor.current - 1);
    }
    return items[cursor.current] ?? null;
  }, []);

  /** Flecha abajo: comando siguiente; al pasar del último, vuelve a lo que se estaba escribiendo. */
  const next = useCallback((): string | null => {
    if (cursor.current === null) return null;
    if (cursor.current >= history.current.length - 1) {
      cursor.current = null;
      return draft.current;
    }
    cursor.current += 1;
    return history.current[cursor.current] ?? null;
  }, []);

  return { entries, busy, submit, previous, next };
};
