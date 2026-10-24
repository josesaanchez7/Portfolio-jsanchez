// @vitest-environment node
// Vive en src/test y no en src/pages: Astro convierte en ruta cualquier archivo de pages.
import { describe, expect, it } from "vitest";
import { messages } from "../i18n/messages";
import { LANGUAGES } from "../lib/language";
import NotFound from "../pages/404.astro";
import { renderComponent } from "./render";

describe("página 404", () => {
  it("excluye la página de los buscadores y no lleva SEO de la home", async () => {
    const { document } = await renderComponent(NotFound);

    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:title"]')).toBeNull();
    expect(document.title).toBe(messages.es.notFound.title);
  });

  it("trae los dos idiomas: el español visible y el inglés oculto hasta que el script elija", async () => {
    const { document } = await renderComponent(NotFound);

    for (const language of LANGUAGES) {
      const section = document.querySelector(`[data-not-found="${language}"]`);
      expect(section, language).not.toBeNull();
      expect(section?.querySelector("h1")).toHaveTextContent(messages[language].notFound.heading);
      expect(section?.hasAttribute("hidden")).toBe(language !== "es");
    }
  });

  it("cada idioma ofrece volver a su versión de la web", async () => {
    const { document } = await renderComponent(NotFound);

    const homeLink = (language: string) =>
      document.querySelector(`[data-not-found="${language}"] a`)?.getAttribute("href");
    expect(homeLink("es")).toBe("/");
    expect(homeLink("en")).toBe("/en/");
  });

  it("no lleva pantalla de carga ni consola, ni deja el scroll bloqueado", async () => {
    const { document, html } = await renderComponent(NotFound);

    expect(document.querySelector("[data-boot-screen]")).toBeNull();
    expect(document.querySelector("[data-console]")).toBeNull();
    // El script del <head> solo activa la carga y la redirección de idioma en la home.
    expect(html).toMatch(/const home\s*=\s*false/);
  });
});
