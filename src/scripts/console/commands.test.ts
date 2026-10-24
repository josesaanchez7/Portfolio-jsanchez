import { describe, expect, it } from "vitest";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { stack } from "../../data/stack";
import { TEST_RUN_LINES } from "../../data/testRun";
import { messages } from "../../i18n/messages";
import type { Language } from "../../lib/language";
import type { Project } from "../../types/content";
import { COMMANDS, normalizeInput, runCommand, welcomeLine } from "./commands";
import type { CommandContext, ConsoleLine } from "./consoleTypes";

const buildContext = (language: Language = "es", overrides: Partial<CommandContext> = {}): CommandContext => ({
  t: messages[language],
  language,
  localize: (text) => text[language],
  profile,
  projects,
  debugEnabled: false,
  ...overrides,
});

const plain = (line: ConsoleLine) => line.map((segment) => segment.text).join("");
const run = (input: string, language: Language = "es", overrides: Partial<CommandContext> = {}) =>
  runCommand(input, buildContext(language, overrides));
const texts = (input: string, language: Language = "es", overrides: Partial<CommandContext> = {}) =>
  run(input, language, overrides).lines.map(plain);

describe("normalizeInput", () => {
  it("quita espacios sobrantes y colapsa los repetidos", () => {
    expect(normalizeInput("  run    tests  ")).toBe("run tests");
  });
});

describe("reconocimiento de comandos", () => {
  it("no distingue mayúsculas ni minúsculas", () => {
    expect(texts("HELP")).toEqual(texts("help"));
    expect(texts("WhoAmI")).toEqual(texts("whoami"));
  });

  it("ignora los espacios sobrantes", () => {
    expect(texts("   whoami   ")).toEqual(texts("whoami"));
    expect(run("  RUN     TESTS ").lines).toHaveLength(TEST_RUN_LINES.length);
  });

  it("una línea vacía no produce salida", () => {
    expect(run("").lines).toEqual([]);
    expect(run("    ").lines).toEqual([]);
  });
});

describe("help", () => {
  it("lista los comandos con el nombre en verde y su descripción", () => {
    const { lines } = run("help");

    for (const name of ["help", "whoami", "skills", "proyectos", "run tests", "contacto", "cv", "debug", "404", "clear", "exit"]) {
      const line = lines.find((candidate) => candidate[0]?.text.trim() === name);
      expect(line, `falta ${name}`).toBeDefined();
      expect(line?.[0]?.tone).toBe("ok");
    }
    expect(texts("help").join("\n")).toContain("muestra esta ayuda");
  });

  it("no revela el comando oculto sudo", () => {
    expect(texts("help").join("\n")).not.toContain("sudo");
  });

  it("muestra los nombres en inglés cuando el idioma es inglés", () => {
    const names = texts("help", "en").join("\n");

    expect(names).toContain("projects");
    expect(names).toContain("contact");
    expect(names).toContain("show this help");
  });

  it("cada comando con ayuda tiene descripción en ambos idiomas", () => {
    for (const language of ["es", "en"] as const) {
      for (const command of COMMANDS) {
        if (command.helpKey) expect(messages[language].console.help[command.helpKey].trim()).not.toBe("");
      }
    }
  });
});

describe("whoami", () => {
  it("presenta a Jose con el texto acordado", () => {
    expect(texts("whoami")).toEqual([
      "José Sánchez. QA Tester en Torcal y desarrollador multiplataforma. Pruebo aplicaciones y las construyo con Astro y TypeScript.",
    ]);
  });

  it("también en inglés", () => {
    expect(texts("whoami", "en")[0]).toContain("QA Tester at Torcal and multiplatform developer");
  });
});

describe("skills", () => {
  it("muestra dos líneas con las categorías en amarillo", () => {
    const { lines } = run("skills");

    expect(lines.map(plain)).toEqual([
      "Testing: Playwright · Node.js · Postman · Jira",
      "Desarrollo: Astro · TypeScript · Tailwind CSS · Vite · Git",
    ]);
    expect(lines.map((line) => line[0]?.tone)).toEqual(["warn", "warn"]);
  });

  it("solo menciona tecnologías que existen en el stack de la web", () => {
    const known = new Set(stack.flatMap((category) => category.items.map((item) => item.es)));
    const named = texts("skills").flatMap((line) => line.split(":")[1]?.split("·").map((name) => name.trim()) ?? []);

    expect(named.length).toBeGreaterThan(0);
    for (const name of named) expect(known.has(name), `${name} no está en data/stack`).toBe(true);
  });
});

describe("proyectos", () => {
  it("proyectos y projects dan lo mismo", () => {
    expect(texts("projects")).toEqual(texts("proyectos"));
  });

  it("muestra una línea por proyecto con clave, título y estado", () => {
    const { lines } = run("proyectos");

    expect(lines).toHaveLength(projects.length);
    const [first] = lines;
    expect(first?.[0]).toMatchObject({ text: projects[0]?.id, tone: "dim" });
    expect(plain(first ?? [])).toContain("Portfolio personal");
  });

  it("colorea el estado: Hecho en verde, En curso en azul, Por hacer en gris", () => {
    const sample: Project[] = (["done", "in-progress", "todo"] as const).map((status) => ({
      id: status,
      title: { es: `Proyecto ${status}`, en: `Project ${status}` },
      description: { es: "d", en: "d" },
      tags: [],
      status,
    }));
    const { lines } = run("proyectos", "es", { projects: sample });

    const statuses = lines.map((line) => line[line.length - 1]);
    expect(statuses).toEqual([
      { text: "Hecho", tone: "ok" },
      { text: "En curso", tone: "info" },
      { text: "Por hacer", tone: "dim" },
    ]);
  });
});

