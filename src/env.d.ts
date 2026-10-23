/// <reference types="astro/client" />

// Solo para herramientas que no entienden .astro (p. ej. ESLint con reglas de tipos al analizar los tests).
// En el editor y en `astro check` manda el tipado real de cada componente.
declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";

  const component: AstroComponentFactory;
  export default component;
}
