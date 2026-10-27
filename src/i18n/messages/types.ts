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
    /** Recibe la ruta a la que se navega. */
    navigatingToNotFound: (path: string) => string;
    sudoGranted: (email: string) => string;
    sudoDenied: string;
    unknownCommand: (input: string) => string;
  };
  header: {
    homeLabel: (name: string) => string;
    navLabel: string;
    themeToLight: string;
    themeToDark: string;
    openMenu: string;
    closeMenu: string;
    /** Botón de la cabecera que abre la consola (Ctrl/⌘ + K). */
    consoleLabel: string;
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
    /** Carrusel de capturas (solo con dos o más). */
    carouselRole: string;
    slideRole: string;
    carouselLabel: (title: string) => string;
    slideLabel: (current: number, total: number) => string;
    previousImage: string;
    nextImage: string;
    goToImage: (current: number, total: number) => string;
    /** Botón sobre cada imagen que la abre en grande; recibe el texto alternativo de la imagen. */
    enlargeImage: (alt: string) => string;
    /** Vista ampliada (lightbox). */
    /** Sin título devuelve el nombre genérico del diálogo. */
    lightboxLabel: (title?: string) => string;
    closeImage: string;
    demo: string;
    code: string;
    moreTitle: string;
    moreDescription: string;
    moreButton: string;
  };
  experience: {
    work: string;
    education: string;
    certification: string;
    /** Etiqueta accesible del enlace a la credencial de una certificación. */
    credentialLabel: (title: string, issuer: string | undefined) => string;
    /** Encabezado de la fila de certificaciones (en plural). */
    certifications: string;
    /** Etiqueta accesible de la trayectoria dentro de la empresa. */
    careerPath: string;
    /** Estado de la tarjeta de un puesto, como en JIRA. */
    statusInProgress: string;
    statusDone: string;
    acceptanceCriteria: string;
    /** Prefijo accesible de la duración del puesto actual («En curso: 1 año y 0 meses»). */
    ongoing: string;
    nextCertification: string;
    /** Nodo superior del eje. */
    today: string;
    /** Nodo final del eje. */
    journeyStart: string;
    /** Etiqueta del tramo entre dos empresas cuando hubo un hueco: recibe la duración («3 meses»). */
    gap: (duration: string) => string;
    /** Píldora sobre la línea entre dos puestos. */
    promotion: string;
    /** Etiqueta accesible de una subtarea dentro de un puesto. */
    subtask: (title: string) => string;
  };
  /** Sección «Formación»: textos del pipeline. */
  education: {
    /** Nombre del «workflow» de la cabecera del pipeline. */
    workflowFile: string;
    /** Etiqueta accesible del estado del workflow. */
    workflowStatus: string;
    passing: string;
    running: string;
    stagesLabel: string;
    /** Texto de estado de cada etapa (para lectores de pantalla). */
    statusDone: string;
    statusRunning: string;
    statusUpcoming: string;
    /** En la cápsula de una etapa que aún no está completada. */
    comingSoon: string;
    detailsFor: (title: string) => string;
    center: string;
    issuer: string;
    dates: string;
    date: string;
    status: string;
    showCredential: string;
  };
  about: {
    /** Título accesible (oculto) de la tarjeta de presentación. */
    introLabel: string;
    /** Presentación breve. Las palabras clave van entre <k>…</k> (se pintan en el color de acento). */
    intro: (values: { name: string; job: string }) => string;
    locationLabel: string;
    localTime: string;
    languagesLabel: string;
    /** Texto accesible de la barra de nivel de un idioma («nivel 3 de 5»). */
    levelOf: (level: number, total: number) => string;
    numbersLabel: string;
    /** Etiqueta mono sobre el carrusel de tecnologías. */
    stackLabel: string;
  };
  contact: {
    intro: string;
    copyLabel: string;
    copied: string;
    copyError: string;
    sendEmail: string;
    /** Indicador junto al correo cuando `statusBar.available` es true. */
    available: string;
  };
  footer: {
    label: string;
    errors: (count: number) => string;
    testsPassing: (count: string) => string;
    available: string;
    notFound: string;
    notFoundLabel: string;
    console: string;
    consoleLabel: string;
  };
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
