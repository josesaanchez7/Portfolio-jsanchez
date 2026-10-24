import type { ExperienceItem, SortableDate } from "../types/content";

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
    description: {
      es: "Diseño y ejecución de pruebas manuales y exploratorias sobre aplicaciones internas, validación de APIs y detección de incidencias funcionales, así como planificación y gestión de pruebas mediante JIRA, colaborando estrechamente con los equipos de desarrollo en entornos de metodologías ágiles y automatización de pruebas QA.",
      en: "Design and execution of manual and exploratory tests on internal applications, API validation and detection of functional issues, plus test planning and management with JIRA, working closely with development teams in agile-methodology environments and QA test automation.",
    },
  },
  {
    kind: "work",
    start: "2023-05",
    end: "2025-09",
    title: { es: "Soporte técnico / Programador", en: "Technical support / Developer" },
    organization: TORCAL,
    period: { es: "may. 2023 – sep. 2025", en: "May 2023 – Sep 2025" },
    description: {
      es: "Asistencia técnica a usuarios internos y externos, gestionando y resolviendo incidencias informáticas, así como desarrollo y mantenimiento de funcionalidades en PHP durante el último año del puesto.",
      en: "Technical assistance for internal and external users, managing and resolving IT incidents, plus developing and maintaining PHP features during the last year in the role.",
    },
  },
  {
    kind: "education",
    start: "2021",
    end: "2024",
    title: {
      es: "Desarrollo de Aplicaciones Multiplataforma",
      en: "Multiplatform Application Development",
    },
    organization: { es: "Colegio Concertado San José", en: "Colegio Concertado San José" },
    period: { es: "2021 – 2024", en: "2021 – 2024" },
    description: {
      es: "Ciclo formativo de grado superior",
      en: "Higher vocational training programme",
    },
  },
  {
    kind: "education",
    start: "2018",
    end: "2020",
    title: { es: "Bachillerato Tecnológico", en: "Baccalaureate, Technology track" },
    organization: { es: "C.D.P Santa Rosa de Lima", en: "C.D.P Santa Rosa de Lima" },
    period: { es: "2018 – 2020", en: "2018 – 2020" },
  },
  {
    kind: "certification",
    start: "2026-08",
    end: "2026-08",
    // Fuente: página de verificación de la credencial (la fecha es la de finalización que indica Postman Academy).
    title: {
      es: "API Testing Learning Path – Completion Certificate (V12)",
      en: "API Testing Learning Path – Completion Certificate (V12)",
    },
    organization: { es: "Postman Academy", en: "Postman Academy" },
    period: { es: "Completado: 12 ago. 2026", en: "Completed: Aug 12, 2026" },
    credential: { url: "https://verify.skilljar.com/c/pu9b9suir8w2" },
  },
];

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

/** Sección «Educación»: estudios y certificaciones. */
export const education: ExperienceItem[] = experience.filter((item) => item.kind !== "work");
