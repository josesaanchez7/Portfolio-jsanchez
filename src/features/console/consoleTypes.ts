import type { Language, LocalizedText } from "../../lib/language";
import type { Messages } from "../../i18n/messages/types";
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
export type ConsoleEffect = "close" | "openCv" | "toggleDebug" | "show404";

export interface CommandResult {
  lines: readonly ConsoleLine[];
  /** Si se indica, las líneas aparecen una a una con esta pausa (en ms). */
  lineDelayMs?: number;
  effects?: readonly ConsoleEffect[];
  /** Limpia la zona de resultados. */
  clear?: boolean;
}

/** Todo lo que necesita un comando para decidir su salida. */
export interface CommandContext {
  t: Messages;
  language: Language;
  localize: (text: LocalizedText) => string;
  profile: Profile;
  projects: readonly Project[];
  debugEnabled: boolean;
  /** Hay una página 404 a la que navegar. */
  canShowNotFound: boolean;
}
