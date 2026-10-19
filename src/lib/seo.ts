import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from "./language.ts";

/** Textos de la cabecera (<head>) de una página, por idioma. */
export interface SeoMeta {
  title: string;
  description: string;
  ogDescription: string;
}

/** Datos de la imagen Open Graph (public/og-es.jpg y public/og-en.jpg). */
const OG_IMAGE: Record<Language, string> = { es: "/og-es.jpg", en: "/og-en.jpg" };
const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
const OG_LOCALE: Record<Language, string> = { es: "es_ES", en: "en_US" };

/** Ruta de la versión de la web en cada idioma: "/" (idioma por defecto) y "/en/". */
export const pathForLanguage = (language: Language): string =>
  language === DEFAULT_LANGUAGE ? "/" : `/${language}/`;

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"]/g, (character) => HTML_ESCAPES[character] ?? character);

const joinUrl = (siteUrl: string, path: string): string => siteUrl.replace(/\/+$/, "") + path;

/**
 * URL pública del sitio, necesaria para las URL absolutas de Open Graph, canonical, hreflang y sitemap.
 * Prioridad: SITE_URL (dominio propio) → producción de Vercel → URL de la vista previa de Vercel.
 */
export const resolveSiteUrl = (env: Record<string, string | undefined>): string | null => {
  const withScheme = (host: string) => (/^https?:\/\//.test(host) ? host : `https://${host}`);

  if (env.SITE_URL) return withScheme(env.SITE_URL).replace(/\/+$/, "");
  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
    return withScheme(env.VERCEL_PROJECT_PRODUCTION_URL);
  }
  if (env.VERCEL_URL) return withScheme(env.VERCEL_URL);
  return null;
};

/**
 * Etiquetas de <head> para compartir y para buscadores. Sin `siteUrl` se omiten las que exigen
 * URL absoluta (canonical, hreflang, og:url) y la imagen queda con ruta relativa.
 */
export const buildSeoHead = (
  language: Language,
  meta: SeoMeta,
  siteUrl: string | null,
): string => {
  const absolute = (path: string) => (siteUrl ? joinUrl(siteUrl, path) : path);
  const tag = (attributes: Record<string, string>) =>
    `<meta ${Object.entries(attributes)
      .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
      .join(" ")} />`;

  const image = absolute(OG_IMAGE[language]);
  const tags = [
    tag({ property: "og:type", content: "website" }),
    tag({ property: "og:site_name", content: "José Sánchez" }),
    tag({ property: "og:title", content: meta.title }),
    tag({ property: "og:description", content: meta.ogDescription }),
    tag({ property: "og:locale", content: OG_LOCALE[language] }),
    ...LANGUAGES.filter((other) => other !== language).map((other) =>
      tag({ property: "og:locale:alternate", content: OG_LOCALE[other] }),
    ),
    tag({ property: "og:image", content: image }),
    tag({ property: "og:image:type", content: "image/jpeg" }),
    tag({ property: "og:image:width", content: String(OG_IMAGE_SIZE.width) }),
    tag({ property: "og:image:height", content: String(OG_IMAGE_SIZE.height) }),
    tag({ property: "og:image:alt", content: meta.title }),
    tag({ name: "twitter:card", content: "summary_large_image" }),
    tag({ name: "twitter:title", content: meta.title }),
    tag({ name: "twitter:description", content: meta.ogDescription }),
    tag({ name: "twitter:image", content: image }),
  ];

  if (siteUrl) {
    const pageUrl = absolute(pathForLanguage(language));
    tags.push(
      tag({ property: "og:url", content: pageUrl }),
      `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`,
      ...LANGUAGES.map(
        (other) =>
          `<link rel="alternate" hreflang="${other}" href="${escapeHtml(absolute(pathForLanguage(other)))}" />`,
      ),
      `<link rel="alternate" hreflang="x-default" href="${escapeHtml(absolute(pathForLanguage(DEFAULT_LANGUAGE)))}" />`,
    );
  }

  return tags.join("\n    ");
};

/** Rellena la plantilla index.html ({{lang}}, {{title}}, {{description}} y {{seo}}) para un idioma. */
export const applyTemplate = (
  template: string,
  language: Language,
  meta: SeoMeta,
  siteUrl: string | null,
): string =>
  template
    .split("{{lang}}").join(language)
    .split("{{title}}").join(escapeHtml(meta.title))
    .split("{{description}}").join(escapeHtml(meta.description))
    .split("{{seo}}").join(buildSeoHead(language, meta, siteUrl));

/** sitemap.xml con una entrada por idioma y sus alternativas (hreflang). */
export const buildSitemap = (siteUrl: string): string => {
  const alternates = (indent: string) =>
    [
      ...LANGUAGES.map(
        (language) =>
          `${indent}<xhtml:link rel="alternate" hreflang="${language}" href="${escapeHtml(joinUrl(siteUrl, pathForLanguage(language)))}" />`,
      ),
      `${indent}<xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(joinUrl(siteUrl, pathForLanguage(DEFAULT_LANGUAGE)))}" />`,
    ].join("\n");

  const urls = LANGUAGES.map(
    (language) =>
      `  <url>\n    <loc>${escapeHtml(joinUrl(siteUrl, pathForLanguage(language)))}</loc>\n${alternates("    ")}\n  </url>`,
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
};

export const buildRobots = (siteUrl: string): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${joinUrl(siteUrl, "/sitemap.xml")}\n`;
