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

/** Ruta que no existe a propósito (botón 404 del footer y comando `404`): la sirve la página 404. */
const NOT_FOUND_SLUG: Record<Language, string> = {
  es: "esta-pagina-no-existe",
  en: "this-page-does-not-exist",
};

export const notFoundPath = (language: Language): string =>
  `${pathForLanguage(language)}${NOT_FOUND_SLUG[language]}/`;

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

/** Una etiqueta de <head> (meta o link) con sus atributos, lista para pintarse desde el layout. */
export interface SeoTag {
  tag: "meta" | "link";
  attributes: Record<string, string>;
}

/**
 * Etiquetas de <head> para compartir y para buscadores. Sin `siteUrl` se omiten las que exigen
 * URL absoluta (canonical, hreflang, og:url) y la imagen queda con ruta relativa.
 * Devuelve datos (no HTML): Astro escapa los atributos al pintarlos.
 */
export const buildSeoTags = (
  language: Language,
  meta: SeoMeta,
  siteUrl: string | null,
): SeoTag[] => {
  const absolute = (path: string) => (siteUrl ? joinUrl(siteUrl, path) : path);
  const metaTag = (attributes: Record<string, string>): SeoTag => ({ tag: "meta", attributes });
  const linkTag = (attributes: Record<string, string>): SeoTag => ({ tag: "link", attributes });

  const image = absolute(OG_IMAGE[language]);
  const tags = [
    metaTag({ property: "og:type", content: "website" }),
    metaTag({ property: "og:site_name", content: "José Sánchez" }),
    metaTag({ property: "og:title", content: meta.title }),
    metaTag({ property: "og:description", content: meta.ogDescription }),
    metaTag({ property: "og:locale", content: OG_LOCALE[language] }),
    ...LANGUAGES.filter((other) => other !== language).map((other) =>
      metaTag({ property: "og:locale:alternate", content: OG_LOCALE[other] }),
    ),
    metaTag({ property: "og:image", content: image }),
    metaTag({ property: "og:image:type", content: "image/jpeg" }),
    metaTag({ property: "og:image:width", content: String(OG_IMAGE_SIZE.width) }),
    metaTag({ property: "og:image:height", content: String(OG_IMAGE_SIZE.height) }),
    metaTag({ property: "og:image:alt", content: meta.title }),
    metaTag({ name: "twitter:card", content: "summary_large_image" }),
    metaTag({ name: "twitter:title", content: meta.title }),
    metaTag({ name: "twitter:description", content: meta.ogDescription }),
    metaTag({ name: "twitter:image", content: image }),
  ];

  if (siteUrl) {
    const pageUrl = absolute(pathForLanguage(language));
    tags.push(
      metaTag({ property: "og:url", content: pageUrl }),
      linkTag({ rel: "canonical", href: pageUrl }),
      ...LANGUAGES.map((other) =>
        linkTag({ rel: "alternate", hreflang: other, href: absolute(pathForLanguage(other)) }),
      ),
      linkTag({
        rel: "alternate",
        hreflang: "x-default",
        href: absolute(pathForLanguage(DEFAULT_LANGUAGE)),
      }),
    );
  }

  return tags;
};

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
