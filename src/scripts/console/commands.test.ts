import { describe, expect, it } from "vitest";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { messages } from "../../i18n/messages";
import { COMMANDS, completeInput, normalizeInput, promptFor, runCommand, welcomeLine } from "./commands";
import type { CommandContext, ConsoleLine } from "./consoleTypes";

// La consola es siempre en inglés (ConsoleDialog fija el contexto así en las dos versiones de la web).
const buildContext = (overrides: Partial<CommandContext> = {}): CommandContext => ({
  t: messages.en,
  language: "en",
  localize: (text) => text.en,
  profile,
  projects,
  ...overrides,
});

const plain = (line: ConsoleLine) => line.map((segment) => segment.text).join("");
const run = (input: string, overrides: Partial<CommandContext> = {}) => runCommand(input, buildContext(overrides));
const texts = (input: string, overrides: Partial<CommandContext> = {}) => run(input, overrides).lines.map(plain);

describe("idioma", () => {
  it("la versión en español de la web usa los mismos textos de consola (en inglés)", () => {
    expect(messages.es.console).toBe(messages.en.console);
  });
});

describe("normalizeInput", () => {
  it("quita espacios sobrantes y colapsa los repetidos", () => {
    expect(normalizeInput("  open    cv.pdf  ")).toBe("open cv.pdf");
  });
});

describe("reconocimiento de comandos", () => {
  it("no distingue mayúsculas ni minúsculas", () => {
    expect(texts("HELP")).toEqual(texts("help"));
    expect(texts("LS")).toEqual(texts("ls"));
    expect(texts("open EMAIL.TXT")).toEqual(texts("open email.txt"));
  });

  it("ignora los espacios sobrantes", () => {
    expect(texts("  OPEN     email.txt ")).toEqual(texts("open email.txt"));
  });

  it("una línea vacía no produce salida", () => {
    expect(run("").lines).toEqual([]);
    expect(run("    ").lines).toEqual([]);
  });
});

describe("help y man", () => {
  it("lista los comandos de shell con su forma de uso en verde", () => {
    const { lines } = run("help");
    const names = lines.map((line) => line[0]?.text.trim());

    expect(names).toEqual(["ls [-l]", "cd <folder>", "open <file>", "wget cv.pdf", "pbcopy < email.txt", "clear", "exit"]);
    expect(lines.every((line) => line[0]?.tone === "ok")).toBe(true);
    expect(texts("help").join("\n")).toContain("list folders (sections) and files");
  });

  it("no se lista a sí mismo ni revela los atajos ocultos ni sudo", () => {
    const help = texts("help").join("\n");
    expect(help).not.toMatch(/^help\b/m);
    expect(help).not.toContain("sudo");
    expect(help).not.toMatch(/^projects\b/m);
  });

  it("man <comando> muestra solo esa entrada", () => {
    expect(texts("man cd")).toEqual([`cd <folder>  ${messages.en.console.help.cd}`]);
    expect(texts("man nothing")).toEqual(["No manual entry for nothing"]);
  });

  it("cada comando con ayuda tiene descripción", () => {
    for (const command of COMMANDS) {
      if (command.helpKey) expect(messages.en.console.help[command.helpKey].trim()).not.toBe("");
    }
  });
});

describe("ls", () => {
  it("en ~ muestra las secciones como carpetas (azul, con /) y los archivos", () => {
    const [line] = run("ls").lines;

    expect(plain(line ?? [])).toBe(
      "projects/  experience/  education/  about/  contact/  email.txt  cv.pdf  github.url  linkedin.url",
    );
    expect(line?.find((segment) => segment.text === "projects/")?.tone).toBe("info");
  });

  it("ls -l y ls -la dan un listado largo con permisos", () => {
    const lines = texts("ls -la");
    expect(lines[0]).toBe("drwxr-xr-x  jose  projects/");
    expect(lines).toContain("-rw-r--r--  jose  cv.pdf");
    expect(texts("ls -l")).toEqual(lines);
  });

  it("dentro de projects/ hay una carpeta por proyecto", () => {
    expect(texts("ls projects")).toEqual([projects.map((project) => `${project.id}/`).join("  ")]);
    expect(texts("ls", { cwd: "~/projects" })).toEqual(texts("ls projects"));
  });

  it("una ruta que no existe da el error de la shell", () => {
    expect(texts("ls secrets")).toEqual(["ls: no such file or directory: secrets"]);
  });
});

