import { TEST_RUN_LINES } from "../../data/testRun";
import { parseTags } from "../../i18n/parseTags";
import type { ConsoleHelpKey } from "../../i18n/messages/types";
import type { LocalizedText } from "../../lib/language";
import { notFoundPath } from "../../lib/seo";
import type { HttpsUrl, ProjectStatus } from "../../types/content";
import type {
  CommandContext,
  CommandResult,
  ConsoleLine,
  ConsoleSegment,
  ConsoleTone,
} from "./consoleTypes";

// ---------------------------------------------------------------------------
// Aquí están TODOS los comandos. Para añadir uno: nuevo elemento en COMMANDS
// (y, si debe salir en la ayuda, su `helpKey` + descripción en src/i18n/messages).
// ---------------------------------------------------------------------------

/** Pausa entre líneas de `run tests`. */
const TEST_LINE_DELAY_MS = 140;

const TESTING_SKILLS = ["Playwright", "Node.js", "Postman", "Jira"] as const;
const DEVELOPMENT_SKILLS = ["Astro", "TypeScript", "Tailwind CSS", "Vite", "Git"] as const;

const STATUS_TONE: Record<ProjectStatus, ConsoleTone> = {
  done: "ok",
  "in-progress": "info",
  todo: "dim",
};

const TAG_TONE: Record<string, ConsoleTone> = { ok: "ok", dim: "dim", warn: "warn" };

const text = (value: string, tone?: ConsoleTone): ConsoleLine => [{ text: value, tone }];

/** Línea con marcas <ok>…</ok>, <dim>…</dim>, <warn>…</warn> convertidas en tonos. */
const taggedLine = (value: string, lineTone?: ConsoleTone): ConsoleLine =>
  parseTags(value, Object.keys(TAG_TONE)).map(
    (part): ConsoleSegment => ({
      text: part.text,
      tone: (part.tag ? TAG_TONE[part.tag] : undefined) ?? lineTone,
    }),
  );

interface CommandDefinition {
  /** Textos que lo activan, en minúsculas y con un solo espacio entre palabras. */
  aliases: readonly string[];
  /** Nombre que muestra la ayuda. */
  displayName: LocalizedText;
  /** Si existe, el comando aparece en `help`. */
  helpKey?: ConsoleHelpKey;
  run: (context: CommandContext) => CommandResult;
}

const same = (name: string): LocalizedText => ({ es: name, en: name });

