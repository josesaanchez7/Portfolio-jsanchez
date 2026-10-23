/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// getViteConfig aplica la configuración de Astro (plugins de Vite, alias…) a Vitest, y permite
// renderizar componentes .astro con la Container API en los tests.
export default getViteConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
