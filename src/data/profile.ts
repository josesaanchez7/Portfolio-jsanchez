// Contenido personal. Los TODO marcan información pendiente de completar.
// Cada texto traducible lleva una versión en español (es) y otra en inglés (en).
import type { AboutFact, Profile } from "../types/content";

export const profile: Profile = {
  name: "Jose Sánchez",
  fullName: "José Francisco Sánchez",
  nickname: "Fran",
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

// Datos breves para "Sobre mí". Añade aquí tu enfoque, intereses, forma de trabajar y objetivos.
export const aboutFacts: AboutFact[] = [
  {
    label: { es: "Empecé a programar", en: "Started programming" },
    value: { es: "A los 16 años", en: "At 16" },
  },
  {
    label: { es: "Formación", en: "Education" },
    value: {
      es: "Desarrollo de Aplicaciones Multiplataforma",
      en: "Multiplatform Application Development",
    },
  },
  {
    label: { es: "Ahora", en: "Now" },
    value: { es: "QA Tester en Torcal", en: "QA Tester at Torcal" },
  },
];
