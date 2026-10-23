import { describe, expect, it } from "vitest";
import { LANGUAGES } from "../../lib/language";
import { BOOT_SEQUENCE, type BootStep } from "./bootSequence";
import {
  buildTimeline,
  CHAR_DELAY_MS,
  COMMAND_PAUSE_MS,
  getTimelineDuration,
  IDLE_DELAY_MS,
  OUTPUT_DELAY_MS,
  START_DELAY_MS,
} from "./bootTimeline";

const sample: readonly BootStep[] = [
  { type: "cmd", text: "ls" },
  { type: "out", text: "a b", tone: "dim" },
  { type: "cmd", text: "pwd" },
  { type: "out", text: "/home" },
];

describe("buildTimeline", () => {
  const { events, endDelay } = buildTimeline(sample);

  it("el primer comando espera START_DELAY y muestra solo el prompt", () => {
    expect(events[0]).toEqual({ delay: START_DELAY_MS, frame: { shown: 0, typed: 0 } });
  });

  it("escribe un carácter cada CHAR_DELAY_MS hasta completar el comando", () => {
    expect(events.slice(1, 3)).toEqual([
      { delay: CHAR_DELAY_MS, frame: { shown: 0, typed: 1 } },
      { delay: CHAR_DELAY_MS, frame: { shown: 0, typed: 2 } },
    ]);
  });

  it("la salida aparece de golpe tras OUTPUT_DELAY_MS, con el comando ya completo", () => {
    expect(events[3]).toEqual({ delay: OUTPUT_DELAY_MS, frame: { shown: 2, typed: null } });
  });

  it("entre comandos hay una pausa de COMMAND_PAUSE_MS", () => {
    expect(events[4]).toEqual({ delay: COMMAND_PAUSE_MS, frame: { shown: 2, typed: 0 } });
  });

  it("termina con el prompt vacío y espera IDLE_DELAY_MS antes de cerrar", () => {
    expect(events[events.length - 1]).toEqual({
      delay: COMMAND_PAUSE_MS,
      frame: { shown: sample.length, typed: 0 },
    });
    expect(endDelay).toBe(IDLE_DELAY_MS);
  });

  it("nunca retrocede: 'shown' no decrece entre eventos", () => {
    const shown = events.map((event) => event.frame.shown);
    expect(shown).toEqual([...shown].sort((a, b) => a - b));
  });
});

describe("guion de la consola", () => {
  it("empieza por un comando y tiene salida después de cada uno", () => {
    expect(BOOT_SEQUENCE[0]?.type).toBe("cmd");
    BOOT_SEQUENCE.forEach((step, index) => {
      if (step.type === "cmd") expect(BOOT_SEQUENCE[index + 1]?.type).toBe("out");
    });
  });

  it("ningún texto está vacío en ningún idioma", () => {
    for (const step of BOOT_SEQUENCE) {
      const { text } = step;
      const versions = typeof text === "string" ? [text] : LANGUAGES.map((language) => text[language]);
      for (const version of versions) expect(version.trim()).not.toBe("");
    }
  });

  it("dura unos 5 segundos con la salida incluida (≈ 4.3 s + 0.5 s de fundido)", () => {
    const commands = BOOT_SEQUENCE.filter((step) => step.type === "cmd");
    const outputs = BOOT_SEQUENCE.length - commands.length;
    const typedChars = commands.reduce((total, step) => total + step.text.length, 0);

    const expected =
      START_DELAY_MS +
      typedChars * CHAR_DELAY_MS +
      outputs * OUTPUT_DELAY_MS +
      (commands.length - 1) * COMMAND_PAUSE_MS +
      COMMAND_PAUSE_MS +
      IDLE_DELAY_MS;

    const duration = getTimelineDuration(buildTimeline(BOOT_SEQUENCE));
    expect(duration).toBe(expected);
    expect(duration).toBeGreaterThan(4000);
    expect(duration).toBeLessThan(5000);
  });
});
