import type { LocalizedText } from "../lib/language";

interface SectionDefinition {
  /** Ancla de la sección (#id). Se conservan los ids históricos para no romper enlaces compartidos. */
  id: string;
  navLabel: LocalizedText;
  title: LocalizedText;
}

/** Secciones con título, en orden de página. De aquí salen la navegación y la numeración. */
export const SECTIONS = [
  {
    id: "Proyectos",
    navLabel: { es: "Proyectos", en: "Projects" },
    title: { es: "Proyectos", en: "Projects" },
  },
  {
    id: "Experience",
    navLabel: { es: "Experiencia", en: "Experience" },
    title: { es: "Experiencia y formación", en: "Experience and education" },
  },
  {
    id: "Stack",
    navLabel: { es: "Stack", en: "Stack" },
    title: { es: "Stack tecnológico", en: "Tech stack" },
  },
  {
    id: "SobreMi",
    navLabel: { es: "Sobre mí", en: "About me" },
    title: { es: "Sobre mí", en: "About me" },
  },
  {
    id: "Contacto",
    navLabel: { es: "Contacto", en: "Contact" },
    title: { es: "Contacto", en: "Contact" },
  },
] as const satisfies readonly SectionDefinition[];

export type SectionId = (typeof SECTIONS)[number]["id"];

/** El Hero no tiene título ni entrada en la navegación, pero es un ancla (brand del header). */
export const HERO_ID = "hero";

export const getSection = (id: SectionId) => {
  const index = SECTIONS.findIndex((section) => section.id === id);
  const section = SECTIONS[index];
  if (!section) throw new Error(`Sección desconocida: ${id}`);
  return { ...section, number: String(index + 1).padStart(2, "0") };
};
