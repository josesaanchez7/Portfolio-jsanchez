import type { LocalizedText } from "../lib/language";

// Datos de estado que muestra la web (lugar y disponibilidad en Contacto).
export const statusBar = {
  location: { es: "Málaga, España", en: "Málaga, Spain" } satisfies LocalizedText,
  /** Muestra u oculta el indicador "Disponible". */
  available: true,
};
