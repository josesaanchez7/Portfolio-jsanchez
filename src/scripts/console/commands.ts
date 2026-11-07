import { HERO_ID, type SectionId } from "../../data/sections";
import { parseTags } from "../../i18n/parseTags";
import type { ConsoleHelpKey } from "../../i18n/messages/types";
import type { Language, LocalizedText } from "../../lib/language";
import type {
  CommandContext,
  CommandResult,
  ConsoleLine,
  ConsoleSegment,
  ConsoleTone,
} from "./consoleTypes";

// ---------------------------------------------------------------------------
// La consola imita una shell de Linux sobre un sistema de archivos de mentira: el portfolio es la carpeta personal
// (~ = /home/jose), cada sección es una carpeta y hay unos pocos archivos (cv.pdf, email.txt, github.url…).
// Para añadir un comando: nuevo elemento en COMMANDS (y, si debe salir en la ayuda, su `helpKey` + descripción
// en src/i18n/messages).
// ---------------------------------------------------------------------------

const USER = "jose";
const HOME = `/home/${USER}`;
/** Carpeta inicial (y la del hero). */
export const HOME_DIR = "~";

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

// --- Sistema de archivos ---------------------------------------------------------------------------

interface Directory {
  sectionId: SectionId;
  /** Nombre en cada idioma; las rutas aceptan los dos (y los `extra`). */
  name: LocalizedText;
  extra?: readonly string[];
}

/** Carpetas: una por sección, en orden de página. La primera es la de proyectos. */
const DIRECTORIES: readonly Directory[] = [
  { sectionId: "Proyectos", name: { es: "proyectos", en: "projects" } },
  { sectionId: "Experience", name: { es: "experiencia", en: "experience" } },
  { sectionId: "Education", name: { es: "formacion", en: "education" }, extra: ["formación"] },
  { sectionId: "SobreMi", name: { es: "sobre-mi", en: "about" }, extra: ["sobre-mí", "sobremi", "about-me"] },
  { sectionId: "Contacto", name: { es: "contacto", en: "contact" } },
];

const FILES = ["email.txt", "cv.pdf", "github.url", "linkedin.url"] as const;
type FileName = (typeof FILES)[number];

type Place = { kind: "home" } | { kind: "dir"; dir: Directory };
type Entry = Place | { kind: "file"; name: FileName } | { kind: "none" };

const dirName = (dir: Directory, language: Language) => dir.name[language];
const dirPath = (dir: Directory, language: Language) => `${HOME_DIR}/${dirName(dir, language)}`;

/** Interpreta una ruta escrita por el usuario (relativa a ~ o a la carpeta actual), sin distinguir mayúsculas. */
const resolve = (raw: string | undefined): Entry => {
  if (raw === undefined) return { kind: "home" };
  let path = raw.toLowerCase().replace(/\/+$/, "");
  if (["", "~", "/", "-", ".", "..", HOME, "/home"].includes(path)) return { kind: "home" };
  path = path.replace(/^(~\/|\.\/|\.\.\/|\/home\/jose\/)/, "");

  const dir = DIRECTORIES.find((candidate) =>
    [candidate.name.es, candidate.name.en, ...(candidate.extra ?? [])].includes(path),
  );
  if (dir) return { kind: "dir", dir };
  const file = FILES.find((name) => name.toLowerCase() === path);
  return file ? { kind: "file", name: file } : { kind: "none" };
};

/** Ir a una carpeta (o a ~): cambia el prompt, cierra la consola y lleva la página a esa sección. */
const goTo = (place: Place, language: Language): CommandResult => ({
  lines: [],
  cwd: place.kind === "home" ? HOME_DIR : dirPath(place.dir, language),
  effects: [{ type: "close" }, { type: "scrollTo", sectionId: place.kind === "home" ? HERO_ID : place.dir.sectionId }],
});

/** Contenido de un archivo de texto (lo que muestra `open`); `null` para el PDF. */
const readFile = (name: FileName, context: CommandContext): ConsoleLine[] | null => {
  const { profile } = context;
  switch (name) {
    case "email.txt":
      return [text(profile.email)];
    case "github.url":
      return [[{ text: profile.github, href: profile.github }]];
    case "linkedin.url":
      return [[{ text: profile.linkedin, href: profile.linkedin }]];
    case "cv.pdf":
      return null;
  }
};

const openCv = (context: CommandContext): CommandResult => ({
  lines: [text(context.t.console.openingCv, "info")],
  effects: [{ type: "openCv" }],
});

const downloadCv = (context: CommandContext): CommandResult => ({
  lines: [text(context.t.console.downloadingCv, "info")],
  effects: [{ type: "downloadCv" }],
});

