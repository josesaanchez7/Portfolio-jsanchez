// @vitest-environment node
import { describe, expect, it } from "vitest";
import { stack } from "../../data/stack";
import { renderComponent } from "../../test/render";
import TechMarquee from "./TechMarquee.astro";

const COPIES = 4;
const SECONDS_PER_ITEM = 4;

describe("TechMarquee", () => {
  it("es decorativo: las mismas tecnologías están, agrupadas, en las tarjetas del Stack", async () => {
    const { document } = await renderComponent(TechMarquee);

    expect(document.body.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("tiene dos filas que se mueven en direcciones opuestas", async () => {
    const { document } = await renderComponent(TechMarquee);

    const tracks = [...document.querySelectorAll<HTMLElement>(".animate-marquee")];
    expect(tracks).toHaveLength(2);
    expect(tracks[0]?.className).not.toContain("[animation-direction:reverse]");
    expect(tracks[1]?.className).toContain("[animation-direction:reverse]");
  });

  it("reparte entre las dos filas todas las tecnologías, sin repetir, y cada fila lleva varias copias para el bucle", async () => {
    const { document } = await renderComponent(TechMarquee);

    const tracks = [...document.querySelectorAll<HTMLElement>(".animate-marquee")];
    const firstCopies = tracks.flatMap((track) =>
      [...(track.querySelector("ul")?.querySelectorAll("li") ?? [])].map((li) => li.textContent?.trim()),
    );
    const expected = new Set(stack.flatMap((category) => category.items.map((item) => item.es)));

    expect(new Set(firstCopies)).toEqual(expected);
    expect(firstCopies).toHaveLength(expected.size);
    for (const track of tracks) expect(track.querySelectorAll("ul")).toHaveLength(COPIES);
  });

  it("la velocidad depende del número de tecnologías de la fila", async () => {
    const { document } = await renderComponent(TechMarquee);

    for (const track of document.querySelectorAll<HTMLElement>(".animate-marquee")) {
      const items = track.querySelector("ul")?.querySelectorAll("li").length ?? 0;
      expect(track.getAttribute("style")).toContain(`animation-duration:${items * SECONDS_PER_ITEM}s`);
    }
  });

  it("con «reducir movimiento» solo se ve la primera copia", async () => {
    const { document } = await renderComponent(TechMarquee);

    const [first, ...others] = document.querySelector(".animate-marquee")?.querySelectorAll("ul") ?? [];
    expect(first?.className).not.toContain("motion-reduce:hidden");
    for (const copy of others) expect(copy.className).toContain("motion-reduce:hidden");
  });
});
