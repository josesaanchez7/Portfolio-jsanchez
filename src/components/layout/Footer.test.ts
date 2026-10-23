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

describe("Footer: botones", () => {
  it("Debug parte desactivado (el script lo alterna)", async () => {
    const { getByRole } = await renderComponent(Footer);

    expect(getByRole("button", { name: "Debug" })).toHaveAttribute("aria-pressed", "false");
  });

  it("404 queda preparado pero inactivo mientras no exista la página", async () => {
    const { getByRole } = await renderComponent(Footer);
    const notFound = getByRole("button", { name: "Mostrar la página de error 404" });

    expect(notFound).toHaveAttribute("aria-disabled", "true");
    expect(notFound).toHaveAttribute("title", "Próximamente");
  });

  it("el botón de la consola está activo y el script lo reconoce", async () => {
    const { getByRole } = await renderComponent(Footer);
    const consoleButton = getByRole("button", { name: "Abrir la consola interactiva (Ctrl+K)" });

    expect(consoleButton).not.toHaveAttribute("aria-disabled");
    expect(consoleButton).toHaveAttribute("data-console-open");
  });

  it("sus nombres accesibles contienen el texto visible (404 y Ctrl+K)", async () => {
    const { getByRole } = await renderComponent(Footer);

    expect(getByRole("button", { name: /404/ })).toHaveTextContent("404");
    expect(getByRole("button", { name: /Ctrl\+K/ })).toHaveTextContent("Ctrl+K");
  });
});
