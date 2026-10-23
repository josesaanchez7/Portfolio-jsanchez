// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { DEFAULT_LANGUAGE, LANGUAGES } from "./src/lib/language.ts";
import { resolveSiteUrl } from "./src/lib/seo.ts";

// URL pública: SITE_URL (dominio propio) → producción de Vercel → URL de la vista previa de Vercel.
// Sin ella se omiten canonical, hreflang, og:url, sitemap.xml y robots.txt (ver src/lib/seo.ts).
const site = resolveSiteUrl(process.env) ?? undefined;

if (!site && process.argv.includes("build")) {
  console.warn(
    "[portfolio] SITE_URL no definida: se omiten canonical, hreflang, og:url, sitemap.xml y robots.txt. " +
      "En Vercel se rellena sola; en local, usa SITE_URL=https://tu-dominio pnpm build.",
  );
}

// https://astro.build/config
export default defineConfig({
  site,
  // vercel.json ya tenía trailingSlash: las páginas viven en "/" y "/en/".
  trailingSlash: "always",
  i18n: {
    locales: [...LANGUAGES],
    defaultLocale: DEFAULT_LANGUAGE,
    routing: { prefixDefaultLocale: false },
  },
  // Un solo CSS para toda la web: va dentro del HTML y no bloquea el primer pintado con una petición extra.
  build: { inlineStylesheets: "always" },
  vite: {
    plugins: [tailwindcss()],
  },
});
