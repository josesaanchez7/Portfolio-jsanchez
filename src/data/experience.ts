import type { ExperienceItem } from "../types/content";

export const experience: ExperienceItem[] = [
  {
    kind: "work",
    title: { es: "QA Tester", en: "QA Tester" },
    organization: { es: "Torcal", en: "Torcal" },
    period: { es: "Actualidad", en: "Present" },
    description: {
      es: "Aseguro la calidad y el buen funcionamiento de las aplicaciones.",
      en: "I ensure the quality and proper functioning of applications.",
    },
    // TODO: añade fecha de inicio y tus responsabilidades o herramientas de testing reales.
  },
  {
    kind: "education",
    title: {
      es: "Desarrollo de Aplicaciones Multiplataforma",
      en: "Multiplatform Application Development",
    },
    organization: {
      es: "Ciclo formativo de grado superior",
      en: "Higher vocational training programme",
    },
    // TODO: añade el centro y el año de graduación.
  },
];
