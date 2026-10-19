import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Plugin } from "vite";
import { messages } from "./src/i18n/messages/index.ts";
import { DEFAULT_LANGUAGE, LANGUAGES, languageFromPath } from "./src/lib/language.ts";
import { applyTemplate, buildRobots, buildSitemap, resolveSiteUrl } from "./src/lib/seo.ts";

/**
 * SEO y compartir en redes:
 * - rellena el título, la descripción, Open Graph, canonical y hreflang de index.html (plantilla con {{…}});
 * - genera una página por idioma (dist/en/index.html) con sus textos en el HTML, no solo vía JavaScript;
 * - genera sitemap.xml y robots.txt cuando se conoce la URL pública (SITE_URL o variables de Vercel).
 */
export const seoPlugin = (): Plugin => {
  const siteUrl = resolveSiteUrl(process.env);
  let template = "";
  let outDir = "";
  let isBuild = false;

  const write = (relativePath: string, content: string) => {
    const file = resolve(outDir, relativePath);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  };

  return {
    name: "portfolio-seo",

    configResolved(config) {
      isBuild = config.command === "build";
      outDir = resolve(config.root, config.build.outDir);
    },

    buildStart() {
      if (isBuild && !siteUrl) {
        this.warn(
          "SITE_URL no definida: se omiten canonical, hreflang, og:url, sitemap.xml y robots.txt. " +
            "En Vercel se rellena sola; en local, usa SITE_URL=https://tu-dominio pnpm build.",
        );
      }
    },

    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        template = html;
        // En desarrollo, /en/ debe verse en inglés; en el build, esta página es la del idioma por defecto.
        const language = (context.server && languageFromPath(context.originalUrl ?? "/")) || DEFAULT_LANGUAGE;
        return applyTemplate(html, language, messages[language].meta, siteUrl);
      },
    },

    // Se escribe al terminar el build, cuando Vite ya ha generado y vaciado dist/ (el orden de
    // generateBundle no garantiza que la plantilla procesada esté disponible).
    closeBundle() {
      if (!isBuild || !template) return;

      for (const language of LANGUAGES) {
        if (language === DEFAULT_LANGUAGE) continue;
        write(`${language}/index.html`, applyTemplate(template, language, messages[language].meta, siteUrl));
      }
      if (siteUrl) {
        write("sitemap.xml", buildSitemap(siteUrl));
        write("robots.txt", buildRobots(siteUrl));
      }
    },
  };
};
