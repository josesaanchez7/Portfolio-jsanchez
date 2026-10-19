import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SECTIONS } from "../../../data/sections";
import Providers from "../../../Providers";
import Header from "./Header";

const renderHeader = () =>
  render(
    <Providers>
      <Header />
    </Providers>,
  );

describe("Header", () => {
  it("muestra un enlace por sección", () => {
    renderHeader();

    for (const { id, navLabel } of SECTIONS) {
      expect(screen.getByRole("link", { name: navLabel.es })).toHaveAttribute("href", `#${id}`);
    }
  });

  it("abre y cierra el menú móvil exponiendo su estado", async () => {
    const user = userEvent.setup();
    renderHeader();
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Cerrar menú" }));
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
  });

  it("Escape cierra el menú y devuelve el foco al botón", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    await user.keyboard("{Escape}");

    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("un clic fuera del header cierra el menú", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    await user.click(document.body);

    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
  });

  it("alterna el tema y lo persiste", async () => {
    const user = userEvent.setup();
    renderHeader();
    expect(document.documentElement.dataset.theme).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Cambiar a tema claro" }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(screen.getByRole("button", { name: "Cambiar a tema oscuro" })).toBeInTheDocument();
  });
});
