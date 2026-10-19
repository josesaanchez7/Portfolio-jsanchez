import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { profile } from "./data/profile";
import { SECTIONS } from "./data/sections";
import Providers from "./Providers";
import { setReducedMotion } from "./test/reducedMotion";

const renderApp = () =>
  render(
    <Providers>
      <App />
    </Providers>,
  );

describe("App", () => {
  it("renderiza el hero y todas las secciones con su encabezado", () => {
    renderApp();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/experiencias digitales/i);
    for (const { id, title } of SECTIONS) {
      const section = document.getElementById(id);
      expect(section, `falta la sección #${id}`).not.toBeNull();
      expect(within(section as HTMLElement).getByRole("heading", { level: 2, name: title.es })).toBeInTheDocument();
    }
  });

  it("todos los enlaces internos apuntan a un elemento existente (sin '#' vacíos)", () => {
    const { container } = renderApp();

    const internalLinks = container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    expect(internalLinks.length).toBeGreaterThan(0);
    for (const link of internalLinks) {
      const href = link.getAttribute("href") ?? "";
      expect(href.length, "enlace con href='#'").toBeGreaterThan(1);
      expect(document.getElementById(href.slice(1)), `sin destino para ${href}`).not.toBeNull();
    }
  });

  it("los enlaces externos usan rel seguro", () => {
    const { container } = renderApp();

    for (const link of container.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')) {
      expect(link.rel).toContain("noopener");
    }
  });

  it("copiar el correo desde Contacto avisa al usuario", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Copiar correo electrónico" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Correo copiado");
    expect(await navigator.clipboard.readText()).toBe(profile.email);
  });

  it("solo muestra botones de proyecto cuando existe el enlace", () => {
    renderApp();
    const card = screen.getByRole("article", { name: "Portfolio personal" });

    // El proyecto actual no define demo ni código: no debe haber botones vacíos.
    expect(within(card).queryByRole("link", { name: "Demo" })).toBeNull();
    expect(within(card).queryByRole("link", { name: "Código" })).toBeNull();
  });
});

describe("App: pantalla de carga", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("tapa la web (inerte) mientras se ve y la libera al saltarla", () => {
    setReducedMotion(false);
    vi.useFakeTimers();
    const { container } = renderApp();
    const content = container.querySelector("#main")?.parentElement;
    expect(screen.getByRole("status", { name: "Cargando portfolio" })).toBeInTheDocument();
    expect(content).toHaveAttribute("inert");

    fireEvent.keyDown(document, { key: "Enter" });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.queryByRole("status", { name: "Cargando portfolio" })).toBeNull();
    expect(content).not.toHaveAttribute("inert");
  });

  it("con reduced-motion la web está disponible desde el primer momento", () => {
    setReducedMotion(true);
    const { container } = renderApp();

    expect(screen.queryByRole("status", { name: "Cargando portfolio" })).toBeNull();
    expect(container.querySelector("#main")?.parentElement).not.toHaveAttribute("inert");
  });
});