describe("cd", () => {
  it.each([
    ["cd projects", "Proyectos", "~/projects"],
    ["cd projects/", "Proyectos", "~/projects"],
    ["cd ~/experience", "Experience", "~/experience"],
    ["cd ./education", "Education", "~/education"],
    ["cd about", "SobreMi", "~/about"],
    ["cd /home/jose/contact", "Contacto", "~/contact"],
    // Los nombres en español siguen valiendo como alias.
    ["cd proyectos", "Proyectos", "~/projects"],
    ["cd formación", "Education", "~/education"],
    ["cd sobre-mi", "SobreMi", "~/about"],
  ])("«%s» cierra la consola, va a #%s y cambia a %s", (input, sectionId, cwd) => {
    expect(run(input)).toEqual({
      lines: [],
      cwd,
      effects: [{ type: "close" }, { type: "scrollTo", sectionId }],
    });
  });

  it.each(["cd", "cd ~", "cd ..", "cd /", "cd -"])("«%s» vuelve al inicio (~)", (input) => {
    expect(run(input, { cwd: "~/projects" })).toMatchObject({
      cwd: "~",
      effects: [{ type: "close" }, { type: "scrollTo", sectionId: "hero" }],
    });
  });

  it("no entra en archivos ni en carpetas que no existen", () => {
    expect(texts("cd cv.pdf")).toEqual(["cd: not a directory: cv.pdf (try open cv.pdf)"]);
    expect(texts("cd secrets")).toEqual(["cd: no such file or directory: secrets"]);
  });

  it("el nombre de una sección a secas es un atajo de cd", () => {
    expect(run("experience")).toEqual(run("cd experience"));
    expect(run("experiencia")).toEqual(run("cd experience"));
  });
});

describe("echo y prompt", () => {
  it("echo repite el texto y expande $USER, $HOME y $PWD", () => {
    expect(texts('echo "Hello $USER"')).toEqual(["Hello jose"]);
    expect(texts("echo $HOME")).toEqual(["/home/jose"]);
    expect(texts("echo $PWD", { cwd: "~/projects" })).toEqual(["/home/jose/projects"]);
  });

  it("el prompt incluye la carpeta actual", () => {
    expect(promptFor("~/projects")).toBe("jose@portfolio ~/projects $");
  });
});

describe("open", () => {
  it("open cv.pdf abre el PDF en otra pestaña (no lo descarga)", () => {
    expect(run("open cv.pdf").effects).toEqual([{ type: "openCv" }]);
    expect(run("xdg-open cv.pdf").effects).toEqual([{ type: "openCv" }]);
    expect(texts("open cv.pdf")).toEqual(["Opening cv.pdf in a new tab…"]);
  });

  it("open github.url y open linkedin.url abren el perfil", () => {
    expect(run("open github.url").effects).toEqual([{ type: "openUrl", url: profile.github }]);
    expect(run("open linkedin.url").effects).toEqual([{ type: "openUrl", url: profile.linkedin }]);
    expect(run("github").effects).toEqual(run("open github.url").effects);
    expect(texts("open github.url")).toEqual(["Opening GitHub in a new tab…"]);
  });

  it("open email.txt muestra el correo", () => {
    expect(texts("open email.txt")).toEqual([profile.email]);
  });

  it("open de una carpeta es como cd", () => {
    expect(run("open projects")).toEqual(run("cd projects"));
  });

  it("errores de open", () => {
    expect(texts("open")).toEqual(["open: missing operand. Type man open."]);
    expect(texts("open nothing.txt")).toEqual(["open: no such file or directory: nothing.txt"]);
  });
});

