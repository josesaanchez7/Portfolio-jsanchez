import type { ExperienceItem, SortableDate, UpcomingCertification } from "../types/content";
import { educationItems, upcomingFromStages } from "./education";

// Fuente: CV (descripciones y centros) y perfil de LinkedIn (fechas de estudios).
const TORCAL = {
  es: "Torcal Innovación y Seguridad SL",
  en: "Torcal Innovación y Seguridad SL",
};

const items: ExperienceItem[] = [
  {
    kind: "work",
    start: "2025-10",
    title: { es: "QA Tester", en: "QA Tester" },
    organization: TORCAL,
    period: { es: "oct. 2025 – Actualidad", en: "Oct 2025 – Present" },
    ticket: "TOR-2025",
    promotion: true,
    highlights: [
      {
        es: "Diseño y ejecución de pruebas manuales y exploratorias sobre aplicaciones internas",
        en: "Design and execution of manual and exploratory tests on internal applications",
      },
      {
        es: "Validación de APIs y detección de incidencias funcionales",
        en: "API validation and detection of functional issues",
      },
      {
        es: "Planificación y gestión de pruebas mediante JIRA",
        en: "Test planning and management with JIRA",
      },
      {
        es: "Colaboración con los equipos de desarrollo en entornos ágiles y automatización de pruebas QA",
        en: "Close collaboration with development teams in agile environments and QA test automation",
      },
    ],
    tech: ["JIRA", "Postman", "Playwright"],
  },
  {
    kind: "work",
    start: "2023-05",
    end: "2025-09",
    title: { es: "Soporte técnico", en: "Technical support" },
    organization: TORCAL,
    period: { es: "may. 2023 – sep. 2025", en: "May 2023 – Sep 2025" },
    ticket: "TOR-2023",
    highlights: [
      {
        es: "Asistencia técnica a usuarios internos y externos",
        en: "Technical assistance for internal and external users",
      },
      {
        es: "Gestión y resolución de incidencias informáticas",
        en: "Management and resolution of IT incidents",
      },
    ],
    // Dentro del mismo puesto, durante su último año.
    subtasks: [
      {
        ticket: "TOR-2023-1",
        title: { es: "Desarrollo PHP", en: "PHP development" },
        label: "PHP",
        start: "2024-10",
        end: "2025-09",
        period: { es: "oct. 2024 – sep. 2025", en: "Oct 2024 – Sep 2025" },
        tech: ["PHP"],
      },
    ],
  },
  // La formación (estudios y certificaciones) vive en `education.ts`; aquí se añade a la lista general.
  ...educationItems,
];

/** Certificaciones activas aún sin completar (la etapa opcional «en curso» de `education.ts`, desactivada por defecto). */
export const upcomingCertifications: UpcomingCertification[] = upcomingFromStages;

/** Meses desde el año 0 de una fecha "AAAA-MM" (o "AAAA": el inicio vale enero y el fin, diciembre). */
const monthIndex = (date: SortableDate, defaultMonth: number): number => {
  const [year, month] = date.split("-");
  return Number(year) * 12 + (month ? Number(month) : defaultMonth);
};

const endIndex = ({ end }: ExperienceItem): number =>
  end === undefined ? Number.POSITIVE_INFINITY : monthIndex(end, 12);
const startIndex = ({ start }: ExperienceItem): number => monthIndex(start, 1);

/** Más reciente primero: lo que sigue en curso, luego por fin del periodo y, a igualdad, por inicio. */
export const byMostRecent = (a: ExperienceItem, b: ExperienceItem): number => {
  if (endIndex(a) === endIndex(b)) return startIndex(b) - startIndex(a);
  return endIndex(b) > endIndex(a) ? 1 : -1;
};

/** Todas las entradas, de la más reciente a la más antigua. */
export const experience: ExperienceItem[] = [...items].sort(byMostRecent);

/** Sección «Experiencia»: solo puestos de trabajo. */
export const workExperience: ExperienceItem[] = experience.filter((item) => item.kind === "work");

/** Sección «Formación»: estudios y certificaciones. */
export const education: ExperienceItem[] = experience.filter((item) => item.kind !== "work");