const openProfile = (name: "GitHub" | "LinkedIn", context: CommandContext): CommandResult => ({
  lines: [text(context.t.console.openingProfile(name), "info")],
  effects: [{ type: "openUrl", url: name === "GitHub" ? context.profile.github : context.profile.linkedin }],
});

/** `pbcopy` de un archivo: solo los de una línea (correo y enlaces). La interfaz confirma la copia. */
const copyFile = (name: FileName, context: CommandContext): CommandResult => {
  const { profile, t } = context;
  const values: Partial<Record<FileName, string>> = {
    "email.txt": profile.email,
    "github.url": profile.github,
    "linkedin.url": profile.linkedin,
  };
  const value = values[name];
  if (value === undefined) return error(t.console.cannotCopy(name));
  return { lines: [], effects: [{ type: "copy", text: value }] };
};

const error = (message: string): CommandResult => ({ lines: [text(message, "warn")] });

/** Argumentos que no son opciones (sin los que empiezan por «-»). */
const operands = (args: readonly string[]) => args.filter((arg) => !arg.startsWith("-"));

const joinInline = (segments: readonly ConsoleSegment[]): ConsoleLine =>
  segments.flatMap((segment, index) => (index ? [{ text: "  " }, segment] : [segment]));

/** Lo que hay en una carpeta: en ~, las secciones y los archivos; en proyectos/, una carpeta por proyecto. */
const listing = (context: CommandContext, place: Place, long: boolean): CommandResult => {
  const { language, projects } = context;
  const projectsDir = DIRECTORIES[0];
  const entries: ConsoleSegment[] =
    place.kind === "home"
      ? [
          ...DIRECTORIES.map((dir): ConsoleSegment => ({ text: `${dirName(dir, language)}/`, tone: "info" })),
          ...FILES.map((name): ConsoleSegment => ({ text: name, tone: name === "cv.pdf" ? "ok" : undefined })),
        ]
      : place.dir === projectsDir
        ? projects.map((project): ConsoleSegment => ({ text: `${project.id}/`, tone: "info" }))
        : [];

  if (entries.length === 0) return { lines: [] };
  if (!long) return { lines: [joinInline(entries)] };
  return {
    lines: entries.map((entry): ConsoleLine => [
      { text: `${entry.text.endsWith("/") ? "drwxr-xr-x" : "-rw-r--r--"}  ${USER}  `, tone: "dim" },
      entry,
    ]),
  };
};

/** Carpeta actual como lugar (para `ls` sin argumentos). */
const currentPlace = (cwd: string, language: Language): Place => {
  const dir = DIRECTORIES.find((candidate) => dirPath(candidate, language) === cwd);
  return dir ? { kind: "dir", dir } : { kind: "home" };
};

// --- Comandos ----------------------------------------------------------------------------------------

interface CommandDefinition {
  /** Textos que lo activan (la primera palabra, si `withArgs`), en minúsculas y con un solo espacio entre palabras. */
  aliases: readonly string[];
  /** Cómo aparece en la ayuda, con su forma de uso (p. ej. «cd <carpeta>»). */
  displayName: LocalizedText;
  /** Si existe, el comando aparece en `help`. */
  helpKey?: ConsoleHelpKey;
  /** Admite argumentos: se reconoce por la primera palabra y recibe el resto. */
  withArgs?: boolean;
  run: (context: CommandContext, args: readonly string[]) => CommandResult;
}

const same = (name: string): LocalizedText => ({ es: name, en: name });