describe("wget y pbcopy", () => {
  it("wget, curl y el atajo cv descargan el CV", () => {
    const download = { lines: run("wget cv.pdf").lines, effects: [{ type: "downloadCv" }] };
    expect(run("wget cv.pdf")).toEqual(download);
    expect(run("curl -O cv.pdf")).toEqual(download);
    expect(run("cv")).toEqual(download);
    expect(texts("wget cv.pdf")).toEqual(["Downloading cv.pdf…"]);
  });

  it.each(["pbcopy < email.txt", "pbcopy<email.txt", "xclip email.txt", "xclip -sel c < email.txt", "email"])(
    "«%s» copia el correo (la interfaz confirma)",
    (input) => {
      expect(run(input)).toEqual({ lines: [], effects: [{ type: "copy", text: profile.email }] });
    },
  );

  it("pbcopy también copia los enlaces, pero no el PDF", () => {
    expect(run("pbcopy < github.url").effects).toEqual([{ type: "copy", text: profile.github }]);
    expect(texts("pbcopy < cv.pdf")).toEqual([
      "pbcopy: cv.pdf: only email.txt, github.url and linkedin.url can be copied",
    ]);
    expect(texts("pbcopy")).toEqual(["pbcopy: missing operand. Type man pbcopy."]);
  });

  it("los textos de confirmación de la copia", () => {
    expect(messages.en.console.copied("a@b.c")).toBe("✓ Copied to clipboard: a@b.c");
    expect(messages.en.console.copyFailed("a@b.c")).toContain("a@b.c");
  });
});

describe("clear y exit", () => {
  it("clear limpia la consola", () => {
    expect(run("clear")).toEqual({ lines: [], clear: true });
  });

  it("exit cierra la consola", () => {
    expect(run("exit")).toEqual({ lines: [], effects: [{ type: "close" }] });
  });
});

describe("comandos retirados", () => {
  it.each(["whoami", "history", "npm test", "run tests", "404", "pwd", "cat email.txt", "skills"])(
    "«%s» ya no existe",
    (input) => {
      expect(texts(input)[0]).toContain("zsh: command not found");
    },
  );

  it("README.md y skills.txt ya no existen", () => {
    expect(texts("open README.md")).toEqual(["open: no such file or directory: README.md"]);
    expect(texts("open skills.txt")).toEqual(["open: no such file or directory: skills.txt"]);
  });
});

describe("sudo", () => {
  it.each(["sudo hire", "sudo contratar"])("«%s» concede el permiso en verde", (input) => {
    const { lines } = run(input);
    expect(lines.map(plain)).toEqual([`Permission granted. Write to me at ${profile.email} 😉`]);
    expect(lines[0]?.[0]?.tone).toBe("ok");
  });

  it.each(["sudo", "sudo rm -rf /", "SUDO apt install job"])("«%s» responde con la pista", (input) => {
    expect(texts(input)).toEqual(["Nice try. Try sudo hire"]);
  });

  it("una palabra que solo empieza por «sudo» no cuenta como sudo", () => {
    expect(texts("sudoku")).toEqual(["zsh: command not found: sudoku. Type help."]);
  });
});

describe("comando desconocido", () => {
  it("responde como zsh, repitiendo lo escrito sin espacios sobrantes", () => {
    expect(texts("  Foo   BAR ")).toEqual(["zsh: command not found: Foo BAR. Type help."]);
  });

  it("devuelve el texto tal cual, sin interpretarlo", () => {
    const [line] = run('<img src=x onerror="alert(1)">').lines;
    expect(plain(line ?? [])).toBe('zsh: command not found: <img src=x onerror="alert(1)">. Type help.');
  });
});

describe("autocompletado (Tab)", () => {
  it("completa un comando único y deja un espacio", () => {
    expect(completeInput("wg", "en")).toEqual({ value: "wget ", options: [] });
  });

  it("con varias opciones completa lo común y las lista", () => {
    expect(completeInput("c", "en")).toEqual({ value: "c", options: ["cd", "clear"] });
  });

  it("completa carpetas tras cd (sin espacio, con /) y archivos tras pbcopy", () => {
    expect(completeInput("cd pro", "en")).toEqual({ value: "cd projects/", options: [] });
    expect(completeInput("cd ex", "en")).toEqual({ value: "cd experience/", options: [] });
    expect(completeInput("pbcopy < em", "en")).toEqual({ value: "pbcopy < email.txt ", options: [] });
  });

  it("open ofrece carpetas y archivos; sin coincidencias no cambia nada", () => {
    expect(completeInput("open c", "en").options).toEqual(["contact/", "cv.pdf"]);
    expect(completeInput("zz", "en")).toEqual({ value: "zz", options: [] });
  });
});

describe("bienvenida", () => {
  it("resalta help y ls en verde", () => {
    const line = welcomeLine(buildContext());
    expect(plain(line)).toBe("Welcome to jose@portfolio. Type help to see the commands or ls to look around.");
    expect(line.find((segment) => segment.text === "help")?.tone).toBe("ok");
    expect(line.find((segment) => segment.text === "ls")?.tone).toBe("ok");
  });
});
