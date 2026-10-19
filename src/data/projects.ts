import type { Project } from "../types/content";

export const projects: Project[] = [
  {
    id: "portfolio",
    title: { es: "Portfolio personal", en: "Personal portfolio" },
    description: {
      es: "Esta misma web: un portfolio para presentar mi perfil y mis proyectos, con tema claro y oscuro, navegación accesible y diseño responsive.",
      en: "This very website: a portfolio to showcase my profile and projects, with light and dark themes, accessible navigation and responsive design.",
    },
    tags: ["React", "TypeScript", "Vite", "Sass"],
    // TEMPORAL (comparación de diseño): se elimina al terminar la migración.
    caseStudy: {
      problem: { es: "Problema de prueba para comparar el diálogo.", en: "Test problem to compare the dialog." },
      solution: { es: "Solución de prueba.", en: "Test solution." },
      decisions: [{ es: "Decisión uno", en: "Decision one" }, { es: "Decisión dos", en: "Decision two" }],
      results: [{ es: "Resultado uno", en: "Result one" }],
    },
    // TODO: añade aquí la URL del repositorio (code) y de la web publicada (demo) cuando las tengas.
  },
];
