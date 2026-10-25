import type { Metric, SortableDate } from "../types/content";
import { workExperience } from "./experience";
import { stack } from "./stack";

/** Años completos desde una fecha "AAAA-MM" (o "AAAA") hasta `now`. */
export const fullYearsSince = (start: SortableDate, now: Date): number => {
  const [year, month] = start.split("-");
  const months = (now.getFullYear() - Number(year)) * 12 + (now.getMonth() + 1 - (month ? Number(month) : 1));
  return Math.max(0, Math.floor(months / 12));
};

// Cifras que salen de los datos de la web, así que son ciertas y se actualizan solas (se calculan al construir).
const firstJobStart = workExperience.map((item) => item.start).sort()[0];
const skillCount = new Set(stack.flatMap((category) => category.items.map((item) => item.es))).size;

const computed: Metric[] = [
  ...(firstJobStart
    ? [
        {
          value: fullYearsSince(firstJobStart, new Date()),
          prefix: "+",
          label: {
            es: "años de experiencia profesional",
            en: "years of professional experience",
          },
        },
      ]
    : []),
  {
    value: skillCount,
    label: {
      es: "tecnologías y herramientas",
      en: "technologies and tools",
    },
  },
];

// TODO: añade aquí tus cifras reales (aunque sean aproximadas); se muestran a continuación de las anteriores.
// Ejemplos: bugs reportados, tests automatizados, años programando…
//   { value: 150, prefix: "+", label: { es: "bugs reportados", en: "bugs reported" } },
const personal: Metric[] = [];

export const metrics: Metric[] = [...computed, ...personal];
