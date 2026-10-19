import type { Language } from "./language";

const GROUP_SEPARATOR: Record<Language, string> = { es: ".", en: "," };

/**
 * Entero con separador de miles del idioma (es: 1.284 · en: 1,284).
 * Intl no agrupa los números de 4 cifras en español, por eso se hace a mano.
 */
export const formatInteger = (value: number, language: Language): string =>
  Math.trunc(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR[language]);
