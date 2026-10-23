// @vitest-environment node
// Vive en src/test y no en src/pages: Astro convierte en ruta cualquier archivo de pages.
import { describe, expect, it } from "vitest";
import { SECTIONS } from "../data/sections";
import { messages } from "../i18n/messages";
import { LANGUAGES } from "../lib/language";
import { renderComponent } from "../test/render";
import Page from "../pages/[...lang]/index.astro";

describe.each(LANGUAGES)("página (%s)", (language) => {
  const render = () => renderComponent(Page, { language });

  it("declara el idioma y el título del documento", async () => {
    const { document } = await render();

    expect(document.documentElement.lang).toBe(language);
    expect(document.title).toBe(messages[language].meta.title);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      messages[language].meta.description,
    );
  });

  it("renderiza el hero y todas las secciones con su encabezado", async () => {
    const { document, getByRole } = await render();

    expect(getByRole("heading", { level: 1 })).toBeInTheDocument();
    for (const { id, title } of SECTIONS) {
      const section = document.getElementById(id);
      expect(section, `falta la sección #${id}`).not.toBeNull();
      expect(section?.querySelector("h2")).toHaveTextContent(title[language]);
    }
  });

  it("todos los enlaces internos apuntan a un elemento existente (sin '#' vacíos)", async () => {
    const { document } = await render();

    const internalLinks = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    expect(internalLinks.length).toBeGreaterThan(0);
    for (const link of internalLinks) {
      const href = link.getAttribute("href") ?? "";
      expect(href.length, "enlace con href='#'").toBeGreaterThan(1);
      expect(document.getElementById(href.slice(1)), `sin destino para ${href}`).not.toBeNull();
    }
  });

  it("los enlaces externos usan rel seguro", async () => {
    const { document } = await render();

    const external = document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]');
    expect(external.length).toBeGreaterThan(0);
    for (const link of external) {
      expect(link.rel).toContain("noopener");
    }
  });

  it("tiene el enlace para saltar al contenido, la consola y la pantalla de carga", async () => {
    const { document, getByRole } = await render();

    expect(getByRole("link", { name: messages[language].skipToContent })).toHaveAttribute("href", "#main");
    expect(document.getElementById("main")).not.toBeNull();
    expect(document.querySelector("dialog[data-console]")).not.toBeNull();
    expect(document.querySelector("[data-boot-screen]")).toHaveAttribute("aria-label", messages[language].boot.label);
  });

  it("la pantalla de carga contiene todo el guion, oculto, y el HTML no hay que ejecutarlo para verlo", async () => {
    const { document } = await render();

    const steps = document.querySelectorAll("[data-boot-screen] [data-step]");
    expect(steps.length).toBeGreaterThan(5);
    for (const step of steps) expect(step).toHaveAttribute("data-pending");
  });

  it("solo muestra botones de proyecto cuando existe el enlace", async () => {
    const { getByRole, queryByRole } = await render();
    const card = getByRole("article");

    // El proyecto actual no define demo ni código: no debe haber botones vacíos.
    expect(card.querySelector('a[href=""], a:not([href])')).toBeNull();
    expect(queryByRole("link", { name: messages[language].projects.demo })).toBeNull();
    expect(queryByRole("link", { name: messages[language].projects.code })).toBeNull();
  });
});
