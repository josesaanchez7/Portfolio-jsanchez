import type { ExperienceItem } from "../types/content";

// Fuente: CV (descripciones y centros) y perfil de LinkedIn (fechas de estudios).
const TORCAL = {
  es: "Torcal Innovación y Seguridad SL",
  en: "Torcal Innovación y Seguridad SL",
};

export const experience: ExperienceItem[] = [
  {
    kind: "work",
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
    title: { es: "Bachillerato Tecnológico", en: "Baccalaureate, Technology track" },
    organization: { es: "C.D.P Santa Rosa de Lima", en: "C.D.P Santa Rosa de Lima" },
    period: { es: "2018 – 2020", en: "2018 – 2020" },
  },
  {
    kind: "certification",
    title: { es: "API Testing Path (v12) Certificate", en: "API Testing Path (v12) Certificate" },
  },
];
