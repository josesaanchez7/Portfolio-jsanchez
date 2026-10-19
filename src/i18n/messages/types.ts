import type { Language } from "../../lib/language";

/**
 * Textos de interfaz. Los textos con variables son funciones; las marcas <b>…</b> y <h>…</h>
 * se resuelven en <RichText> (nunca como HTML crudo).
 * El contenido del portfolio (proyectos, experiencia…) vive en src/data como LocalizedText.
 */
export interface Messages {
  meta: { title: string; description: string; ogDescription: string };
  skipToContent: string;
  boot: { label: string; skip: string; skipLabel: string };
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
  experience: { work: string; education: string };
  about: {
    intro: (values: { fullName: string; nickname: string }) => string;
    current: (values: { job: string; employer: string }) => string;
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
    comingSoon: string;
  };
}
