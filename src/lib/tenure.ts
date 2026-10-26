import type { Language } from "./language";
import type { SortableDate } from "../types/content";

/** Meses desde el año 0 de una fecha "AAAA-MM" (o "AAAA": enero). */
export const monthIndex = (date: SortableDate): number => {
  const [year, month] = date.split("-");
  return Number(year) * 12 + (month ? Number(month) : 1);
};

/**
 * Meses transcurridos entre `start` y `end` (por defecto, `now`). Con `end` el periodo es cerrado: el mes
 * de fin cuenta entero (may. 2023 – sep. 2024 son 17 meses); sin `end` son los meses cumplidos hasta hoy
 * (oct. 2025 → oct. 2026 son 12).
 */
export const monthsBetween = (start: SortableDate, end: SortableDate | undefined, now: Date): number => {
  if (end !== undefined) return Math.max(0, monthIndex(end) - monthIndex(start) + 1);
  return Math.max(0, now.getFullYear() * 12 + now.getMonth() + 1 - monthIndex(start));
};

const UNITS: Record<Language, { year: [string, string]; month: [string, string]; and: string }> = {
  es: { year: ["año", "años"], month: ["mes", "meses"], and: "y" },
  en: { year: ["year", "years"], month: ["month", "months"], and: "and" },
};

/** "1 año y 0 meses", "5 meses", "2 years and 3 months". */
export const formatTenure = (totalMonths: number, language: Language): string => {
  const { year, month, and } = UNITS[language];
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const monthText = `${months} ${month[months === 1 ? 0 : 1]}`;
  if (years === 0) return monthText;
  return `${years} ${year[years === 1 ? 0 : 1]} ${and} ${monthText}`;
};
