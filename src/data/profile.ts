// Contenido personal.
// Cada texto traducible lleva una versión en español (es) y otra en inglés (en).
import type { LanguageSkill, Profile } from "../types/content";
import { statusBar } from "./statusBar";

export const profile: Profile = {
  name: "José Sánchez",
  fullName: "José Francisco Sánchez Aldana",
  nickname: "José",
  role: {
    es: "Graduado en Desarrollo de Aplicaciones Multiplataforma",
    en: "Multiplatform Application Development graduate",
  },
  currentJob: { es: "QA Tester", en: "QA Tester" },
  employer: "Torcal",
  email: "josesanchezaldana02@gmail.com",
  github: "https://github.com/josesaanchez7",
  linkedin: "https://www.linkedin.com/in/josesanchezaldana",
};

/** Dónde vives y su huso horario (el reloj de «Sobre mí» muestra la hora local de aquí). */
export const location = {
  name: statusBar.location,
  timeZone: "Europe/Madrid",
};

/** Idiomas con su nivel; `segments` rellena la barra de 5 segmentos (A2 = 1 … C2 o nativo = 5). */
export const languages: LanguageSkill[] = [
  {
    name: { es: "Español", en: "Spanish" },
    level: { es: "Nativo", en: "Native" },
    segments: 5,
  },
  {
    name: { es: "Inglés", en: "English" },
    level: { es: "B2 Cambridge", en: "Cambridge B2" },
    segments: 3,
  },
];
