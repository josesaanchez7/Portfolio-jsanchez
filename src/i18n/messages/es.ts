import type { Messages } from "./types";

export const es: Messages = {
  meta: {
    title: "José Sánchez · Desarrollador de aplicaciones multiplataforma",
    description:
      "Portfolio de José Sánchez: graduado en Desarrollo de Aplicaciones Multiplataforma y QA Tester. Proyectos, experiencia y contacto.",
    ogDescription:
      "Soluciones eficientes y experiencias digitales modernas. Proyectos, experiencia y contacto.",
  },
  skipToContent: "Saltar al contenido",
  boot: { label: "Cargando portfolio", skip: "Saltar", skipLabel: "Saltar la animación de carga" },
  header: {
    homeLabel: (name) => `${name}, ir al inicio`,
    navLabel: "Principal",
    github: "GitHub (se abre en una pestaña nueva)",
    linkedin: "LinkedIn (se abre en una pestaña nueva)",
    themeToLight: "Cambiar a tema claro",
    themeToDark: "Cambiar a tema oscuro",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    switchLanguage: { es: "Cambiar idioma a español", en: "Cambiar idioma a inglés" },
  },
  hero: {
    eyebrowRole: (job, employer) => `${job} en ${employer}`,
    title: "Creo soluciones eficientes y <h>experiencias digitales</h> modernas.",
    lead: ({ role, job, employer }) =>
      `Soy ${role.toLowerCase()}. Actualmente trabajo como <b>${job}</b> en <b>${employer}</b>, asegurando la calidad y el buen funcionamiento de las aplicaciones.`,
    viewProjects: "Ver proyectos",
    contact: "Contactar",
    profileLinksLabel: "Enlaces de perfil",
    downloadCv: "Descargar CV",
    stackLabel: "stack",
    portraitAlt: (name) => `Ilustración de ${name}`,
  },
  projects: {
    techLabel: "Tecnologías",
    screenshotAlt: (title) => `Captura del proyecto ${title}`,
    demo: "Demo",
    code: "Código",
    viewDetail: "Ver detalle",
    closeDetail: "Cerrar detalle",
    problem: "Problema",
    solution: "Solución",
    decisions: "Decisiones técnicas",
    results: "Resultados",
    moreTitle: "Más proyectos en camino",
    moreDescription:
      "Voy añadiendo trabajo nuevo con el tiempo. Mientras tanto, puedes ver mi código en GitHub.",
    moreButton: "Ver GitHub",
  },
  experience: { work: "Experiencia", education: "Formación" },
  about: {
    intro: ({ fullName, nickname }) =>
      `Me llamo ${fullName}, aunque mis amigos me llaman ${nickname}. Empecé en la programación a los 16 años.`,
    current: ({ job, employer }) =>
      `Actualmente soy ${job} en ${employer}, asegurando la calidad y el buen funcionamiento de las aplicaciones.`,
  },
  contact: {
    intro:
      "¿Tienes un proyecto, una oferta o simplemente quieres saludar? Escríbeme y te respondo lo antes posible.",
    copyLabel: "Copiar correo electrónico",
    copied: "Correo copiado al portapapeles.",
    copyError: "No se pudo copiar. Selecciona el correo manualmente.",
    sendEmail: "Enviar correo",
  },
  footer: {
    label: "Pie de página",
    errors: (count) => `${count} ${count === 1 ? "error" : "errores"}`,
    testedTimes: (count) => `Probada ${count} veces`,
    available: "Disponible",
    debug: "Debug",
    notFound: "404",
    notFoundLabel: "Mostrar la página de error 404",
    console: "Ctrl+K",
    consoleLabel: "Abrir la consola interactiva (Ctrl+K)",
    comingSoon: "Próximamente",
  },
};
