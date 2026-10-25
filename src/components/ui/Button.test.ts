// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderComponent } from "../../test/render";
import Button from "./Button.astro";

describe("Button", () => {
  it("renderiza un enlace interno sin abrir pestaña nueva", async () => {
    const { getByRole } = await renderComponent(Button, { props: { href: "#Contacto" }, slot: "Contactar" });

    const link = getByRole("link", { name: "Contactar" });
    expect(link).toHaveAttribute("href", "#Contacto");
    expect(link).not.toHaveAttribute("target");
  });

  it("los enlaces externos abren pestaña nueva con rel seguro", async () => {
    const { getByRole } = await renderComponent(Button, { props: { href: "https://github.com/josesaanchez7", external: true }, slot: "GitHub" });

    const link = getByRole("link", { name: "GitHub" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("sin href renderiza un botón y pasa el resto de atributos", async () => {
    const { getByRole } = await renderComponent(Button, { props: { "data-demo-open": "detalle", "aria-haspopup": "dialog" }, slot: "Abrir detalle" });

    const button = getByRole("button", { name: "Abrir detalle" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-demo-open", "detalle");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("no filtra sus propiedades de estilo como atributos HTML", async () => {
    const { getByRole } = await renderComponent(Button, { props: { href: "#x", variant: "ghost", icon: "github" }, slot: "Enlace" });

    const link = getByRole("link", { name: "Enlace" });
    expect(link).not.toHaveAttribute("variant");
    expect(link).not.toHaveAttribute("icon");
    expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});
