import type { APIRoute } from "astro";
import { buildRobots } from "../lib/seo";

/** robots.txt que apunta al sitemap. Solo existe si se conoce la URL pública (SITE_URL o Vercel). */
export const GET: APIRoute = ({ site }) => {
  if (!site) return new Response(null, { status: 404 });
  return new Response(buildRobots(site.origin), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
