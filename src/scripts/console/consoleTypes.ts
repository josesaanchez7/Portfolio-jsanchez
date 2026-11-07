import type { Language, LocalizedText } from "../../lib/language";
import type { Messages } from "../../i18n/messages/types";
import type { HERO_ID, SectionId } from "../../data/sections";
import type { HttpsUrl, Profile, Project } from "../../types/content";

/** Color de un fragmento: ok = verde, dim = gris, warn = amarillo, info = azul. Sin tono, texto normal. */
export type ConsoleTone = "ok" | "dim" | "warn" | "info";

/** Fragmento de una línea. El texto se pinta siempre como texto plano, nunca como HTML. */
export interface ConsoleSegment {
  text: string;
  tone?: ConsoleTone;
  /** Si existe, el fragmento es un enlace que se abre en otra pestaña. */
  href?: HttpsUrl;
}

export type ConsoleLine = readonly ConsoleSegment[];

/** Acciones que un comando pide a la interfaz (los comandos no tocan la página directamente). */
export type ConsoleEffect =
  /** Cierra la consola (el foco vuelve a quien la abrió). */
  | { type: "close" }
  /** Lleva la página a una sección (o al inicio, con `cd ~`); el foco pasa a ella. */
  | { type: "scrollTo"; sectionId: SectionId | typeof HERO_ID }
  /** Abre el CV (PDF) en otra pestaña para verlo. */
  | { type: "openCv" }
  /** Descarga el CV directamente, sin abrir otra pestaña. */
  | { type: "downloadCv" }
  /** Abre un enlace externo en otra pestaña. */
  | { type: "openUrl"; url: HttpsUrl }
  /** Copia un texto al portapapeles; la interfaz confirma (o avisa del error) con una línea nueva. */
  | { type: "copy"; text: string };

export interface CommandResult {
  lines: readonly ConsoleLine[];
  effects?: readonly ConsoleEffect[];
  /** Limpia la zona de resultados. */
  clear?: boolean;
  /** Nueva carpeta actual (tras `cd`): cambia el prompt. */
  cwd?: string;
}

/** Todo lo que necesita un comando para decidir su salida. */
export interface CommandContext {
  t: Messages;
  language: Language;
  localize: (text: LocalizedText) => string;
  profile: Profile;
  projects: readonly Project[];
  /** Carpeta actual («~», «~/proyectos»…). Sin indicar, «~». */
  cwd?: string;
}
