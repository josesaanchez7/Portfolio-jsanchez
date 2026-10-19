import type { ExperienceItem } from "../types/content";

// Fuente: perfil de LinkedIn. Del más reciente al más antiguo dentro de cada tipo.
const TORCAL = { es: "Torcal Autoescuelas y Formación", en: "Torcal Autoescuelas y Formación" };

export const experience: ExperienceItem[] = [
  {
    kind: "work",
    title: { es: "QA Tester", en: "QA Tester" },
    organization: TORCAL,
    period: { es: "oct. 2025 – Actualidad", en: "Oct 2025 – Present" },
    description: {
      es: "Aseguro la calidad y el buen funcionamiento de las aplicaciones.",
      en: "I ensure the quality and proper functioning of applications.",
    },
  },
  {
    kind: "work",
    title: { es: "Soporte técnico", en: "Technical support" },
    organization: TORCAL,
    period: { es: "may. 2023 – sep. 2025", en: "May 2023 – Sep 2025" },
    description: {
      es: "Asistencia técnica a usuarios internos y externos, gestionando y resolviendo incidencias informáticas. Durante los últimos doce meses, también desempeñé labores de programación en PHP.",
      en: "Technical assistance for internal and external users, managing and resolving IT incidents. During the last twelve months, I also worked on PHP programming.",
    },
  },
  {
    kind: "education",
    title: {
      es: "Desarrollo de Aplicaciones Multiplataforma",
      en: "Multiplatform Application Development",
    },
    organization: { es: "Colegio San Jose Málaga", en: "Colegio San Jose Málaga" },
    period: { es: "2021 – 2024", en: "2021 – 2024" },
    description: {
      es: "Ciclo formativo de grado superior",
      en: "Higher vocational training programme",
    },
  },
  {
    kind: "education",
    title: { es: "Bachillerato Tecnológico", en: "Baccalaureate, Technology track" },
    organization: { es: "Colegio Santa Rosa de Lima", en: "Colegio Santa Rosa de Lima" },
    period: { es: "2018 – 2020", en: "2018 – 2020" },
  },
  {
    kind: "certification",
    title: { es: "API Testing Path (v12) Certificate", en: "API Testing Path (v12) Certificate" },
  },
];
