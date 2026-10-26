// @vitest-environment node
import { describe, expect, it } from "vitest";
import { techLogos } from "../../data/techLogos";
import { renderComponent } from "../../test/render";
import TechLogo from "./TechLogo.astro";

const render = (props: Record<string, unknown>) => renderComponent(TechLogo, { props });

describe("TechLogo", () => {
  it("dibuja el logo oficial respetando su viewBox, con role=img y aria-label con el nombre", async () => {
    const { document } = await render({ name: "Playwright" });

    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "Playwright");
    expect(svg).toHaveAttribute("viewBox", techLogos.Playwright.viewBox);
    expect(svg).toHaveAttribute("width", String(techLogos.Playwright.width));
    expect(svg?.querySelectorAll("path").length).toBe(techLogos.Playwright.paths.length);
  });

  it("en reposo es neutro (currentColor al 70 %), sin colores de marca fijos en el SVG", async () => {
    const { document } = await render({ name: "Postman" });

    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg?.getAttribute("class")).toContain("opacity-70");
    expect(svg?.getAttribute("class")).toContain("text-fg");
    expect(svg?.querySelector("[fill]")).toBeNull();
  });

  it("con hover o foco pasa al color de marca y a opacidad completa", async () => {
    const { document } = await render({ name: "Astro" });

    const classes = document.querySelector("svg")?.getAttribute("class") ?? "";
    expect(classes).toContain("group-hover/tile:text-(--hover)");
    expect(classes).toContain("group-hover/tile:opacity-100");
    expect(classes).toContain("group-focus-within/tile:text-(--hover)");
  });

  it("define el color de hover por tema: la marca donde contrasta y el acento donde no", async () => {
    const jira = await render({ name: "Jira" });
    const git = await render({ name: "Git" });

    // Jira (#0052CC) no se ve sobre la baldosa oscura: acento; sobre la clara, su azul.
    expect(jira.document.querySelector("svg")?.getAttribute("style")).toContain("--hover-dark:var(--accent)");
    expect(jira.document.querySelector("svg")?.getAttribute("style")).toContain("--hover-light:#0052CC");
    // Git (#F03C2E) contrasta en los dos temas.
    expect(git.document.querySelector("svg")?.getAttribute("style")).toContain("--hover-dark:#F03C2E");
    expect(git.document.querySelector("svg")?.getAttribute("style")).toContain("--hover-light:#F03C2E");
  });

  it("decorativo: aria-hidden y sin role ni aria-label", async () => {
    const { document } = await render({ name: "Vite", decorative: true });

    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).not.toHaveAttribute("aria-label");
  });

  it("una tecnología sin logo no pinta nada", async () => {
    const { document } = await render({ name: "Inexistente" });

    expect(document.querySelector("svg")).toBeNull();
  });
});
