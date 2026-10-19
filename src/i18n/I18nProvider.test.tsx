import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { SECTIONS } from "../data/sections";
import Providers from "../Providers";
import { messages } from "./messages";

const renderApp = () =>
  render(
    <Providers>
      <App />
    </Providers>,
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe("cambio de idioma", () => {
  it("traduce la interfaz y el contenido al elegir inglés", async () => {
    const user = userEvent.setup();
    renderApp();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("experiencias digitales");

    await user.click(screen.getByRole("button", { name: "Cambiar idioma a inglés" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("digital experiences");
    for (const { id, title } of SECTIONS) {
      const section = document.getElementById(id) as HTMLElement;
      expect(within(section).getByRole("heading", { level: 2, name: title.en })).toBeInTheDocument();
    }
    // Contenido de datos (proyecto) y textos con variables (sobre mí)
    expect(screen.getByRole("article", { name: "Personal portfolio" })).toBeInTheDocument();
    expect(screen.getByText(/My name is José Francisco Sánchez/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch language to Spanish" })).toBeInTheDocument();
  });

  it("actualiza lang, título y meta descripción del documento", async () => {
    const meta = document.createElement("meta");
    meta.name = "description";
    document.head.append(meta);
    const user = userEvent.setup();
    renderApp();
    expect(document.documentElement.lang).toBe("es");
    expect(document.title).toBe(messages.es.meta.title);

    await user.click(screen.getByRole("button", { name: "Cambiar idioma a inglés" }));

    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe(messages.en.meta.title);
    expect(meta.content).toBe(messages.en.meta.description);
    meta.remove();
  });

  it("recuerda la elección y vuelve a español al alternar", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Cambiar idioma a inglés" }));
    expect(localStorage.getItem("language")).toBe("en");

    await user.click(screen.getByRole("button", { name: "Switch language to Spanish" }));
    expect(localStorage.getItem("language")).toBe("es");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("experiencias digitales");
  });

  it("los enlaces internos siguen apuntando a secciones existentes en inglés", async () => {
    const user = userEvent.setup();
    const { container } = renderApp();
    await user.click(screen.getByRole("button", { name: "Cambiar idioma a inglés" }));

    for (const link of container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      expect(document.getElementById((link.getAttribute("href") ?? "").slice(1))).not.toBeNull();
    }
  });
});

describe("idioma inicial", () => {
  it("sin elección guardada usa el idioma del navegador, sin persistirlo", () => {
    localStorage.clear();
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US", "es"]);

    renderApp();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("digital experiences");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("language")).toBeNull();
  });

  it("la elección guardada gana al navegador", () => {
    localStorage.setItem("language", "es");
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US"]);

    renderApp();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("experiencias digitales");
  });
});