export const COMMANDS: readonly CommandDefinition[] = [
  {
    // No sale en su propio listado: la consola lo ejecuta sola al abrirse.
    aliases: ["help", "man"],
    displayName: same("help"),
    withArgs: true,
    run: (context, args) => {
      const { t, localize } = context;
      const documented = COMMANDS.flatMap((command) => (command.helpKey ? [{ ...command, helpKey: command.helpKey }] : []));
      const [topic] = operands(args);

      // man <comando>: solo la entrada de ese comando.
      if (topic) {
        const command = documented.find((candidate) => candidate.aliases.includes(topic.toLowerCase()));
        if (!command) return error(t.console.noManual(topic));
        return {
          lines: [[{ text: `${localize(command.displayName)}  `, tone: "ok" }, { text: t.console.help[command.helpKey] }]],
        };
      }

      const entries = documented.map((command) => ({ name: localize(command.displayName), helpKey: command.helpKey }));
      const width = Math.max(0, ...entries.map((entry) => entry.name.length)) + 2;
      return {
        lines: entries.map(({ name, helpKey }): ConsoleLine => [
          { text: name.padEnd(width), tone: "ok" },
          { text: t.console.help[helpKey] },
        ]),
      };
    },
  },
  {
    aliases: ["ls", "ll", "dir"],
    displayName: same("ls [-l]"),
    helpKey: "ls",
    withArgs: true,
    run: (context, args) => {
      const long = args.some((arg) => /^-[a-z]*l/i.test(arg));
      const [target] = operands(args);
      if (target === undefined) return listing(context, currentPlace(context.cwd ?? HOME_DIR, context.language), long);
      const entry = resolve(target);
      if (entry.kind === "home" || entry.kind === "dir") return listing(context, entry, long);
      if (entry.kind === "file") return { lines: [text(entry.name)] };
      return error(context.t.console.noSuchFile("ls", target));
    },
  },
  {
    aliases: ["cd"],
    displayName: { es: "cd <carpeta>", en: "cd <folder>" },
    helpKey: "cd",
    withArgs: true,
    run: (context, args) => {
      const [target] = operands(args);
      const entry = resolve(target);
      if (entry.kind === "home" || entry.kind === "dir") return goTo(entry, context.language);
      if (entry.kind === "file") return error(context.t.console.notADirectory(entry.name));
      return error(context.t.console.noSuchFile("cd", target ?? ""));
    },
  },
  {
    aliases: ["open", "xdg-open", "start"],
    displayName: { es: "open <archivo>", en: "open <file>" },
    helpKey: "open",
    withArgs: true,
    run: (context, args) => {
      const [target] = operands(args);
      if (target === undefined) return error(context.t.console.missingOperand("open"));
      const entry = resolve(target);
      if (entry.kind === "home" || entry.kind === "dir") return goTo(entry, context.language);
      if (entry.kind === "none") return error(context.t.console.noSuchFile("open", target));
      if (entry.name === "cv.pdf") return openCv(context);
      if (entry.name === "github.url") return openProfile("GitHub", context);
      if (entry.name === "linkedin.url") return openProfile("LinkedIn", context);
      return { lines: readFile(entry.name, context) ?? [] };
    },
  },
  {
    aliases: ["wget", "curl"],
    displayName: same("wget cv.pdf"),
    helpKey: "wget",
    withArgs: true,
    run: (context, args) => {
      const [target] = operands(args);
      if (target === undefined) return error(context.t.console.missingOperand("wget"));
      const entry = resolve(target.replace(/^https?:\/\/[^/]+\//, ""));
      if (entry.kind === "file" && entry.name === "cv.pdf") return downloadCv(context);
      return error(context.t.console.noSuchFile("wget", target));
    },
  },
  {
    // Las formas reales («pbcopy < email.txt», «xclip email.txt») las reconoce
    // `copyTarget` antes de buscar el comando; esta entrada es la de la ayuda y la de «pbcopy» a secas.
    aliases: ["pbcopy", "xclip"],
    displayName: same("pbcopy < email.txt"),
    helpKey: "pbcopy",
    withArgs: true,
    run: ({ t }) => error(t.console.missingOperand("pbcopy")),
  },
  {
    aliases: ["echo"],
    displayName: same("echo"),
    withArgs: true,
    run: ({ cwd = HOME_DIR }, args) => ({
      lines: [
        text(
          args
            .join(" ")
            .replace(/^["']|["']$/g, "")
            .replace(/\$USER\b/g, USER)
            .replace(/\$HOME\b/g, HOME)
            .replace(/\$PWD\b/g, cwd.replace(/^~/, HOME)),
        ),
      ],
    }),
  },
  {
    aliases: ["clear", "cls"],
    displayName: same("clear"),
    helpKey: "clear",
    run: () => ({ lines: [], clear: true }),
  },
  {
    aliases: ["exit", "logout", "quit"],
    displayName: same("exit"),
    helpKey: "exit",
    run: () => ({ lines: [], effects: [{ type: "close" }] }),
  },

  // --- Atajos ocultos (no salen en la ayuda) -------------------------------------------------------
  // El nombre de una sección a secas equivale a `cd`; cv/github/linkedin/email, a abrir o copiar su archivo.
  ...DIRECTORIES.map(
    (dir): CommandDefinition => ({
      aliases: [dir.name.es, dir.name.en, ...(dir.extra ?? [])],
      displayName: dir.name,
      run: (context) => goTo({ kind: "dir", dir }, context.language),
    }),
  ),
  { aliases: ["cv"], displayName: same("cv"), run: downloadCv },
  { aliases: ["github"], displayName: same("github"), run: (context) => openProfile("GitHub", context) },
  { aliases: ["linkedin"], displayName: same("linkedin"), run: (context) => openProfile("LinkedIn", context) },
  { aliases: ["email", "correo"], displayName: same("email"), run: (context) => copyFile("email.txt", context) },
  {
    aliases: ["sudo contratar", "sudo hire"],
    displayName: same("sudo contratar"),
    run: ({ t, profile }) => ({ lines: [text(t.console.sudoGranted(profile.email), "ok")] }),
  },
];

/** Mensaje inicial de la consola. */
export const welcomeLine = ({ t }: CommandContext): ConsoleLine => taggedLine(t.console.welcome);

/** Quita espacios al principio y al final y colapsa los repetidos. */
export const normalizeInput = (raw: string): string => raw.trim().replace(/\s+/g, " ");

/** Prompt de la consola en una carpeta («jose@portfolio ~/proyectos $»). */
export const promptFor = (cwd: string): string => `${USER}@portfolio ${cwd} $`;

const XCLIP = String.raw`xclip(?: -sel(?:ection)? c(?:lipboard)?)?`;
const COPY_PATTERNS = [
  new RegExp(String.raw`^(?:pbcopy|${XCLIP}) ?< ?(\S+)$`),
  new RegExp(String.raw`^${XCLIP} (\S+)$`),
];

/** Si la línea es una forma de copiar al portapapeles, el archivo que se copia. */
const copyTarget = (key: string): string | null => {
  for (const pattern of COPY_PATTERNS) {
    const match = pattern.exec(key);
    if (match?.[1]) return match[1];
  }
  return null;
};

/** Ejecuta una línea escrita por el usuario. Función pura: devuelve datos, no toca la página. */
export const runCommand = (raw: string, context: CommandContext): CommandResult => {
  const input = normalizeInput(raw);
  if (!input) return { lines: [] };

  const key = input.toLowerCase();

  const toCopy = copyTarget(key);
  if (toCopy !== null) {
    const entry = resolve(toCopy);
    if (entry.kind === "file") return copyFile(entry.name, context);
    return error(context.t.console.noSuchFile("pbcopy", toCopy));
  }

  const exact = COMMANDS.find((candidate) => candidate.aliases.includes(key));
  if (exact) return exact.run(context, []);

  const [first = "", ...args] = input.split(" ");
  const command = COMMANDS.find((candidate) => candidate.withArgs && candidate.aliases.includes(first.toLowerCase()));
  if (command) return command.run(context, args);

  if (first.toLowerCase() === "sudo") return { lines: [text(context.t.console.sudoDenied)] };
  return { lines: [text(context.t.console.unknownCommand(input))] };
};

// --- Autocompletado (Tab) --------------------------------------------------------------------------

/** Comandos que propone el Tab en la primera palabra. */
const COMPLETABLE_COMMANDS = [
  "cd",
  "clear",
  "echo",
  "exit",
  "help",
  "ls",
  "man",
  "open",
  "pbcopy",
  "wget",
] as const;

const commonPrefix = (values: readonly string[]): string =>
  values.reduce((prefix, value) => {
    let index = 0;
    while (index < prefix.length && prefix[index]?.toLowerCase() === value[index]?.toLowerCase()) index += 1;
    return prefix.slice(0, index);
  });

export interface Completion {
  /** Nuevo valor de la línea de comandos. */
  value: string;
  /** Candidatos cuando hay más de uno (se muestran debajo, como en bash). */
  options: readonly string[];
}

/** Qué se puede escribir como argumento de cada comando. */
const argumentCandidates = (command: string, language: Language): readonly string[] => {
  const dirs = DIRECTORIES.map((dir) => `${dirName(dir, language)}/`);
  if (command === "cd" || command === "ls") return dirs;
  if (["pbcopy", "xclip", "wget", "curl"].includes(command)) return FILES;
  if (["open", "xdg-open", "start"].includes(command)) return [...dirs, ...FILES];
  if (command === "man" || command === "help") return COMPLETABLE_COMMANDS;
  return [];
};

/** Completa la última palabra con un comando, una carpeta o un archivo. Función pura. */
export const completeInput = (raw: string, language: Language): Completion => {
  const words = raw.replace(/^\s+/, "").split(" ");
  const last = words[words.length - 1] ?? "";
  const candidates =
    words.length === 1 ? COMPLETABLE_COMMANDS : argumentCandidates((words[0] ?? "").toLowerCase(), language);

  const prefix = last.toLowerCase();
  const matches = candidates.filter((candidate) => candidate.toLowerCase().startsWith(prefix));
  if (matches.length === 0) return { value: raw, options: [] };

  const before = raw.slice(0, raw.length - last.length);
  if (matches.length === 1) {
    const [match = ""] = matches;
    return { value: `${before}${match}${match.endsWith("/") ? "" : " "}`, options: [] };
  }
  const shared = commonPrefix(matches);
  return { value: `${before}${shared.length > last.length ? shared : last}`, options: matches };
};
