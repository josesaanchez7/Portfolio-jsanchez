import type { LocalizedText } from "../lib/language";
import type { StackCategory } from "../types/content";

/** Nombre propio de tecnología: se escribe igual en todos los idiomas. */
const tech = (name: string): LocalizedText => ({ es: name, en: name });

// Frontend y herramientas: lo que usa este portfolio. Backend y testing: CV y perfil de LinkedIn.
// Añade aquí más tecnologías: las categorías sin elementos no se muestran.
const allCategories: StackCategory[] = [
  {
    label: { es: "Frontend", en: "Frontend" },
    items: [tech("React"), tech("TypeScript"), tech("HTML"), tech("CSS"), tech("Tailwind CSS")],
  },
  { label: { es: "Backend", en: "Backend" }, items: [tech("PHP")] },
  { label: { es: "Bases de datos", en: "Databases" }, items: [] },
  {
    label: { es: "Testing y calidad", en: "Testing and quality" },
    items: [
      { es: "Pruebas manuales", en: "Manual testing" },
      { es: "Pruebas exploratorias", en: "Exploratory testing" },
      { es: "Pruebas API", en: "API testing" },
      { es: "Planificación de pruebas", en: "Test planning" },
      tech("Jira"),
      { es: "Metodologías ágiles", en: "Agile methodologies" },
    ],
  },
  {
    label: { es: "Herramientas y despliegue", en: "Tools and deployment" },
    items: [tech("Git"), tech("GitHub"), tech("Vite"), tech("ESLint")],
  },
];

export const stack: StackCategory[] = allCategories.filter(
  (category) => category.items.length > 0,
);
