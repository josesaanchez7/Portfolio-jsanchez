// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderComponent } from "../../test/render";
import EntryHint from "./EntryHint.astro";

describe("EntryHint (ventanita de atajos al entrar)", () => {
  it("la ventana y el botón para reabrirla salen ocultos en el HTML: los muestra el script", async () => {
    const { document } = await renderComponent(EntryHint);

    expect(document.querySelector("[data-entry-window]")).toHaveAttribute("hidden");
    expect(document.querySelector("[data-entry-launcher]")).toHaveAttribute("hidden");
  });

  it("es una ventana con nombre accesible y un botón de minimizar (también con Esc)", async () => {
    const { document } = await renderComponent(EntryHint);

    const windowEl = document.querySelector("[data-entry-window]");
    expect(windowEl?.tagName).toBe("ASIDE");
    expect(windowEl).toHaveAttribute("aria-label", "Atajos");
    const minimize = windowEl?.querySelector("[data-entry-minimize]");
    expect(minimize).toHaveAttribute("aria-label", "Minimizar atajos");
    expect(minimize).toHaveAttribute("aria-keyshortcuts", "Escape");
  });

  it("el botón de la esquina la vuelve a abrir y lo anuncia", async () => {
    const { document } = await renderComponent(EntryHint);

    const launcher = document.querySelector("[data-entry-launcher]");
    expect(launcher).toHaveAttribute("aria-label", "Mostrar atajos");
    expect(launcher).toHaveAttribute("aria-controls", "entry-hint");
    expect(launcher).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("entry-hint")).toHaveAttribute("data-entry-window");
  });

  it("abre la consola con el atajo visible y enlaza a la otra versión de la web", async () => {
    const { document } = await renderComponent(EntryHint);

    const windowEl = document.querySelector("[data-entry-window]");
    expect(windowEl?.querySelector("[data-console-open]")).not.toBeNull();
    expect(windowEl?.querySelector("[data-console-kbd]")).toHaveTextContent("Ctrl K");
    const link = windowEl?.querySelector("[data-language-switch]");
    expect(link).toHaveAttribute("href", "/en/");
    expect(link).toHaveAttribute("hreflang", "en");
    expect(link).toHaveTextContent("View in English");
  });

  it("en la versión inglesa ofrece la española, escrita en español", async () => {
    const { document } = await renderComponent(EntryHint, { language: "en" });

    const link = document.querySelector("[data-entry-window] [data-language-switch]");
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveAttribute("lang", "es");
    expect(link).toHaveTextContent("Ver en español");
  });

  it("la barra de título es el asa para moverla, solo con ratón (en móvil no se mueve)", async () => {
    const { document } = await renderComponent(EntryHint);

    const handle = document.querySelector("[data-entry-window] [data-entry-drag]");
    expect(handle).not.toBeNull();
    expect(handle?.className).toContain("[@media(pointer:fine)]:cursor-grab");
    expect(handle?.className).toContain("[@media(pointer:fine)]:touch-none");
    expect(handle).toHaveAttribute("title", "Arrastra para moverla · doble clic para devolverla a la esquina");
    // El botón de minimizar va dentro de la barra, pero no arrastra (lo excluye el script).
    expect(handle?.querySelector("[data-entry-minimize]")).not.toBeNull();
  });

  it("en móvil ocupa todo el ancho con el mismo margen a cada lado", async () => {
    const { document } = await renderComponent(EntryHint);

    const className = document.querySelector("[data-entry-window]")?.className ?? "";
    expect(className).toContain("right-4");
    expect(className).toContain("max-sm:left-4");
    expect(className).toContain("max-sm:w-auto");
  });

  it("ya no hay variantes provisionales", async () => {
    const { document } = await renderComponent(EntryHint);

    expect(document.querySelector("[data-hint-variant]")).toBeNull();
  });
});
