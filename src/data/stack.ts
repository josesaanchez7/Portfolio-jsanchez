import type { LocalizedText } from "../lib/language";
import type { StackCategory } from "../types/content";

/** Nombre propio de tecnología: se escribe igual en todos los idiomas. */
const tech = (name: string): LocalizedText => ({ es: name, en: name });

// Frontend y herramientas: lo que usa este portfolio. Backend y testing: CV, LinkedIn y lo que has indicado.
// Añade aquí más tecnologías: las categorías sin elementos no se muestran.
const allCategories: StackCategory[] = [
  {
    label: { es: "Frontend", en: "Frontend" },
    items: [tech("Astro"), tech("JavaScript"), tech("TypeScript"), tech("HTML"), tech("CSS"), tech("Tailwind CSS")],
  },
  {
    label: { es: "Backend", en: "Backend" },
    items: [tech("PHP"), tech("Java"), tech("Python"), tech("Node.js")],
  },
  { label: { es: "Bases de datos", en: "Databases" }, items: [] },
  {
    label: { es: "Testing y calidad", en: "Testing and quality" },
    items: [tech("Playwright"), tech("Postman"), tech("Jira")],
  },
  {
    label: { es: "Herramientas y despliegue", en: "Tools and deployment" },
    items: [tech("Git"), tech("GitHub"), tech("Vite"), tech("ESLint")],
  },
];

export const stack: StackCategory[] = allCategories.filter(
  (category) => category.items.length > 0,
);
