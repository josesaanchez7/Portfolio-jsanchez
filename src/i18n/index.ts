import { DEFAULT_LANGUAGE, parseLanguage, type Language, type LocalizedText } from "../lib/language";
import { messages } from "./messages";

/**
 * Idioma de una página y sus textos. Se llama desde el frontmatter de los componentes con
 * `Astro.currentLocale` (el idioma sale de la URL: "/" → es, "/en/" → en).
 */
export const getI18n = (locale: string | undefined) => {
  const language: Language = parseLanguage(locale) ?? DEFAULT_LANGUAGE;

  return {
    language,
    /** Textos de interfaz en el idioma de la página. */
    t: messages[language],
    /** Elige la versión del idioma de la página de un texto de contenido. */
    localize: (text: LocalizedText): string => text[language],
  };
};
