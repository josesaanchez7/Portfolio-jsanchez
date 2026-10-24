import type { Language } from "../../lib/language";
import type { ProjectStatus } from "../../types/content";

/**
 * Textos de interfaz. Los textos con variables son funciones; las marcas <b>…</b> y <h>…</h>
 * se resuelven en <RichText> (nunca como HTML crudo).
 * El contenido del portfolio (proyectos, experiencia…) vive en src/data como LocalizedText.
 */
/** Comandos que aparecen en la ayuda de la consola. */
export type ConsoleHelpKey =
  | "help"
  | "whoami"
  | "skills"
  | "projects"
  | "tests"
  | "contact"
  | "cv"
  | "debug"
  | "notFound"
  | "clear"
  | "exit";

export interface Messages {
  meta: { title: string; description: string; ogDescription: string };
  skipToContent: string;
  boot: { label: string; skip: string; skipLabel: string };
  console: {
    /** Etiqueta accesible del diálogo. */
    title: string;
    inputLabel: string;
    placeholder: string;
    close: string;
    /** Admite <ok>…</ok> para resaltar el comando. */
    welcome: string;
    help: Record<ConsoleHelpKey, string>;
    whoami: (values: { name: string; job: string; employer: string }) => string;
    skillsTesting: string;
    skillsDevelopment: string;
    projectStatus: Record<ProjectStatus, string>;
    openingCv: string;
    debugOn: string;
    debugOff: string;
    /** Recibe la ruta a la que se navega. */
    navigatingToNotFound: (path: string) => string;
    sudoGranted: (email: string) => string;
    sudoDenied: string;
    unknownCommand: (input: string) => string;
  };
  header: {
    homeLabel: (name: string) => string;
    navLabel: string;
    github: string;
    linkedin: string;
    themeToLight: string;
    themeToDark: string;
    openMenu: string;
    closeMenu: string;
    /** Etiqueta accesible del selector, indexada por el idioma al que se cambia. */
    switchLanguage: Record<Language, string>;
  };
  hero: {
    eyebrowRole: (job: string, employer: string) => string;
    title: string;
    lead: (values: { role: string; job: string; employer: string }) => string;
    viewProjects: string;
    contact: string;
    profileLinksLabel: string;
    downloadCv: string;
    stackLabel: string;
    portraitAlt: (name: string) => string;
  };
  projects: {
    techLabel: string;
    screenshotAlt: (title: string) => string;
    demo: string;
    code: string;
    viewDetail: string;
    closeDetail: string;
    problem: string;
    solution: string;
    decisions: string;
    results: string;
    moreTitle: string;
    moreDescription: string;
    moreButton: string;
  };
  experience: {
    work: string;
    education: string;
    certification: string;
    credentialId: string;
    showCredential: string;
  };
  about: {
    /** Presentación y origen: cómo empezó. */
    intro: (values: { fullName: string }) => string;
    /** Recorrido hasta hoy. Admite <b>…</b>. */
    path: (values: { job: string; employer: string }) => string;
    /** Qué aporta combinar desarrollo y pruebas. */
    edge: string;
  };
  contact: {
    intro: string;
    copyLabel: string;
    copied: string;
    copyError: string;
    sendEmail: string;
  };
  footer: {
    label: string;
    errors: (count: number) => string;
    testedTimes: (count: string) => string;
    available: string;
    debug: string;
    notFound: string;
    notFoundLabel: string;
    console: string;
    consoleLabel: string;
  };
  /** Página 404: se elige el idioma en el navegador (un 404 no sabe a qué URL iba el visitante). */
  notFound: {
    title: string;
    heading: string;
    description: string;
    /** Prefijo del error de la terminal; le sigue la ruta pedida. */
    noSuchFile: string;
    bug: string;
    home: string;
  };
}
