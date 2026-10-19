import { useEffect } from "react";
import { useLatest } from "../../hooks/useLatest";

interface ConsoleShortcuts {
  /** false mientras no se debe poder abrir (p. ej. durante la pantalla de carga). */
  enabled: boolean;
  /** Ctrl/Cmd + K. */
  onToggle: () => void;
  /** Tecla ` (acento grave). */
  onOpen: () => void;
}

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * La tecla ` es una tecla muerta en el teclado español (key "Dead", en la tecla a la derecha de la P),
 * así que se reconoce también por su posición física cuando no se pulsa con Mayús (Mayús+tecla = ^).
 */
const isGraveKey = (event: KeyboardEvent): boolean =>
  event.key === "`" || (event.key === "Dead" && event.code === "BracketLeft" && !event.shiftKey);

/** Atajos globales de la consola: Ctrl/Cmd + K abre y cierra; ` abre si no se está escribiendo. */
export const useConsoleShortcuts = ({ enabled, onToggle, onOpen }: ConsoleShortcuts): void => {
  const enabledRef = useLatest(enabled);
  const onToggleRef = useLatest(onToggle);
  const onOpenRef = useLatest(onOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current || event.repeat) return;

      if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onToggleRef.current();
        return;
      }

      if (
        isGraveKey(event) &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
        onOpenRef.current();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabledRef, onToggleRef, onOpenRef]);
};
