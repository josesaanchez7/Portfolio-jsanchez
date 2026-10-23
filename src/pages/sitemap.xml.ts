import type { APIRoute } from "astro";
import { buildSitemap } from "../lib/seo";

/** sitemap.xml con una entrada por idioma. Solo existe si se conoce la URL pública (SITE_URL o Vercel). */
export const GET: APIRoute = ({ site }) => {
  if (!site) return new Response(null, { status: 404 });
  return new Response(buildSitemap(site.origin), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