export const COMMANDS: readonly CommandDefinition[] = [
  {
    aliases: ["help"],
    displayName: same("help"),
    helpKey: "help",
    run: ({ t, localize }) => {
      const entries = COMMANDS.flatMap((command) =>
        command.helpKey ? [{ name: localize(command.displayName), helpKey: command.helpKey }] : [],
      );
      const width = Math.max(0, ...entries.map((entry) => entry.name.length)) + 2;
      return {
        lines: entries.map(
          ({ name, helpKey }): ConsoleLine => [
            { text: name.padEnd(width), tone: "ok" },
            { text: t.console.help[helpKey] },
          ],
        ),
      };
    },
  },
  {
    aliases: ["whoami"],
    displayName: same("whoami"),
    helpKey: "whoami",
    run: ({ t, localize, profile }) => ({
      lines: [
        text(
          t.console.whoami({
            name: profile.name,
            job: localize(profile.currentJob),
            employer: profile.employer,
          }),
        ),
      ],
    }),
  },
  {
    aliases: ["skills"],
    displayName: same("skills"),
    helpKey: "skills",
    run: ({ t }) => ({
      lines: [
        [
          { text: t.console.skillsTesting, tone: "warn" },
          { text: ` ${TESTING_SKILLS.join(" · ")}` },
        ],
        [
          { text: t.console.skillsDevelopment, tone: "warn" },
          { text: ` ${DEVELOPMENT_SKILLS.join(" · ")}` },
        ],
      ],
    }),
  },
  {
    aliases: ["proyectos", "projects"],
    displayName: { es: "proyectos", en: "projects" },
    helpKey: "projects",
    run: ({ t, localize, projects }) => {
      const keyWidth = Math.max(0, ...projects.map((project) => project.id.length));
      return {
        lines: projects.map(
          (project): ConsoleLine => [
            { text: project.id.padEnd(keyWidth), tone: "dim" },
            { text: `  ${localize(project.title)}  ` },
            { text: t.console.projectStatus[project.status], tone: STATUS_TONE[project.status] },
          ],
        ),
      };
    },
  },
  {
    aliases: ["run tests", "npm test", "npx playwright test"],
    displayName: same("run tests"),
    helpKey: "tests",
    run: ({ localize }) => ({
      lines: TEST_RUN_LINES.map((line) =>
        taggedLine(typeof line.text === "string" ? line.text : localize(line.text), line.tone),
      ),
      lineDelayMs: TEST_LINE_DELAY_MS,
    }),
  },
  {
    aliases: ["contacto", "contact"],
    displayName: { es: "contacto", en: "contact" },
    helpKey: "contact",
    run: ({ profile }) => {
      const rows: { label: string; value: string; href?: HttpsUrl }[] = [
        { label: "email", value: profile.email },
        { label: "linkedin", value: profile.linkedin, href: profile.linkedin },
        { label: "github", value: profile.github, href: profile.github },
      ];
      return {
        lines: rows.map(
          ({ label, value, href }): ConsoleLine => [
            { text: `${label}:`.padEnd(10), tone: "dim" },
            { text: value, href },
          ],
        ),
      };
    },
  },
  {
    aliases: ["cv"],
    displayName: same("cv"),
    helpKey: "cv",
    run: ({ t }) => ({ lines: [text(t.console.openingCv)], effects: ["openCv", "close"] }),
  },
  {
    aliases: ["debug"],
    displayName: same("debug"),
    helpKey: "debug",
    run: ({ t, debugEnabled }) => ({
      lines: [text(debugEnabled ? t.console.debugOff : t.console.debugOn)],
      effects: ["toggleDebug"],
    }),
  },
  {
    aliases: ["404"],
    displayName: same("404"),
    helpKey: "notFound",
    // Navega a una ruta que no existe a propósito: la responde la página 404 real.
    run: ({ t, language }) => ({
      lines: [text(t.console.navigatingToNotFound(notFoundPath(language)))],
      effects: ["show404", "close"],
    }),
  },
  {
    aliases: ["clear"],
    displayName: same("clear"),
    helpKey: "clear",
    run: () => ({ lines: [], clear: true }),
  },
  {
    aliases: ["exit"],
    displayName: same("exit"),
    helpKey: "exit",
    run: () => ({ lines: [], effects: ["close"] }),
  },
  {
    // Oculto: no sale en la ayuda.
    aliases: ["sudo contratar", "sudo hire"],
    displayName: same("sudo contratar"),
    run: ({ t, profile }) => ({ lines: [text(t.console.sudoGranted(profile.email), "ok")] }),
  },
];

/** Mensaje inicial de la consola. */
export const welcomeLine = ({ t }: CommandContext): ConsoleLine => taggedLine(t.console.welcome);

/** Quita espacios al principio y al final y colapsa los repetidos. */
export const normalizeInput = (raw: string): string => raw.trim().replace(/\s+/g, " ");

/** Ejecuta una línea escrita por el usuario. Función pura: devuelve datos, no toca la página. */
export const runCommand = (raw: string, context: CommandContext): CommandResult => {
  const input = normalizeInput(raw);
  if (!input) return { lines: [] };

  const key = input.toLowerCase();
  const command = COMMANDS.find((candidate) => candidate.aliases.includes(key));
  if (command) return command.run(context);

  if (key.split(" ")[0] === "sudo") return { lines: [text(context.t.console.sudoDenied)] };
  return { lines: [text(context.t.console.unknownCommand(input))] };
};
