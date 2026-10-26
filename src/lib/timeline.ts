import type { ExperienceItem } from "../types/content";
import { monthIndex } from "./tenure";

/** Meses sin trabajo entre dos empresas consecutivas (0 si se encadenan). */
export const monthsBetweenJobs = (older: Pick<ExperienceItem, "end">, newer: Pick<ExperienceItem, "start">): number =>
  older.end === undefined ? 0 : Math.max(0, monthIndex(newer.start) - (monthIndex(older.end) + 1));
