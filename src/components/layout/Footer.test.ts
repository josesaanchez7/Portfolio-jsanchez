// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { profile } from "../../data/profile";
import { renderComponent } from "../../test/render";
import Footer from "./Footer.astro";

afterEach(() => {
  vi.useRealTimers();
});

describe("Footer (una sola fila)", () => {
  it("es el pie de página con una etiqueta accesible", async () => {
    const { getByRole } = await renderComponent(Footer);

    expect(getByRole("contentinfo", { name: "Pie de página" })).toBeInTheDocument();
  });

  it("muestra el copyright con el año actual calculado", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-06-15T12:00:00Z"));

    const { getByText } = await renderComponent(Footer);

    expect(getByText("© 2031 José Sánchez")).toBeInTheDocument();
  });

  it("es sencillo: sin franja de estado, sin pruebas, sin 404 y sin descarga del CV", async () => {
    const { getByRole, document } = await renderComponent(Footer);
    const footer = getByRole("contentinfo");

    expect(footer).not.toHaveTextContent("errores");
    expect(footer).not.toHaveTextContent("pruebas superadas");
    expect(footer).not.toHaveTextContent("main");
    expect(footer).not.toHaveTextContent("España");
    expect(footer).not.toHaveTextContent("Disponible");
    expect(footer.querySelector('a[href*="no-existe"]')).toBeNull();
    expect(footer.querySelector("a[download]")).toBeNull();
    expect(document.querySelector("[data-debug-toggle]")).toBeNull();
  });
});

describe("Footer: enlaces y botones", () => {
  it("los contactos son iconos con su nombre accesible", async () => {
    const { getByRole } = await renderComponent(Footer);

    expect(getByRole("link", { name: profile.email })).toHaveAttribute("href", `mailto:${profile.email}`);
    expect(getByRole("link", { name: "GitHub" })).toHaveAttribute("href", profile.github);
    expect(getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", profile.linkedin);
  });

  it("el botón de la consola abre la consola y anuncia el atajo", async () => {
    const { getByRole } = await renderComponent(Footer);
    const consoleButton = getByRole("button", { name: "Abrir la consola interactiva (Ctrl K o tecla `)" });

    expect(consoleButton).toHaveAttribute("data-console-open");
    expect(consoleButton).toHaveAttribute("aria-keyshortcuts", "Control+K Meta+K");
    expect(consoleButton).toHaveTextContent("Consola");
  });

  it("el selector de idioma es un enlace a la otra versión de la web", async () => {
    const es = await renderComponent(Footer);
    const toEnglish = es.getByRole("link", { name: "Cambiar idioma a inglés" });
    expect(toEnglish).toHaveAttribute("href", "/en/");
    expect(toEnglish).toHaveAttribute("hreflang", "en");
    expect(toEnglish).toHaveTextContent("EN");

    const en = await renderComponent(Footer, { language: "en" });
    const toSpanish = en.getByRole("link", { name: "Switch language to Spanish" });
    expect(toSpanish).toHaveAttribute("href", "/");
    expect(toSpanish).toHaveTextContent("ES");
  });

  it("volver arriba es un icono que enlaza al inicio", async () => {
    const { getByRole } = await renderComponent(Footer);

    expect(getByRole("link", { name: "Volver arriba" })).toHaveAttribute("href", "#hero");
  });

  it("los iconos decorativos no se leen en voz alta", async () => {
    const { getByRole } = await renderComponent(Footer);

    for (const icon of getByRole("contentinfo").querySelectorAll("svg")) {
      expect(icon.closest('[aria-hidden="true"]') ?? icon).toHaveAttribute("aria-hidden", "true");
    }
  });
});
