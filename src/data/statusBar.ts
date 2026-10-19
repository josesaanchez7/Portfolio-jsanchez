import type { LocalizedText } from "../lib/language";

// Datos de la barra de estado del pie de página.
export const statusBar = {
  /** "Rama" mostrada con el icono de git. */
  branch: "main",
  errors: 0,
  // TODO: dato de ejemplo. Sustitúyelo por el número real (o quita el elemento) antes de publicar.
  testRuns: 1284,
  location: { es: "Málaga, España", en: "Málaga, Spain" } satisfies LocalizedText,
  /** Muestra u oculta el indicador "Disponible". */
  available: true,
};
