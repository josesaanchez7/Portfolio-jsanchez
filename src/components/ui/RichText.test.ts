// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderComponent } from "../../test/render";
import RichText from "./RichText.astro";

describe("RichText", () => {
  it("convierte <b>…</b> en <strong> por defecto", async () => {
    const { document } = await renderComponent(RichText, { props: { text: "Hola <b>mundo</b> feliz" } });

    expect(document.body.innerHTML).toBe("Hola <strong>mundo</strong> feliz");
  });

  it("aplica el renderizador indicado para cada etiqueta", async () => {
    const { document } = await renderComponent(RichText, {
      props: { text: "a <h>b</h>", tags: { h: { as: "span", class: "text-accent" } } },
    });

    expect(document.querySelector("span.text-accent")?.textContent).toBe("b");
  });

  it("las etiquetas desconocidas se muestran como texto literal", async () => {
    const { document } = await renderComponent(RichText, { props: { text: "a <i>b</i>" } });

    expect(document.body.textContent).toBe("a <i>b</i>");
    expect(document.querySelector("i")).toBeNull();
  });

  it("no interpreta HTML: escapa los caracteres especiales", async () => {
    const { document } = await renderComponent(RichText, {
      props: { text: "<b><img src=x onerror=alert(1)></b>" },
    });

    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("strong")?.textContent).toBe("<img src=x onerror=alert(1)>");
  });
});
