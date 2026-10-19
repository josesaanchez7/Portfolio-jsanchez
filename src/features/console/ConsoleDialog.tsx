import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { cvUrl } from "../../data/cv";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { useDebugMode } from "../../debug/useDebugMode";
import { useI18n } from "../../i18n/useI18n";
import type { CommandContext, ConsoleEffect, ConsoleLine, ConsoleTone } from "./consoleTypes";
import { useConsoleSession } from "./useConsoleSession";

const WINDOW_TITLE = "jose@portfolio — zsh";

// Siempre oscura, como la pantalla de carga: usa sus colores (--color-boot-*), no los del tema.
const DIALOG =
  "scheme-dark m-auto h-[min(460px,calc(100dvh-2rem))] w-[min(720px,calc(100%-2rem))] overflow-hidden rounded-lg border border-boot-dot bg-boot-bg p-0 font-boot text-[14px] leading-[1.6] text-boot-text shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop:bg-[rgba(8,10,16,0.7)]";

const TONE_CLASS: Record<ConsoleTone, string> = {
  ok: "text-boot-ok",
  dim: "text-boot-dim",
  warn: "text-boot-warn",
  info: "text-boot-prompt",
};

/** Una línea de resultados. Todo el texto se pinta como texto plano: nunca se interpreta como HTML. */
const LineView = ({ line }: { line: ConsoleLine }) => (
  <div className="min-h-[1.6em]">
    {line.map((segment, index) => {
      const tone = segment.tone ? TONE_CLASS[segment.tone] : undefined;
      return segment.href ? (
        <a
          key={index}
          href={segment.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline underline-offset-2 hover:text-boot-text ${tone ?? TONE_CLASS.info}`}
        >
          {segment.text}
        </a>
      ) : (
        <span key={index} className={tone}>
          {segment.text}
        </span>
      );
    })}
  </div>
);

interface ConsoleDialogProps {
  open: boolean;
  /** Se llama cuando la consola se cierra (Esc, ×, clic fuera, Ctrl+K, exit…). */
  onClose: () => void;
  /** Muestra la página 404. Sin esta función, el comando 404 queda preparado pero inactivo. */
  onShow404?: () => void;
}

/**
 * Consola interactiva que simula una terminal. Se mantiene montada (cerrada) para conservar
 * la transcripción y el historial de comandos mientras la página esté abierta.
 */
const ConsoleDialog = ({ open, onClose, onShow404 }: ConsoleDialogProps) => {
  const { t, language, localize } = useI18n();
  const debug = useDebugMode();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState("");

  const context = useMemo<CommandContext>(
    () => ({
      t,
      language,
      localize,
      profile,
      projects,
      debugEnabled: debug.enabled,
      canShowNotFound: onShow404 !== undefined,
    }),
    [t, language, localize, debug.enabled, onShow404],
  );

  const handleEffect = useCallback(
    (effect: ConsoleEffect) => {
      switch (effect) {
        case "close":
          onClose();
          break;
        case "openCv":
          window.open(cvUrl, "_blank", "noopener,noreferrer");
          break;
        case "toggleDebug":
          debug.toggle();
          break;
        case "show404":
          onShow404?.();
          break;
      }
    },
    [onClose, debug, onShow404],
  );

  const { entries, busy, submit, previous, next } = useConsoleSession(context, handleEffect);

  // Abre/cierra el <dialog> nativo según `open` y coloca el cursor en la línea de comandos.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Mientras está abierta, la página de detrás no hace scroll.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Los resultados nuevos bajan solos.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries]);

  // Cualquier cierre (Esc, ×, clic fuera, exit…) acaba aquí: avisa y devuelve el foco a quien abrió.
  const handleClose = () => {
    onClose();
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(value);
    setValue("");
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const recalled = event.key === "ArrowUp" ? previous(value) : next();
    if (recalled !== null) setValue(recalled);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={t.console.title}
      className={DIALOG}
      onClose={handleClose}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.currentTarget.close();
      }}
      onClick={(event) => {
        // Clic en el fondo (fuera de la ventana) cierra la consola.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-boot-dot py-[0.35rem] pr-2 pl-4 text-[0.9em] text-boot-dim">
          <span>{WINDOW_TITLE}</span>
          <button
            type="button"
            aria-label={t.console.close}
            onClick={() => dialogRef.current?.close()}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-sm text-[1.5em] leading-none text-boot-dim transition-colors duration-200 hover:text-boot-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-boot-prompt"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 [overflow-wrap:anywhere] whitespace-pre-wrap"
          onClick={() => {
            // Un clic en los resultados enfoca la línea de comandos, salvo que se esté seleccionando texto.
            if (!window.getSelection()?.toString()) inputRef.current?.focus();
          }}
        >
          {entries.map((entry) => (
            <LineView key={entry.id} line={entry.line} />
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-center gap-2 border-t border-boot-dot px-4 py-2"
        >
          <span className="text-boot-prompt" aria-hidden="true">
            ~ $
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleInputKeyDown}
            readOnly={busy}
            aria-busy={busy}
            aria-label={t.console.inputLabel}
            placeholder={t.console.placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-boot-dim max-phone:text-[16px]"
          />
        </form>
      </div>
    </dialog>
  );
};

export default ConsoleDialog;
