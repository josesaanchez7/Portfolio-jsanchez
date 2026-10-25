import type { Project } from "../types/content";

export const projects: Project[] = [
  {
    id: "iptvflix",
    title: { es: "IPTVFlix", en: "IPTVFlix" },
    description: {
      es: "Reproductor web de listas IPTV (M3U/HLS) con interfaz estilo Netflix. Reúne seis fuentes gratuitas de canales en abierto, elimina duplicados, comprueba qué canales funcionan y ofrece guía de programación, favoritos y «continuar viendo». Se puede instalar como PWA.",
      en: "Web player for IPTV playlists (M3U/HLS) with a Netflix-style interface. It gathers six free sources of free-to-air channels, removes duplicates, checks which channels work and offers a programme guide, favourites and \"continue watching\". It can be installed as a PWA.",
    },
    tags: ["React", "TypeScript", "Vite", "Tailwind CSS", "HLS.js"],
    // TODO: confirma el estado ("done" | "in-progress" | "todo"). Aparece en el comando `proyectos` de la consola.
    status: "done",
    // Carrusel de capturas (public/img/projects): vista general, escritorio y móvil.
    images: [
      {
        src: "/img/projects/iptvflix.webp",
        alt: {
          es: "IPTVFlix en un portátil y en un móvil: portada con el canal destacado y las filas de canales por categoría.",
          en: "IPTVFlix on a laptop and a phone: home screen with the featured channel and rows of channels by category.",
        },
      },
      {
        src: "/img/projects/iptvflix-escritorio.webp",
        alt: {
          es: "IPTVFlix en escritorio: barra superior con las fuentes de canales, el filtro «Solo disponibles», las categorías y el botón para cargar una lista; canal destacado con «Ver ahora» y «Mi lista».",
          en: "IPTVFlix on desktop: top bar with the channel sources, the “Only available” filter, categories and the button to load a list; featured channel with “Watch now” and “My list” buttons.",
        },
      },
      {
        src: "/img/projects/iptvflix-movil.webp",
        alt: {
          es: "IPTVFlix en móvil: pestañas con las fuentes, canal destacado con «Ver» y «Mi lista», filas de canales y barra de navegación inferior.",
          en: "IPTVFlix on mobile: tabs with the sources, featured channel with “Watch” and “My list” buttons, rows of channels and a bottom navigation bar.",
        },
      },
    ],
    code: "https://github.com/josesaanchez7/IPTV",
    demo: "https://iptv-flix.vercel.app",
  },
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
