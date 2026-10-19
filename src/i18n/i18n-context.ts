import { createContext } from "react";
import type { Language, LocalizedText } from "../lib/language";
import type { Messages } from "./messages/types";

export interface I18nContextValue {
  language: Language;
  /** Cambia el idioma y lo recuerda para próximas visitas. */
  setLanguage: (language: Language) => void;
  /** Textos de interfaz en el idioma activo. */
  t: Messages;
  /** Elige la versión del idioma activo de un texto de contenido. */
  localize: (text: LocalizedText) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
