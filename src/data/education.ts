import type { LocalizedText } from "../lib/language";
import { monthIndex } from "../lib/tenure";
import type { Credential, ExperienceItem, SortableDate, UpcomingCertification } from "../types/content";

export type EducationKind = "education" | "certification";
/** Completada, en curso o por empezar: lo que muestran el check, el spinner y el círculo gris del pipeline. */
export type EducationStatus = "done" | "in-progress" | "upcoming";

/** Una etapa de la formación. Es la única fuente de datos de Formación: todas las versiones de la sección salen de aquí. */
export interface EducationStage {
  id: string;
  kind: EducationKind;
  status: EducationStatus;
  /** Una etapa desactivada no se muestra en ninguna versión. */
  enabled: boolean;
  /** Inicio y fin, solo para ordenar y calcular la duración ("AAAA-MM" o "AAAA"). En una certificación, la fecha en que se obtuvo. */
  start: SortableDate;
  end?: SortableDate;
  title: LocalizedText;
  /** Nombre corto para cápsulas y mensajes de commit (por defecto, `title`). */
  shortTitle?: LocalizedText;
  organization?: LocalizedText;
  /** Nombre corto del centro o emisor para la cápsula del pipeline (por defecto, `organization`). */
  shortOrganization?: LocalizedText;
  /** Fecha o rango tal como se muestra («2018 – 2020», «12 ago. 2026»). */
  period: LocalizedText;
  description?: LocalizedText;
  /** Enlace de verificación (solo certificaciones). */
  credential?: Credential;
  /** La etapa cuyo panel de detalles está abierto al cargar (por defecto, la primera). */
  openByDefault?: boolean;
}

// Fuente: CV y perfil de LinkedIn (fechas de estudios); la certificación, su página de verificación de Postman Academy.
const allStages: EducationStage[] = [
  {
    id: "bachillerato",
    kind: "education",
    status: "done",
    enabled: true,
    start: "2018",
    end: "2020",
    title: { es: "Bachillerato Tecnológico", en: "Baccalaureate, Technology track" },
    organization: { es: "Colegio Diocesano Santa Rosa De Lima", en: "Colegio Diocesano Santa Rosa De Lima" },
    shortOrganization: { es: "C.D.P Santa Rosa De Lima", en: "C.D.P Santa Rosa De Lima" },
    period: { es: "2018 – 2020", en: "2018 – 2020" },
  },
  {
    id: "dam",
    kind: "education",
    status: "done",
    enabled: true,
    start: "2021",
    end: "2024",
    title: {
      es: "Desarrollo de Aplicaciones Multiplataforma",
      en: "Multiplatform Application Development",
    },
    shortTitle: { es: "Desarrollo de Apps Multiplataforma", en: "Multiplatform App Development" },
    organization: { es: "Colegio Concertado San José", en: "Colegio Concertado San José" },
    period: { es: "2021 – 2024", en: "2021 – 2024" },
    description: {
      es: "Ciclo formativo de grado superior",
      en: "Higher vocational training programme",
    },
    openByDefault: true,
  },
  {
    id: "postman",
    kind: "certification",
    status: "done",
    enabled: true,
    start: "2026-08",
    end: "2026-08",
    title: {
      es: "API Testing Learning Path – Completion Certificate (V12)",
      en: "API Testing Learning Path – Completion Certificate (V12)",
    },
    shortTitle: { es: "API Testing Learning Path", en: "API Testing Learning Path" },
    organization: { es: "Postman Academy", en: "Postman Academy" },
    period: { es: "12 ago. 2026", en: "Aug 12, 2026" },
    credential: { url: "https://verify.skilljar.com/c/pu9b9suir8w2" },
  },
  // Etapa opcional «en curso»: solo se muestra si `enabled` es true (por defecto, no). Ajusta los datos cuando sea cierto.
  {
    id: "istqb",
    kind: "certification",
    status: "in-progress",
    enabled: false,
    start: "2026-10",
    title: { es: "ISTQB Foundation", en: "ISTQB Foundation" },
    period: { es: "en curso", en: "in progress" },
  },
];

/** Todas las etapas, también las desactivadas (para comprobar los datos). */
export const allEducationStages: readonly EducationStage[] = allStages;

/** Etapas activas, de la más antigua a la más reciente (el orden de las dos versiones). */
export const educationStages: EducationStage[] = allStages
  .filter((stage) => stage.enabled)
  .sort((a, b) => monthIndex(a.start) - monthIndex(b.start));

/** Nombre corto de la etapa. */
export const stageName = (stage: EducationStage): LocalizedText => stage.shortTitle ?? stage.title;

/** Años de la etapa tal como se ven en la cápsula: «2018 – 2020» para unos estudios y «2026» para una certificación. */
export const stageRange = (stage: EducationStage): string => {
  const year = (date: SortableDate) => date.split("-")[0] ?? date;
  const start = year(stage.start);
  const end = year(stage.end ?? stage.start);
  return stage.kind === "certification" || start === end ? end : `${start} – ${end}`;
};

// --- Adaptadores para el resto de la web (Experiencia comparte lista con las tarjetas de Formación) ---

const COMPLETED: LocalizedText = { es: "Completado: ", en: "Completed: " };

/** Etapas completadas, como entradas de `ExperienceItem` (la versión de tarjetas y la lista general de `experience.ts`). */
export const educationItems: ExperienceItem[] = educationStages
  .filter((stage) => stage.status === "done")
  .map((stage) => ({
    kind: stage.kind,
    start: stage.start,
    ...(stage.end !== undefined && { end: stage.end }),
    title: stage.title,
    ...(stage.kind === "certification" && stage.shortTitle && { shortTitle: stage.shortTitle }),
    ...(stage.organization && { organization: stage.organization }),
    period:
      stage.kind === "certification"
        ? { es: COMPLETED.es + stage.period.es, en: COMPLETED.en + stage.period.en }
        : stage.period,
    ...(stage.description && { description: stage.description }),
    ...(stage.credential && { credential: stage.credential }),
  }));

/** Certificaciones activas que aún no se han completado (el hueco discontinuo de la versión de tarjetas). */
export const upcomingFromStages: UpcomingCertification[] = educationStages
  .filter((stage) => stage.kind === "certification" && stage.status !== "done")
  .map((stage) => ({ title: stage.title, status: stage.period }));
