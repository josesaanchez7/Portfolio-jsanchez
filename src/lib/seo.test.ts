import { describe, expect, it } from "vitest";
import {
  applyTemplate,
  buildRobots,
  buildSeoHead,
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

describe("buildSeoHead", () => {
  const head = buildSeoHead("es", meta, "https://example.com");

  it("incluye Open Graph con imagen absoluta, tamaño y locale", () => {
    expect(head).toContain('property="og:image" content="https://example.com/og-es.jpg"');
    expect(head).toContain('property="og:image:width" content="1200"');
    expect(head).toContain('property="og:image:height" content="630"');
    expect(head).toContain('property="og:locale" content="es_ES"');
    expect(head).toContain('property="og:locale:alternate" content="en_US"');
    expect(head).toContain('property="og:url" content="https://example.com/"');
  });

  it("incluye la tarjeta de Twitter con imagen grande", () => {
    expect(head).toContain('name="twitter:card" content="summary_large_image"');
    expect(head).toContain('name="twitter:image" content="https://example.com/og-es.jpg"');
  });

  it("declara canonical y hreflang para cada idioma y x-default", () => {
    expect(head).toContain('<link rel="canonical" href="https://example.com/" />');
    expect(head).toContain('hreflang="es" href="https://example.com/"');
    expect(head).toContain('hreflang="en" href="https://example.com/en/"');
    expect(head).toContain('hreflang="x-default" href="https://example.com/"');
  });

  it("la versión en inglés apunta a /en/ y a su propia imagen", () => {
    const en = buildSeoHead("en", meta, "https://example.com");

    expect(en).toContain('<link rel="canonical" href="https://example.com/en/" />');
    expect(en).toContain('property="og:image" content="https://example.com/og-en.jpg"');
    expect(en).toContain('property="og:locale" content="en_US"');
    expect(en).toContain('property="og:locale:alternate" content="es_ES"');
  });

  it("escapa los textos para no romper los atributos", () => {
    expect(head).toContain("José &quot;JS&quot; Sánchez &amp; Co &lt;QA&gt;");
    expect(head).not.toContain('"JS"');
  });

  it("sin URL pública omite canonical, hreflang y og:url, y deja la imagen relativa", () => {
    const local = buildSeoHead("es", meta, null);

    expect(local).not.toContain("canonical");
    expect(local).not.toContain("hreflang");
    expect(local).not.toContain("og:url");
    expect(local).toContain('property="og:image" content="/og-es.jpg"');
  });
});

describe("applyTemplate", () => {
  const template = '<html lang="{{lang}}"><title>{{title}}</title><meta content="{{description}}">{{seo}}';

  it("rellena idioma, título, descripción y bloque SEO", () => {
    const html = applyTemplate(template, "en", meta, "https://example.com");

    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<title>José &quot;JS&quot; Sánchez &amp; Co &lt;QA&gt;</title>");
    expect(html).toContain('content="Descripción de prueba"');
    expect(html).toContain('hreflang="en"');
    expect(html).not.toContain("{{");
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
