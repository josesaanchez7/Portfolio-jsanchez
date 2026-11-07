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

  it("la navegación no lleva enlaces sociales (ni GitHub ni LinkedIn), ni en la cápsula ni en el menú móvil", async () => {
    const { document } = await renderComponent(Header);

    expect(document.querySelectorAll("a[target='_blank']")).toHaveLength(0);
    expect(document.querySelector("a[href*='github.com'], a[href*='linkedin.com']")).toBeNull();
    expect(document.body.innerHTML).not.toMatch(/GitHub|LinkedIn/i);
    // Quedan los enlaces de sección, el buscador, el tema y el idioma.
    expect(document.querySelectorAll("nav a[href^='#']")).toHaveLength(SECTIONS.length);
  });

  it("el menú móvil parte cerrado y expone su estado y destino", async () => {
    const { getByRole, document } = await renderComponent(Header);

    const toggle = getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "main-nav");
    expect(document.getElementById("main-nav")).not.toBeNull();
    expect(document.querySelector("[data-header]")).not.toHaveAttribute("data-menu-open");
  });

  it("es un panel flotante con indicador deslizante decorativo y sin barra de progreso", async () => {
    const { document } = await renderComponent(Header);

    const header = document.querySelector("[data-header]");
    expect(header).not.toHaveAttribute("style");
    expect(document.querySelector("[data-progress]")).toBeNull();
    const indicator = document.querySelector("[data-indicator]");
    expect(indicator).not.toBeNull();
    expect((indicator as HTMLElement).closest('[aria-hidden="true"]')).not.toBeNull();
    // El indicador y el hover van en azul de acento.
    expect((indicator as HTMLElement).className).toContain("bg-accent/15");
    // El texto del enlace con la píldora (señalado o activo) usa el mismo azul: `data-lit` lo pone el script.
    expect(document.querySelector("[data-nav-link]")?.className).toContain("hover:text-accent");
    expect(document.querySelector("[data-nav-link]")?.className).toContain("data-lit:text-accent");
    expect(document.querySelector("[data-nav-link]")?.className).not.toContain("aria-[current=true]:text-fg");
  });

  it("los enlaces del menú móvil entran escalonados (un retardo más por enlace)", async () => {
    const { document } = await renderComponent(Header);

    const steps = [...document.querySelectorAll<HTMLElement>("[data-nav-link]")].map((link) =>
      link.closest("li")?.getAttribute("style"),
    );
    expect(steps).toEqual(SECTIONS.map((_, index) => `--i:${index}`));
  });

  it("la cabecera es solo navegación: la consola y el idioma están en el pie", async () => {
    const { document } = await renderComponent(Header);

    expect(document.querySelector("[data-console-open]")).toBeNull();
    expect(document.querySelector("[data-language-switch]")).toBeNull();
    expect(document.querySelector("[data-palette-open], [data-palette-kbd]")).toBeNull();
  });

  it("no hay botón de tema: la web solo tiene modo oscuro", async () => {
    const { document } = await renderComponent(Header);

    expect(document.querySelector("[data-theme-toggle]")).toBeNull();
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
