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
      es: "Esta misma web: mi portfolio, generado con Astro como HTML estático. Está en español e inglés, con tema claro y oscuro, navegación accesible, paleta de comandos (Ctrl+K), una consola interactiva y una pantalla de carga con aspecto de terminal.",
      en: "This very website: my portfolio, generated with Astro as static HTML. It comes in Spanish and English, with light and dark themes, accessible navigation, a command palette (Ctrl+K), an interactive console and a terminal-style loading screen.",
    },
    tags: ["Astro", "TypeScript", "Tailwind CSS", "Vitest"],
    // TODO: confirma el estado ("done" | "in-progress" | "todo"). Aparece en el comando `proyectos` de la consola.
    status: "in-progress",
    // Capturas de esta misma web (public/img/projects). Si el diseño cambia mucho, habrá que volver a hacerlas.
    images: [
      {
        src: "/img/projects/portfolio-inicio.webp",
        alt: {
          es: "Inicio de la web en tema oscuro: barra de navegación flotante, el título «Creo soluciones eficientes y experiencias digitales modernas» y la foto de perfil.",
          en: "Home of the website in dark theme: floating navigation bar, the headline “I build efficient solutions and modern digital experiences” and the profile photo.",
        },
      },
      {
        src: "/img/projects/portfolio-claro.webp",
        alt: {
          es: "Sección Stack en tema claro: dos filas de tecnologías en movimiento y tarjetas por categoría.",
          en: "Tech stack section in light theme: two moving rows of technologies and a card for each category.",
        },
      },
      {
        src: "/img/projects/portfolio-paleta.webp",
        alt: {
          es: "Paleta de comandos abierta con Ctrl+K: lista de secciones y acciones para buscar y ejecutar.",
          en: "Command palette opened with Ctrl+K: a list of sections and actions to search and run.",
        },
      },
      {
        src: "/img/projects/portfolio-consola.webp",
        alt: {
          es: "Consola interactiva con los comandos «whoami» y «run tests», que muestra cinco pruebas superadas.",
          en: "Interactive console running the “whoami” and “run tests” commands, showing five passing tests.",
        },
      },
      {
        src: "/img/projects/portfolio-movil.webp",
        alt: {
          es: "La web en móvil: la pantalla de inicio y el menú a pantalla completa.",
          en: "The website on mobile: the home screen and the full-screen menu.",
        },
      },
    ],
    code: "https://github.com/josesaanchez7/Portfolio-jsanchez",
    demo: "https://jose-sanchez.vercel.app",
  },
];
