import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("renderiza un enlace interno sin abrir pestaña nueva", () => {
    render(<Button href="#Contacto">Contactar</Button>);

    const link = screen.getByRole("link", { name: "Contactar" });
    expect(link).toHaveAttribute("href", "#Contacto");
    expect(link).not.toHaveAttribute("target");
  });

  it("los enlaces externos abren pestaña nueva con rel seguro", () => {
    render(
      <Button href="https://github.com/josesaanchez7" external>
        GitHub
      </Button>,
    );

    const link = screen.getByRole("link", { name: "GitHub" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("sin href renderiza un botón que ejecuta onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ver detalle</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Ver detalle" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
