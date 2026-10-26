// @vitest-environment node
import { describe, expect, it } from "vitest";
import { stack } from "../../data/stack";
import { renderComponent } from "../../test/render";
import TechMarquee from "./TechMarquee.astro";

const COPIES = 4;
const SECONDS_PER_ITEM = 4;

describe("TechMarquee", () => {
  it("la primera copia de cada fila es accesible y las copias que repiten la fila para el bucle van con aria-hidden", async () => {
    const { document } = await renderComponent(TechMarquee);

    expect(document.body.firstElementChild).not.toHaveAttribute("aria-hidden");
    for (const track of document.querySelectorAll(".animate-marquee")) {
      const [first, ...copies] = track.querySelectorAll("ul");
      expect(first).not.toHaveAttribute("aria-hidden");
      expect(copies).toHaveLength(COPIES - 1);
      for (const copy of copies) expect(copy).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("cada tecnología de la primera copia lleva su logo con role=img y aria-label, además del nombre visible debajo", async () => {
    const { document } = await renderComponent(TechMarquee);

    const first = document.querySelector(".animate-marquee ul");
    for (const tile of first?.querySelectorAll("li") ?? []) {
      const name = tile.textContent?.trim();
      const logo = tile.querySelector("svg");
      expect(logo, name).toHaveAttribute("role", "img");
      expect(logo, name).toHaveAttribute("aria-label", name);
      expect(logo, name).not.toHaveAttribute("aria-hidden");
    }
  });

  it("los logos de las copias duplicadas son decorativos: aria-hidden y sin role ni aria-label", async () => {
    const { document } = await renderComponent(TechMarquee);

    const [, ...copies] = document.querySelector(".animate-marquee")?.querySelectorAll("ul") ?? [];
    for (const logo of copies.flatMap((copy) => [...copy.querySelectorAll("svg")])) {
      expect(logo).toHaveAttribute("aria-hidden", "true");
      expect(logo).not.toHaveAttribute("role");
      expect(logo).not.toHaveAttribute("aria-label");
    }
  });

  it("todas las baldosas tienen el mismo ancho y el logo cambia de color con el hover de la baldosa", async () => {
    const { document } = await renderComponent(TechMarquee);

    for (const tile of document.querySelectorAll(".animate-marquee li")) {
      expect(tile.className).toContain("w-[7.5rem]");
      expect(tile.className).toContain("group/tile");
      expect(tile.querySelector("svg")?.getAttribute("class")).toContain("group-hover/tile:text-(--hover)");
    }
  });

  it("es una sola línea (una sola pista) por la que van pasando las tecnologías", async () => {
    const { document } = await renderComponent(TechMarquee);

    const tracks = [...document.querySelectorAll<HTMLElement>(".animate-marquee")];
    expect(tracks).toHaveLength(1);
    expect(tracks[0]?.className).not.toContain("[animation-direction:reverse]");
  });

  it("lleva todas las tecnologías del stack, sin repetir, y varias copias de la fila para el bucle", async () => {
    const { document } = await renderComponent(TechMarquee);

    const track = document.querySelector<HTMLElement>(".animate-marquee");
    const firstCopy = [...(track?.querySelector("ul")?.querySelectorAll("li") ?? [])].map((li) => li.textContent?.trim());
    const expected = new Set(stack.flatMap((category) => category.items.map((item) => item.es)));

    expect(new Set(firstCopy)).toEqual(expected);
    expect(firstCopy).toHaveLength(expected.size);
    expect(track?.querySelectorAll("ul")).toHaveLength(COPIES);
  });

  it("la velocidad depende del número de tecnologías de la fila", async () => {
    const { document } = await renderComponent(TechMarquee);

    const track = document.querySelector<HTMLElement>(".animate-marquee");
    const items = track?.querySelector("ul")?.querySelectorAll("li").length ?? 0;
    expect(track?.getAttribute("style")).toContain(`animation-duration:${items * SECONDS_PER_ITEM}s`);
  });

  it("con «reducir movimiento» solo se ve la primera copia", async () => {
    const { document } = await renderComponent(TechMarquee);

    const [first, ...others] = document.querySelector(".animate-marquee")?.querySelectorAll("ul") ?? [];
    expect(first?.className).not.toContain("motion-reduce:hidden");
    for (const copy of others) expect(copy.className).toContain("motion-reduce:hidden");
  });
});
