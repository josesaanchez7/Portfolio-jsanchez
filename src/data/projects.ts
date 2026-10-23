import type { Project } from "../types/content";

export const projects: Project[] = [
  {
    id: "portfolio",
    title: { es: "Portfolio personal", en: "Personal portfolio" },
    description: {
      es: "Esta misma web: un portfolio para presentar mi perfil y mis proyectos, con tema claro y oscuro, navegación accesible y diseño responsive.",
      en: "This very website: a portfolio to showcase my profile and projects, with light and dark themes, accessible navigation and responsive design.",
    },
    tags: ["Astro", "TypeScript", "Tailwind CSS"],
    // TODO: confirma el estado ("done" | "in-progress" | "todo"). Aparece en el comando `proyectos` de la consola.
    status: "in-progress",
    // TODO: añade aquí la URL del repositorio (code) y de la web publicada (demo) cuando las tengas.
  },
];
