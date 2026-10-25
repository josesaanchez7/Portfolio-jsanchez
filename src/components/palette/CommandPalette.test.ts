// @vitest-environment node
import { describe, expect, it } from "vitest";
import { SECTIONS } from "../../data/sections";
import { messages } from "../../i18n/messages";
import { LANGUAGES } from "../../lib/language";
import { renderComponent } from "../../test/render";
import CommandPalette from "./CommandPalette.astro";

describe.each(LANGUAGES)("Paleta de comandos (%s)", (language) => {
  const t = messages[language];
  const render = () => renderComponent(CommandPalette, { language });

  it("es un diálogo con un campo combobox que controla una lista de opciones", async () => {
    const { getByRole, document } = await render();

    expect(document.querySelector("dialog")).toHaveAttribute("aria-label", t.palette.title);
    const input = getByRole("combobox", { name: t.palette.inputLabel, hidden: true });
    expect(input).toHaveAttribute("aria-controls", "palette-list");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(document.getElementById("palette-list")).toHaveAttribute("role", "listbox");
  });

  it("ofrece ir a cada sección (y al inicio) con su ancla", async () => {
    const { document } = await render();

    const targets = [...document.querySelectorAll<HTMLElement>('[data-command="goto"]')].map((el) => el.dataset.target);
    expect(targets).toEqual(["#hero", ...SECTIONS.map(({ id }) => `#${id}`)]);
  });

  it("incluye las acciones: tema, idioma, copiar correo, CV, consola y debug", async () => {
    const { document } = await render();

    const commands = [...document.querySelectorAll<HTMLElement>("[data-command]")].map((el) => el.dataset.command);
    for (const command of ["theme", "language", "copy-email", "cv", "console", "debug"]) {
      expect(commands, command).toContain(command);
    }
  });

  it("reutiliza los textos de la interfaz para sus acciones", async () => {
    const { getByText } = await render();
    const other = language === "es" ? "en" : "es";

    expect(getByText(t.header.switchLanguage[other], { exact: true })).toBeInTheDocument();
    expect(getByText(t.contact.copyLabel, { exact: true })).toBeInTheDocument();
    expect(getByText(t.hero.downloadCv, { exact: true })).toBeInTheDocument();
  });

  it("los enlaces externos llevan una URL https", async () => {
    const { document } = await render();

    for (const option of document.querySelectorAll<HTMLElement>('[data-command="open"]')) {
      expect(option.dataset.href).toMatch(/^https:\/\//);
    }
  });

  it("cada opción trae su texto de búsqueda ya normalizado (sin tildes ni mayúsculas)", async () => {
    const { document } = await render();

    for (const option of document.querySelectorAll<HTMLElement>('[role="option"]')) {
      const search = option.dataset.search ?? "";
      expect(search.length).toBeGreaterThan(0);
      expect(search).toBe(search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim());
    }
  });

  it("las opciones empiezan sin seleccionar y el estado vacío oculto", async () => {
    const { document } = await render();

    for (const option of document.querySelectorAll('[role="option"]')) {
      expect(option).toHaveAttribute("aria-selected", "false");
    }
    expect(document.querySelector("[data-palette-empty]")).toHaveAttribute("hidden");
  });

  it("usa el aviso compartido (ya no lleva el suyo)", async () => {
    const { document } = await render();

    expect(document.querySelector("[data-palette-toast]")).toBeNull();
  });
});
