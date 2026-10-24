// Contenido personal. Los TODO marcan información pendiente de completar.
// Cada texto traducible lleva una versión en español (es) y otra en inglés (en).
import type { AboutFact, Profile } from "../types/content";
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
  // TODO: confirma cuál de tus dos correos quieres mostrar
  // (antes: "josesanchezaldana7@gmail.com" en el Hero y "josesanchezaldana02@gmail.com" en Contacto).
  email: "josesanchezaldana02@gmail.com",
  github: "https://github.com/josesaanchez7",
  linkedin: "https://www.linkedin.com/in/josesanchezaldana",
};

// Datos breves de la tarjeta de "Sobre mí". La formación y el puesto actual ya están en Educación y Experiencia,
// y la ubicación sale de statusBar. El relato de la izquierda está en src/i18n/messages (about).
// Añade aquí intereses, forma de trabajar y objetivos.
export const aboutFacts: AboutFact[] = [
  {
    label: { es: "Ubicación", en: "Location" },
    value: statusBar.location,
  },
  {
    label: { es: "Enfoque", en: "Focus" },
    value: {
      es: "Pruebas manuales, exploratorias y de API; automatización con Playwright",
      en: "Manual, exploratory and API testing; automation with Playwright",
    },
  },
  {
    label: { es: "Idiomas", en: "Languages" },
    value: {
      es: "Español (nativo) · Inglés (B2 Cambridge)",
      en: "Spanish (native) · English (Cambridge B2)",
    },
  },
  {
    label: { es: "Habilidades", en: "Skills" },
    value: {
      es: "Trabajo en equipo y resolución de problemas",
      en: "Teamwork and problem solving",
    },
  },
];
