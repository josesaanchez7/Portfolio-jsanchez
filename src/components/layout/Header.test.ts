// @vitest-environment node
import { describe, expect, it } from "vitest";
import { SECTIONS } from "../../data/sections";
import { renderComponent } from "../../test/render";
import Header from "./Header.astro";

describe("Header", () => {
  it("muestra un enlace por sección", async () => {
    const { getByRole } = await renderComponent(Header);

    for (const { id, navLabel } of SECTIONS) {
      expect(getByRole("link", { name: navLabel.es })).toHaveAttribute("href", `#${id}`);
    }
  });

  it("el menú móvil parte cerrado y expone su estado y destino", async () => {
    const { getByRole, document } = await renderComponent(Header);

    const toggle = getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "main-nav");
    expect(document.getElementById("main-nav")).not.toBeNull();
    expect(document.querySelector("[data-header]")).not.toHaveAttribute("data-menu-open");
  });

  it("es una cápsula flotante con indicador deslizante y barra de progreso, ambos decorativos", async () => {
    const { document } = await renderComponent(Header);

    const header = document.querySelector("[data-header]");
    expect(header).toHaveAttribute("style", expect.stringContaining("--progress:0"));
    for (const selector of ["[data-indicator]", "[data-progress]"]) {
      const element = document.querySelector(selector);
      expect(element, selector).not.toBeNull();
      expect((element as HTMLElement).closest('[aria-hidden="true"]'), selector).not.toBeNull();
    }
  });

  it("los enlaces del menú móvil entran escalonados (un retardo más por enlace)", async () => {
    const { document } = await renderComponent(Header);

    const steps = [...document.querySelectorAll<HTMLElement>("[data-nav-link]")].map((link) =>
      link.closest("li")?.getAttribute("style"),
    );
    expect(steps).toEqual(SECTIONS.map((_, index) => `--i:${index}`));
  });

  it("tiene un botón para abrir la paleta de comandos con su atajo anunciado", async () => {
    const { getByRole } = await renderComponent(Header);

    const palette = getByRole("button", { name: "Abrir la paleta de comandos" });
    expect(palette).toHaveAttribute("data-palette-open");
    expect(palette).toHaveAttribute("aria-keyshortcuts", "Control+K Meta+K");
  });

  it("el botón de tema lleva las dos etiquetas para que el script alterne", async () => {
    const { getByRole } = await renderComponent(Header);

    const toggle = getByRole("button", { name: "Cambiar a tema claro" });
    expect(toggle).toHaveAttribute("data-label-to-light", "Cambiar a tema claro");
    expect(toggle).toHaveAttribute("data-label-to-dark", "Cambiar a tema oscuro");
  });

  it("el selector de idioma es un enlace a la otra versión de la web", async () => {
    const es = await renderComponent(Header);
    const toEnglish = es.getByRole("link", { name: "Cambiar idioma a inglés" });
    expect(toEnglish).toHaveAttribute("href", "/en/");
    expect(toEnglish).toHaveAttribute("hreflang", "en");
    expect(toEnglish).toHaveTextContent("EN");

    const en = await renderComponent(Header, { language: "en" });
    const toSpanish = en.getByRole("link", { name: "Switch language to Spanish" });
    expect(toSpanish).toHaveAttribute("href", "/");
    expect(toSpanish).toHaveTextContent("ES");
  });

  it("los enlaces externos usan rel seguro y los iconos no se leen en voz alta", async () => {
    const { document } = await renderComponent(Header);

    for (const link of document.querySelectorAll('a[target="_blank"]')) {
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    for (const svg of document.querySelectorAll("svg")) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });
});
