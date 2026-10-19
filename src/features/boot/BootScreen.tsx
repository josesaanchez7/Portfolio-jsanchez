import { useCallback, useEffect, useRef, useState } from "react";
import { useLatest } from "../../hooks/useLatest";
import RichText from "../../i18n/RichText";
import { useI18n } from "../../i18n/useI18n";
import { BOOT_SEQUENCE, PROMPT, type BootStep, type BootTone } from "./bootSequence";
import { markBootSeen, shouldShowBoot } from "./bootPreferences";
import { buildTimeline, EXIT_DURATION_MS } from "./bootTimeline";
import { useBootPlayback } from "./useBootPlayback";

const BOOT_TIMELINE = buildTimeline(BOOT_SEQUENCE);

const TONE_CLASS: Record<BootTone, string> = {
  dim: "text-boot-dim",
  ok: "text-boot-ok",
  warn: "text-boot-warn",
};

const INLINE_TAGS = {
  ok: (content: string) => (
    <span data-tone="ok" className={TONE_CLASS.ok}>
      {content}
    </span>
  ),
  dim: (content: string) => (
    <span data-tone="dim" className={TONE_CLASS.dim}>
      {content}
    </span>
  ),
  warn: (content: string) => (
    <span data-tone="warn" className={TONE_CLASS.warn}>
      {content}
    </span>
  ),
};

// Duración del fundido: debe coincidir con EXIT_DURATION_MS (bootTimeline.ts).
const ROOT =
  "fixed inset-0 z-[9999] flex cursor-pointer items-center justify-center overflow-hidden bg-boot-bg p-6 font-boot text-[15px] leading-[1.7] text-boot-text transition-[opacity,scale] duration-500 ease-[ease] [-webkit-tap-highlight-color:transparent] max-phone:text-[13px] data-exiting:pointer-events-none data-exiting:scale-[1.02] data-exiting:opacity-0";

// Las líneas con `data-pending` aún no se han escrito: se mantienen ocultas para reservar su espacio.
const LINE = "min-h-[1.7em] [overflow-wrap:anywhere] whitespace-pre-wrap data-pending:invisible";

type Phase = "running" | "exiting" | "done";

interface BootScreenProps {
  /** Se llama una vez cuando la pantalla termina (o si no llega a mostrarse). */
  onFinish?: () => void;
  /** Si es true, solo se muestra la primera vez por pestaña/sesión. */
  oncePerSession?: boolean;
}

// Las líneas aún no escritas se renderizan ocultas (`pending`) para reservar su espacio: así el bloque,
// centrado en vertical, no se desplaza ni reajusta el salto de línea a medida que aparece el texto.
const CommandLine = ({
  text,
  rest = "",
  cursor = false,
  pending = false,
}: {
  text: string;
  /** Parte del comando que todavía no se ha escrito (oculta, solo reserva espacio). */
  rest?: string;
  cursor?: boolean;
  pending?: boolean;
}) => (
  <div className={LINE} data-pending={pending || undefined}>
    <span className="text-boot-prompt">{PROMPT}</span> {text}
    {cursor && (
      <span className="-mr-[0.6em] inline-block h-[1.1em] w-[0.6em] animate-blink bg-boot-text align-text-bottom" />
    )}
    {rest && <span data-pending>{rest}</span>}
  </div>
);

const OutputLine = ({
  step,
  pending = false,
}: {
  step: Extract<BootStep, { type: "out" }>;
  pending?: boolean;
}) => {
  const { localize } = useI18n();
  const text = typeof step.text === "string" ? step.text : localize(step.text);
  const toneClass = step.tone ? TONE_CLASS[step.tone] : "";

  return (
    <div
      className={`${LINE} ${toneClass}`}
      data-tone={step.tone}
      data-pending={pending || undefined}
    >
      <RichText text={text} tags={INLINE_TAGS} />
    </div>
  );
};

/**
 * Pantalla de carga con aspecto de terminal. Se puede saltar con un clic o con Enter, Escape o espacio.
 * No se muestra si el usuario prefiere menos movimiento.
 */
const BootScreen = ({ onFinish, oncePerSession = false }: BootScreenProps) => {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>(() =>
    shouldShowBoot(oncePerSession) ? "running" : "done",
  );
  const onFinishRef = useLatest(onFinish);
  const finishedRef = useRef(false);

  // Idempotente: lo pueden disparar a la vez el temporizador final, un clic y una tecla.
  const startExit = useCallback(() => {
    setPhase((current) => (current === "running" ? "exiting" : current));
  }, []);

  const frame = useBootPlayback(BOOT_TIMELINE, phase === "running", startExit);

  useEffect(() => {
    if (phase === "running" && oncePerSession) markBootSeen();
  }, [phase, oncePerSession]);

  useEffect(() => {
    if (phase !== "running") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Enter" || event.key === "Escape" || event.key === " ") {
        event.preventDefault();
        startExit();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [phase, startExit]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const timeoutId = window.setTimeout(() => setPhase("done"), EXIT_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  const active = phase !== "done";
  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  useEffect(() => {
    if (phase !== "done" || finishedRef.current) return;
    finishedRef.current = true;
    onFinishRef.current?.();
  }, [phase, onFinishRef]);

  if (phase === "done") return null;

  const { shown, typed } = frame;

  return (
    // Un clic en cualquier parte salta la animación; con teclado: Enter, Escape o espacio (listener de documento).
    <div
      role="status"
      aria-label={t.boot.label}
      className={ROOT}
      data-exiting={phase === "exiting" || undefined}
      onClick={startExit}
    >
      {/* El texto que se va escribiendo no se anuncia: se leería carácter a carácter. */}
      <div className="w-full max-w-[720px]" aria-hidden="true">
        <div className="mb-5 flex gap-2">
          <span className="size-[11px] rounded-full bg-boot-dot" />
          <span className="size-[11px] rounded-full bg-boot-dot" />
          <span className="size-[11px] rounded-full bg-boot-dot" />
        </div>

        {BOOT_SEQUENCE.map((step, index) => {
          const done = index < shown;
          if (step.type === "out") {
            return <OutputLine key={index} step={step} pending={!done} />;
          }
          if (index === shown && typed !== null) {
            return (
              <CommandLine
                key={index}
                text={step.text.slice(0, typed)}
                rest={step.text.slice(typed)}
                cursor
              />
            );
          }
          return <CommandLine key={index} text={step.text} pending={!done} />;
        })}
        {/* Prompt final vacío con el cursor parpadeando. */}
        <CommandLine
          text=""
          cursor={typed !== null && shown >= BOOT_SEQUENCE.length}
          pending={shown < BOOT_SEQUENCE.length}
        />
      </div>

      <button
        type="button"
        className="absolute right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] cursor-pointer rounded-[6px] border border-[color-mix(in_srgb,var(--color-boot-text)_18%,transparent)] bg-transparent px-3 py-[0.4rem] text-[0.85em] text-boot-dim transition-[color,border-color] duration-200 ease-[ease] hover:border-[color-mix(in_srgb,var(--color-boot-text)_35%,transparent)] hover:text-boot-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-boot-prompt"
        aria-label={t.boot.skipLabel}
      >
        {t.boot.skip} <span aria-hidden="true">⏎</span>
      </button>
    </div>
  );
};

export default BootScreen;
