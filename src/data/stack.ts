import type { StackCategory } from "../types/content";

// Solo tecnologías que aparecen en este proyecto. Añade aquí tu stack de backend,
// bases de datos o testing: las categorías sin elementos no se muestran.
const allCategories: StackCategory[] = [
  { label: { es: "Frontend", en: "Frontend" }, items: ["React", "TypeScript", "HTML", "CSS / Sass"] },
  { label: { es: "Backend", en: "Backend" }, items: [] },
  { label: { es: "Bases de datos", en: "Databases" }, items: [] },
  { label: { es: "Testing y calidad", en: "Testing and quality" }, items: [] },
  {
    label: { es: "Herramientas y despliegue", en: "Tools and deployment" },
    items: ["Git", "GitHub", "Vite", "ESLint"],
  },
];

export const stack: StackCategory[] = allCategories.filter(
  (category) => category.items.length > 0,
);
