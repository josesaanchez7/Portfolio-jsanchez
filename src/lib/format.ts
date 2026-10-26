import type { Language } from "./language";
import type { SortableDate } from "../types/content";

const GROUP_SEPARATOR: Record<Language, string> = { es: ".", en: "," };

/**
 * Entero con separador de miles del idioma (es: 1.284 · en: 1,284).
 * Intl no agrupa los números de 4 cifras en español, por eso se hace a mano.
 */
export const formatInteger = (value: number, language: Language): string =>
  Math.trunc(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR[language]);

const MONTHS: Record<Language, readonly string[]> = {
  es: ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** "2026-08" → "ago. 2026" / "Aug 2026". Una fecha solo con año se devuelve tal cual. */
export const formatMonthYear = (date: SortableDate, language: Language): string => {
  const [year, month] = date.split("-");
  const name = month ? MONTHS[language][Number(month) - 1] : undefined;
  return name ? `${name} ${year}` : (year ?? date);
};
