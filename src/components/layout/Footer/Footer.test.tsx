import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Providers from "../../../Providers";
import Footer from "./Footer";

const renderFooter = (props: Parameters<typeof Footer>[0] = {}) =>
  render(
    <Providers>
      <Footer {...props} />
    </Providers>,
  );

afterEach(() => {
  vi.useRealTimers();
});

describe("Footer (barra de estado)", () => {
  it("es el pie de página con una etiqueta accesible", () => {
    renderFooter();

    expect(screen.getByRole("contentinfo", { name: "Pie de página" })).toBeInTheDocument();
  });

  it("muestra el copyright con el año actual calculado", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-06-15T12:00:00Z"));

    renderFooter();

    expect(screen.getByText("© 2031 José Sánchez")).toBeInTheDocument();
  });

  it("muestra los datos de la barra en español", () => {
    renderFooter();
    const footer = screen.getByRole("contentinfo");

    expect(footer).toHaveTextContent("main");
    expect(footer).toHaveTextContent("0 errores");
    expect(footer).toHaveTextContent("Probada 1.284 veces");
    expect(footer).toHaveTextContent("España");
    expect(footer).toHaveTextContent("Disponible");
  });

  it("y en inglés", () => {
    localStorage.setItem("language", "en");
    renderFooter();
    const footer = screen.getByRole("contentinfo", { name: "Page footer" });

    expect(footer).toHaveTextContent("0 errors");
    expect(footer).toHaveTextContent("Tested 1,284 times");
    expect(footer).toHaveTextContent("Spain");
    expect(footer).toHaveTextContent("Available");
  });

  it("los iconos decorativos no se leen en voz alta", () => {
    renderFooter();

    const decorative = screen.getByRole("contentinfo").querySelectorAll('[aria-hidden="true"]');
    expect(decorative.length).toBeGreaterThanOrEqual(6);
  });
});

describe("Footer: botón Debug", () => {
  it("alterna el modo debug y comunica su estado", async () => {
    const user = userEvent.setup();
    renderFooter();
    const debug = screen.getByRole("button", { name: "Debug" });
    expect(debug).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.dataset.debug).toBeUndefined();

    await user.click(debug);
    expect(debug).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.debug).toBe("true");

    await user.click(debug);
    expect(debug).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.dataset.debug).toBeUndefined();
  });

  it("se puede activar con el teclado (Tab + Enter y espacio)", async () => {
    const user = userEvent.setup();
    renderFooter();
    const debug = screen.getByRole("button", { name: "Debug" });

    await user.tab();
    expect(debug).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(debug).toHaveAttribute("aria-pressed", "true");

    await user.keyboard(" ");
    expect(debug).toHaveAttribute("aria-pressed", "false");
  });

  it("al desmontar deja la página sin el atributo de debug", async () => {
    const user = userEvent.setup();
    const { unmount } = renderFooter();
    await user.click(screen.getByRole("button", { name: "Debug" }));
    expect(document.documentElement.dataset.debug).toBe("true");

    unmount();

    expect(document.documentElement.dataset.debug).toBeUndefined();
  });
});

describe("Footer: botones 404 y consola", () => {
  it("quedan preparados pero inactivos mientras no exista su función", async () => {
    const user = userEvent.setup();
    renderFooter();
    const notFound = screen.getByRole("button", { name: "Mostrar la página de error 404" });
    const console = screen.getByRole("button", { name: "Abrir la consola interactiva (Ctrl+K)" });

    expect(notFound).toHaveAttribute("aria-disabled", "true");
    expect(console).toHaveAttribute("aria-disabled", "true");
    expect(notFound).toHaveAttribute("title", "Próximamente");
    await expect(user.click(notFound)).resolves.toBeUndefined();
    await expect(user.click(console)).resolves.toBeUndefined();
  });

  it("se activan y ejecutan su acción cuando se les pasa un manejador", async () => {
    const user = userEvent.setup();
    const onShow404 = vi.fn();
    const onOpenConsole = vi.fn();
    renderFooter({ onShow404, onOpenConsole });
    const notFound = screen.getByRole("button", { name: "Mostrar la página de error 404" });
    const console = screen.getByRole("button", { name: "Abrir la consola interactiva (Ctrl+K)" });

    expect(notFound).not.toHaveAttribute("aria-disabled");
    expect(console).not.toHaveAttribute("aria-disabled");

    await user.click(notFound);
    await user.click(console);

    expect(onShow404).toHaveBeenCalledTimes(1);
    expect(onOpenConsole).toHaveBeenCalledTimes(1);
  });

  it("sus nombres accesibles contienen el texto visible (404 y Ctrl+K)", () => {
    renderFooter();

    expect(screen.getByRole("button", { name: /404/ })).toHaveTextContent("404");
    expect(screen.getByRole("button", { name: /Ctrl\+K/ })).toHaveTextContent("Ctrl+K");
  });
});
