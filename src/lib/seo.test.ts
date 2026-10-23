import { describe, expect, it } from "vitest";
import {
  buildRobots,
  buildSeoTags,
  buildSitemap,
  escapeHtml,
  pathForLanguage,
  resolveSiteUrl,
  type SeoMeta,
} from "./seo";

const meta: SeoMeta = {
  title: 'José "JS" Sánchez & Co <QA>',
  description: "Descripción de prueba",
  ogDescription: "Descripción para redes",
};

describe("pathForLanguage", () => {
  it("el español vive en / y el inglés en /en/", () => {
    expect(pathForLanguage("es")).toBe("/");
    expect(pathForLanguage("en")).toBe("/en/");
  });
});

describe("escapeHtml", () => {
  it("escapa los caracteres que rompen un atributo HTML", () => {
    expect(escapeHtml(`a & b < c > d "e"`)).toBe("a &amp; b &lt; c &gt; d &quot;e&quot;");
  });

  it("deja intactos los acentos y símbolos habituales", () => {
    expect(escapeHtml("José Sánchez · QA")).toBe("José Sánchez · QA");
  });
});

describe("resolveSiteUrl", () => {
  it("SITE_URL manda sobre las variables de Vercel", () => {
    expect(
      resolveSiteUrl({ SITE_URL: "https://mi-dominio.es/", VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }),
    ).toBe("https://mi-dominio.es");
  });

  it("añade https:// si SITE_URL no lleva esquema", () => {
    expect(resolveSiteUrl({ SITE_URL: "mi-dominio.es" })).toBe("https://mi-dominio.es");
  });

  it("en producción de Vercel usa el dominio de producción", () => {
    expect(
      resolveSiteUrl({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "portfolio.vercel.app", VERCEL_URL: "portfolio-abc.vercel.app" }),
    ).toBe("https://portfolio.vercel.app");
  });

  it("en una vista previa usa la URL de esa vista previa", () => {
    expect(resolveSiteUrl({ VERCEL_ENV: "preview", VERCEL_URL: "portfolio-abc.vercel.app" })).toBe(
      "https://portfolio-abc.vercel.app",
    );
  });

  it("sin ninguna variable devuelve null", () => {
    expect(resolveSiteUrl({})).toBeNull();
  });
});

describe("buildSeoTags", () => {
  const tags = buildSeoTags("es", meta, "https://example.com");
  const find = (key: "property" | "name", value: string) =>
    tags.filter((tag) => tag.attributes[key] === value);
  const content = (key: "property" | "name", value: string) =>
    find(key, value).map((tag) => tag.attributes.content);
  const links = (rel: string) => tags.filter((tag) => tag.tag === "link" && tag.attributes.rel === rel);

  it("incluye Open Graph con imagen absoluta, tamaño y locale", () => {
    expect(content("property", "og:image")).toEqual(["https://example.com/og-es.jpg"]);
    expect(content("property", "og:image:width")).toEqual(["1200"]);
    expect(content("property", "og:image:height")).toEqual(["630"]);
    expect(content("property", "og:locale")).toEqual(["es_ES"]);
    expect(content("property", "og:locale:alternate")).toEqual(["en_US"]);
    expect(content("property", "og:url")).toEqual(["https://example.com/"]);
  });

  it("incluye la tarjeta de Twitter con imagen grande", () => {
    expect(content("name", "twitter:card")).toEqual(["summary_large_image"]);
    expect(content("name", "twitter:image")).toEqual(["https://example.com/og-es.jpg"]);
  });

  it("declara canonical y hreflang para cada idioma y x-default", () => {
    expect(links("canonical").map((tag) => tag.attributes.href)).toEqual(["https://example.com/"]);
    expect(links("alternate").map((tag) => [tag.attributes.hreflang, tag.attributes.href])).toEqual([
      ["es", "https://example.com/"],
      ["en", "https://example.com/en/"],
      ["x-default", "https://example.com/"],
    ]);
  });

  it("la versión en inglés apunta a /en/ y a su propia imagen", () => {
    const en = buildSeoTags("en", meta, "https://example.com");
    const contentEn = (value: string) =>
      en.filter((tag) => tag.attributes.property === value).map((tag) => tag.attributes.content);

    expect(en.find((tag) => tag.attributes.rel === "canonical")?.attributes.href).toBe("https://example.com/en/");
    expect(contentEn("og:image")).toEqual(["https://example.com/og-en.jpg"]);
    expect(contentEn("og:locale")).toEqual(["en_US"]);
    expect(contentEn("og:locale:alternate")).toEqual(["es_ES"]);
  });

  it("entrega los textos tal cual: escapar los atributos es cosa del renderizado", () => {
    expect(content("property", "og:title")).toEqual([meta.title]);
  });

  it("sin URL pública omite canonical, hreflang y og:url, y deja la imagen relativa", () => {
    const local = buildSeoTags("es", meta, null);

    expect(local.some((tag) => tag.tag === "link")).toBe(false);
    expect(local.some((tag) => tag.attributes.property === "og:url")).toBe(false);
    expect(local.find((tag) => tag.attributes.property === "og:image")?.attributes.content).toBe("/og-es.jpg");
  });
});

describe("buildSitemap y buildRobots", () => {
  const sitemap = buildSitemap("https://example.com");

  it("lista una URL por idioma con sus alternativas", () => {
    expect(sitemap).toContain("<loc>https://example.com/</loc>");
    expect(sitemap).toContain("<loc>https://example.com/en/</loc>");
    expect(sitemap.match(/hreflang="x-default"/g)).toHaveLength(2);
    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  it("robots.txt permite todo y apunta al sitemap", () => {
    expect(buildRobots("https://example.com/")).toBe(
      "User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n",
    );
  });
});
