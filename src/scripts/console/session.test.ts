import { describe, expect, it } from "vitest";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { messages } from "../../i18n/messages";
import type { Language } from "../../lib/language";
import type { CommandContext, ConsoleEffect, ConsoleLine } from "./consoleTypes";
import { createConsoleSession, type ConsoleSessionHooks } from "./session";

const buildContext = (language: Language = "en"): CommandContext => ({
  t: messages[language],
  language,
  localize: (text) => text[language],
  profile,
  projects,
});

const plain = (line: ConsoleLine) => line.map((segment) => segment.text).join("");

/** Sesión con una transcripción en memoria, como la que pinta el diálogo. */
const setup = (language: Language = "en", extra: Partial<ConsoleSessionHooks> = {}) => {
  let transcript: string[] = [];
  const effects: ConsoleEffect[] = [];
  const session = createConsoleSession({
    getContext: () => buildContext(language),
    onEffect: (effect) => effects.push(effect),
    onAppend: (lines) => transcript.push(...lines.map(plain)),
    onClear: () => {
      transcript = [];
    },
    ...extra,
  });
  return { session, effects, lines: () => transcript };
};

describe("sesión de la consola: uso", () => {
  it("repite el comando con el prompt y muestra su resultado", () => {
    const { session, lines } = setup();

    session.submit("open email.txt");

    expect(lines()).toEqual(["jose@portfolio ~ $ open email.txt", profile.email]);
  });

  it("cd cambia la carpeta: el prompt de los siguientes comandos la refleja", () => {
    const cwds: string[] = [];
    const { session, lines } = setup("en", { onCwdChange: (cwd) => cwds.push(cwd) });

    session.submit("cd projects");
    session.submit("ls");
    session.submit("cd ~");

    expect(cwds).toEqual(["~/projects", "~"]);
    expect(lines()).toContain("jose@portfolio ~/projects $ ls");
  });

  it("ls sin argumentos lista la carpeta actual", () => {
    const { session, lines } = setup();

    session.submit("cd projects");
    session.submit("ls");

    expect(lines().at(-1)).toBe(projects.map((project) => `${project.id}/`).join("  "));
  });

  it("una línea vacía solo repite el prompt", () => {
    const { session, lines } = setup();

    session.submit("   ");

    expect(lines()).toEqual(["jose@portfolio ~ $ "]);
  });

  it("un comando desconocido responde con el aviso", () => {
    const { session, lines } = setup();

    session.submit("foo");

    expect(lines()[1]).toBe(messages.en.console.unknownCommand("foo"));
  });

  it("clear limpia la transcripción", () => {
    const { session, lines } = setup();
    session.submit("help");

    session.submit("clear");

    expect(lines()).toEqual([]);
  });

  it("los efectos de un comando se ejecutan tras su salida (cd cierra y lleva a la sección)", () => {
    const { session, effects } = setup();

    session.submit("cd projects");

    expect(effects).toEqual([{ type: "close" }, { type: "scrollTo", sectionId: "Proyectos" }]);
  });

  it("open cv.pdf pide abrir el CV y deja el aviso", () => {
    const { session, effects, lines } = setup();

    session.submit("open cv.pdf");

    expect(lines()[1]).toBe("Opening cv.pdf in a new tab…");
    expect(effects).toEqual([{ type: "openCv" }]);
  });

  it("en inglés todo está traducido", () => {
    const { session, lines } = setup("en");

    session.submit("foo");

    expect(lines()[1]).toBe(messages.en.console.unknownCommand("foo"));
  });
});

describe("sesión de la consola: historial (flechas)", () => {
  it("las flechas arriba y abajo recorren los comandos anteriores", () => {
    const { session } = setup();
    session.submit("help");
    session.submit("ls");

    expect(session.previous("")).toBe("ls");
    expect(session.previous("")).toBe("help");
    expect(session.previous("")).toBe("help");
    expect(session.next()).toBe("ls");
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
    session.submit("ls");

    expect(session.previous("")).toBe("ls");
    expect(session.previous("")).toBe("help");
    expect(session.previous("")).toBe("help");
  });
});
