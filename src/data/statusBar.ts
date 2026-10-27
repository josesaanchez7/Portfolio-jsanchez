import type { LocalizedText } from "../lib/language";
import testCount from "./testCount.generated.json";

// Datos de la barra de estado del pie de página.
export const statusBar = {
  /** "Rama" mostrada con el icono de git. */
  branch: "main",
  errors: 0,
  /** Tests de la suite: lo escribe `pnpm test:count` (se ejecuta en cada `pnpm build`). */
  testsPassing: testCount.total,
  location: { es: "Málaga, España", en: "Málaga, Spain" } satisfies LocalizedText,
  /** Muestra u oculta el indicador "Disponible". */
  available: true,
};
