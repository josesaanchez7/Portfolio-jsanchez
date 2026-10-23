import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { TEST_RUN_LINES } from "../../data/testRun";
import { messages } from "../../i18n/messages";
import type { Language } from "../../lib/language";
import type { CommandContext, ConsoleEffect, ConsoleLine } from "./consoleTypes";
import { createConsoleSession } from "./session";

const buildContext = (language: Language = "es", overrides: Partial<CommandContext> = {}): CommandContext => ({
  t: messages[language],
  language,
  localize: (text) => text[language],
  profile,
  projects,
  debugEnabled: false,
  canShowNotFound: false,
  ...overrides,
});

const plain = (line: ConsoleLine) => line.map((segment) => segment.text).join("");

/** Sesión con una transcripción en memoria, como la que pinta el diálogo. */
const setup = (getContext: () => CommandContext = () => buildContext()) => {
  let transcript: string[] = [];
  const effects: ConsoleEffect[] = [];
  const busy: boolean[] = [];
  const session = createConsoleSession({
    getContext,
    onEffect: (effect) => effects.push(effect),
    onAppend: (lines) => transcript.push(...lines.map(plain)),
    onClear: () => {
      transcript = [];
    },
    onBusyChange: (value) => busy.push(value),
  });
  return { session, effects, busy, lines: () => transcript };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("sesión de la consola: uso", () => {
  it("repite el comando con el prompt y muestra su resultado", () => {
    const { session, lines } = setup();

    session.submit("whoami");

    expect(lines()[0]).toBe("jose@portfolio ~ $ whoami");
    expect(lines()[1]).toContain("José Sánchez");
  });

  it("una línea vacía solo repite el prompt", () => {
    const { session, lines } = setup();

    session.submit("   ");

    expect(lines()).toEqual(["jose@portfolio ~ $ "]);
  });

  it("un comando desconocido responde con el aviso", () => {
    const { session, lines } = setup();

    session.submit("foo");

    expect(lines()[1]).toBe(messages.es.console.unknownCommand("foo"));
  });

  it("clear limpia la transcripción", () => {
    const { session, lines } = setup();
    session.submit("help");

    session.submit("clear");

    expect(lines()).toEqual([]);
  });

  it("los efectos de un comando se ejecutan tras su salida (cv abre el CV y cierra)", () => {
    const { session, effects } = setup();

    session.submit("cv");

    expect(effects).toEqual(["openCv", "close"]);
  });

  it("debug pide alternar el modo debug", () => {
    const { session, effects, lines } = setup();

    session.submit("debug");

    expect(effects).toEqual(["toggleDebug"]);
    expect(lines()[1]).toBe(messages.es.console.debugOn);
  });

  it("consulta el contexto en cada comando: el estado de debug actual decide el mensaje", () => {
    let debugEnabled = false;
    const { session, lines } = setup(() => buildContext("es", { debugEnabled }));

    session.submit("debug");
    debugEnabled = true;
    session.submit("debug");

    expect(lines()[1]).toBe(messages.es.console.debugOn);
    expect(lines()[3]).toBe(messages.es.console.debugOff);
  });

  it("404 queda preparado: avisa de que la página aún no existe y no pide ningún efecto", () => {
    const { session, effects, lines } = setup();

    session.submit("404");

    expect(lines()[1]).toBe(messages.es.console.notFoundUnavailable);
    expect(effects).toEqual([]);
  });

  it("run tests muestra las líneas una a una con una pausa y bloquea la entrada mientras tanto", () => {
    const { session, lines, busy } = setup();

    session.submit("run tests");
    expect(busy).toEqual([true]);
    expect(lines()).toHaveLength(2); // el eco y la primera línea

    // Mientras escribe, otro comando se ignora.
    session.submit("whoami");
    expect(lines()).toHaveLength(2);

    vi.advanceTimersByTime(140 * TEST_RUN_LINES.length);

    expect(busy).toEqual([true, false]);
    expect(lines()).toHaveLength(1 + TEST_RUN_LINES.length);
    expect(lines().at(-1)).toContain("5 passed");

    session.submit("whoami");
    expect(lines().at(-2)).toBe("jose@portfolio ~ $ whoami");
  });

  it("dispose cancela las líneas pendientes", () => {
    const { session, lines } = setup();
    session.submit("run tests");

    session.dispose();
    vi.advanceTimersByTime(10_000);

    expect(lines()).toHaveLength(2);
  });

  it("en inglés todo está traducido", () => {
    const { session, lines } = setup(() => buildContext("en"));

    session.submit("foo");

    expect(lines()[1]).toBe(messages.en.console.unknownCommand("foo"));
  });
});

describe("sesión de la consola: historial", () => {
  it("las flechas arriba y abajo recorren los comandos anteriores", () => {
    const { session } = setup();
    session.submit("help");
    session.submit("whoami");

    expect(session.previous("")).toBe("whoami");
    expect(session.previous("")).toBe("help");
    expect(session.previous("")).toBe("help");
    expect(session.next()).toBe("whoami");
  });

  it("al pasar del último comando vuelve a lo que se estaba escribiendo", () => {
    const { session } = setup();
    session.submit("help");

    expect(session.previous("bor")).toBe("help");
    expect(session.next()).toBe("bor");
    expect(session.next()).toBeNull();
  });

  it("sin historial no recupera nada", () => {
    const { session } = setup();

    expect(session.previous("")).toBeNull();
    expect(session.next()).toBeNull();
  });

  it("no guarda líneas vacías ni repite comandos seguidos", () => {
    const { session } = setup();
    session.submit("help");
    session.submit("help");
    session.submit("   ");
    session.submit("whoami");

    expect(session.previous("")).toBe("whoami");
    expect(session.previous("")).toBe("help");
    expect(session.previous("")).toBe("help");
  });
});
