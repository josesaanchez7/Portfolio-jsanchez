// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderComponent } from "../../test/render";
import Footer from "./Footer.astro";

afterEach(() => {
  vi.useRealTimers();
});

describe("Footer (barra de estado)", () => {
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

  it("muestra los datos de la barra en español", async () => {
    const { getByRole } = await renderComponent(Footer);
    const footer = getByRole("contentinfo");

    expect(footer).toHaveTextContent("main");
    expect(footer).toHaveTextContent("0 errores");
    expect(footer).toHaveTextContent("Probada 1.284 veces");
    expect(footer).toHaveTextContent("España");
    expect(footer).toHaveTextContent("Disponible");
  });

  it("y en inglés", async () => {
    const { getByRole } = await renderComponent(Footer, { language: "en" });
    const footer = getByRole("contentinfo", { name: "Page footer" });

    expect(footer).toHaveTextContent("0 errors");
    expect(footer).toHaveTextContent("Tested 1,284 times");
    expect(footer).toHaveTextContent("Spain");
    expect(footer).toHaveTextContent("Available");
  });

  it("los iconos decorativos no se leen en voz alta", async () => {
    const { getByRole } = await renderComponent(Footer);

    const decorative = getByRole("contentinfo").querySelectorAll('[aria-hidden="true"]');
    expect(decorative.length).toBeGreaterThanOrEqual(6);
  });
});

describe("Footer: botones y enlaces", () => {
  it("ya no hay botón de debug", async () => {
    const { queryByRole, document } = await renderComponent(Footer);

    expect(queryByRole("button", { name: /debug/i })).toBeNull();
    expect(document.querySelector("[data-debug-toggle]")).toBeNull();
  });

  it("404 es un enlace a una ruta que no existe, dentro del idioma de la página", async () => {
    const es = await renderComponent(Footer);
    expect(es.getByRole("link", { name: "Mostrar la página de error 404" })).toHaveAttribute(
      "href",
      "/esta-pagina-no-existe/",
    );

    const en = await renderComponent(Footer, { language: "en" });
    expect(en.getByRole("link", { name: "Show the 404 error page" })).toHaveAttribute(
      "href",
      "/en/this-page-does-not-exist/",
    );
  });

  it("el botón de la consola está activo y el script lo reconoce", async () => {
    const { getByRole } = await renderComponent(Footer);
    const consoleButton = getByRole("button", { name: "Abrir la consola interactiva (Ctrl K o tecla `)" });

    expect(consoleButton).not.toHaveAttribute("aria-disabled");
    expect(consoleButton).toHaveAttribute("data-console-open");
  });

  it("sus nombres accesibles contienen el texto visible (404 y Consola)", async () => {
    const { getByRole } = await renderComponent(Footer);

    expect(getByRole("link", { name: /404/ })).toHaveTextContent("404");
    expect(getByRole("button", { name: /consola/i })).toHaveTextContent("Consola");
  });
});