describe("run tests", () => {
  it.each(["run tests", "npm test", "npx playwright test", "NPX  Playwright  Test"])("«%s» muestra la batería", (input) => {
    expect(texts(input)).toEqual([
      "Running 5 tests using 1 worker",
      "  ✓ perfil › es QA Tester en Torcal",
      "  ✓ qa › automatiza con Playwright + Node",
      "  ✓ qa › prueba APIs con Postman",
      "  ✓ qa › reporta bugs claros en Jira",
      "  ✓ dev › desarrolla con Astro + TypeScript",
      "  5 passed (1.9s)",
    ]);
  });

  it("pide mostrar las líneas una a una con una pausa", () => {
    expect(run("run tests").lineDelayMs).toBeGreaterThan(0);
  });

  it("colorea los ✓ y «5 passed» en verde y el tiempo en gris", () => {
    const { lines } = run("run tests");

    expect(lines[1]?.find((segment) => segment.text === "✓")?.tone).toBe("ok");
    const last = lines[lines.length - 1] ?? [];
    expect(last.find((segment) => segment.text === "5 passed")?.tone).toBe("ok");
    expect(last.find((segment) => segment.text === "(1.9s)")?.tone).toBe("dim");
  });

  it("traduce los nombres de las pruebas", () => {
    expect(texts("run tests", "en")[1]).toBe("  ✓ profile › is a QA Tester at Torcal");
  });
});

describe("contacto", () => {
  it("contacto y contact dan lo mismo", () => {
    expect(texts("contact")).toEqual(texts("contacto"));
  });

  it("muestra el email como texto y LinkedIn y GitHub como enlaces", () => {
    const { lines } = run("contacto");
    const valueOf = (label: string) => lines.find((line) => line[0]?.text.startsWith(label))?.[1];

    expect(valueOf("email")).toEqual({ text: profile.email, href: undefined });
    expect(valueOf("linkedin")).toMatchObject({ text: profile.linkedin, href: profile.linkedin });
    expect(valueOf("github")).toMatchObject({ text: profile.github, href: profile.github });
  });
});

describe("cv", () => {
  it("escribe el aviso, abre el CV y cierra la consola", () => {
    const result = run("cv");

    expect(result.lines.map(plain)).toEqual(["Abriendo CHANGELOG.md…"]);
    expect(result.effects).toEqual(["openCv", "close"]);
  });
});

describe("debug", () => {
  it("lo activa y lo dice", () => {
    const result = run("debug");

    expect(result.lines.map(plain)).toEqual(["Modo debug activado."]);
    expect(result.effects).toEqual(["toggleDebug"]);
  });

  it("lo desactiva y lo dice si ya estaba activo", () => {
    expect(texts("debug", "es", { debugEnabled: true })).toEqual(["Modo debug desactivado."]);
  });
});

describe("404", () => {
  it("navega a una ruta que no existe y cierra la consola", () => {
    const result = run("404");

    expect(result.lines.map(plain)).toEqual(["Navegando a /esta-pagina-no-existe/…"]);
    expect(result.effects).toEqual(["show404", "close"]);
  });

  it("la ruta lleva el prefijo del idioma", () => {
    expect(run("404", "en").lines.map(plain)).toEqual(["Navigating to /en/this-page-does-not-exist/…"]);
  });
});

describe("clear y exit", () => {
  it("clear pide limpiar los resultados", () => {
    expect(run("clear")).toEqual({ lines: [], clear: true });
  });

  it("exit cierra la consola", () => {
    expect(run("exit")).toEqual({ lines: [], effects: ["close"] });
  });
});

describe("sudo", () => {
  it("sudo contratar concede el permiso en verde", () => {
    const { lines } = run("sudo contratar");

    expect(lines.map(plain)).toEqual([`Permiso concedido. Escríbeme a ${profile.email} 😉`]);
    expect(lines[0]?.[0]?.tone).toBe("ok");
  });

  it("sudo hire hace lo mismo en inglés", () => {
    expect(texts("sudo hire", "en")[0]).toBe(`Permission granted. Write to me at ${profile.email} 😉`);
  });

  it.each(["sudo", "sudo rm -rf /", "SUDO apt install trabajo"])("«%s» responde con la pista", (input) => {
    expect(texts(input)).toEqual(["Buen intento. Prueba con sudo contratar"]);
  });

  it("una palabra que solo empieza por «sudo» no cuenta como sudo", () => {
    expect(texts("sudoku")).toEqual(["comando no encontrado: sudoku. Escribe help."]);
  });
});

describe("comando desconocido", () => {
  it("repite lo escrito, sin espacios sobrantes y respetando las mayúsculas", () => {
    expect(texts("  Foo   BAR ")).toEqual(["comando no encontrado: Foo BAR. Escribe help."]);
  });

  it("devuelve el texto tal cual, sin interpretarlo", () => {
    const [line] = run('<img src=x onerror="alert(1)">').lines;

    expect(plain(line ?? [])).toBe('comando no encontrado: <img src=x onerror="alert(1)">. Escribe help.');
  });

  it("en inglés", () => {
    expect(texts("nope", "en")).toEqual(["command not found: nope. Type help."]);
  });
});

describe("bienvenida", () => {
  it("resalta help en verde", () => {
    const line = welcomeLine(buildContext());

    expect(plain(line)).toBe("Bienvenido. Escribe help para ver los comandos.");
    expect(line.find((segment) => segment.text === "help")?.tone).toBe("ok");
  });
});
