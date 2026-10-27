import type { Project } from "../types/content";
import testCount from "./testCount.generated.json";

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
      es: "Esta misma web: mi portfolio, generado con Astro como HTML estático. Está en español e inglés, con tema claro y oscuro, navegación accesible, una consola interactiva (Ctrl+K) y una pantalla de carga con aspecto de terminal.",
      en: "This very website: my portfolio, generated with Astro as static HTML. It comes in Spanish and English, with light and dark themes, accessible navigation, an interactive console (Ctrl+K) and a terminal-style loading screen.",
    },
    tags: ["Astro", "TypeScript", "Tailwind CSS", "Vitest"],
    // TODO: confirma el estado ("done" | "in-progress" | "todo"). Aparece en el comando `proyectos` de la consola.
    status: "in-progress",
    // Capturas de esta misma web (public/img/projects). Si el diseño cambia mucho, habrá que volver a hacerlas.
    images: [
      {
        src: "/img/projects/portfolio-inicio.webp",
        alt: {
          es: "Inicio de la web en tema oscuro: barra de navegación flotante, el título «Desarrollo software con mentalidad de QA», la foto de perfil y los botones «Ver proyectos» y «Descargar CV».",
          en: "Home of the website in dark theme: floating navigation bar, the headline “I build software with a QA mindset”, the profile photo and the “View projects” and “Download CV” buttons.",
        },
      },
      {
        src: "/img/projects/portfolio-claro.webp",
        alt: {
          es: "Inicio de la web en tema claro, con el mismo titular, la foto de perfil y los botones de acción.",
          en: "Home of the website in light theme, with the same headline, the profile photo and the action buttons.",
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
  {
    id: "portfolio-qa",
    title: { es: "Pruebas automatizadas del portfolio", en: "Portfolio test suite" },
    description: {
      es: `${testCount.total} tests de Vitest con Testing Library y jsdom: componentes, textos en español e inglés, consola y secuencia de carga. Cada compilación los ejecuta y se detiene si alguno falla.`,
      en: `${testCount.total} Vitest tests with Testing Library and jsdom: components, Spanish and English copy, console and loading sequence. Every build runs them and stops if any fails.`,
    },
    tags: ["Vitest", "Testing Library", "jsdom", "ESLint", "TypeScript"],
    status: "in-progress",
    featured: true,
    terminal: {
      title: "pnpm build",
      lines: [
        { text: "$ pnpm test:count", tone: "cmd" },
        { text: `✓ ${testCount.files} test files passed`, tone: "ok" },
        { text: `✓ ${testCount.total} tests passed`, tone: "ok" },
        { text: "$ astro check", tone: "cmd" },
        { text: "✓ 0 errors", tone: "ok" },
      ],
    },
    code: "https://github.com/josesaanchez7/Portfolio-jsanchez",
  },
];
