// @vitest-environment node
import { describe, expect, it } from "vitest";
import { metrics } from "../../data/metrics";
import { languages } from "../../data/profile";
import { stack } from "../../data/stack";
import { LANGUAGES } from "../../lib/language";
import { renderComponent } from "../../test/render";
import AboutSection from "./AboutSection.astro";

describe.each(LANGUAGES)("Sobre mí (%s)", (language) => {
  const render = () => renderComponent(AboutSection, { language });

  it("es un bento grid de 4 columnas en escritorio, 2 en tablet y 1 en móvil, sin scroll horizontal", async () => {
    const { document } = await render();

    const grid = document.querySelector("[data-bento]");
    // Una sola columna fija en móvil: sin ella, el carrusel (que mide lo que su contenido) ensancharía toda la rejilla.
    expect(grid?.className).toMatch(/(^|\s)grid-cols-1(\s|$)/);
    expect(grid?.className).toContain("nav:grid-cols-4");
    expect(grid?.className).toContain("tight:grid-cols-2");
    expect(grid?.className).not.toMatch(/overflow-x-scroll|w-\[/);
    // Cinco tarjetas: presentación, ubicación, idiomas, cifras y stack.
    expect(grid?.querySelectorAll("article")).toHaveLength(5);
  });

  it("cada tarjeta es un <article> con un encabezado (h3) o un nombre accesible", async () => {
    const { document, getByRole } = await render();

    for (const card of document.querySelectorAll("[data-bento] article")) {
      const labelledBy = card.getAttribute("aria-labelledby");
      expect(labelledBy, card.outerHTML.slice(0, 80)).toBeTruthy();
      expect(card.querySelector(`#${labelledBy}`)?.tagName).toBe("H3");
    }
    expect(getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("la presentación es corta, resalta «programar» y el puesto actual y no repite la historia de Torcal", async () => {
    const { document } = await render();

    const intro = document.querySelector("article[aria-labelledby='about-intro'] p");
    const highlighted = [...(intro?.querySelectorAll("strong") ?? [])].map((strong) => strong.textContent);
    expect(highlighted).toEqual([language === "es" ? "programar" : "programming", "QA Tester"]);
    for (const strong of intro?.querySelectorAll("strong") ?? []) expect(strong.className).toContain("text-accent");
    expect(intro).toHaveTextContent("José Sánchez");
    expect(intro?.textContent?.length).toBeLessThan(220);
    expect(intro?.textContent).not.toMatch(/Torcal|PHP|soporte|support/i);
    expect(document.body.textContent).not.toContain("<k>");
  });

  it("la ubicación muestra el pin con pulso y un reloj local de Europe/Madrid, oculto hasta que el script lo rellena", async () => {
    const { document, getByText } = await render();

    expect(getByText(language === "es" ? "Málaga, España" : "Málaga, Spain")).toBeInTheDocument();
    expect(document.querySelector("article[aria-labelledby='about-location'] .animate-ping")).not.toBeNull();
    const clock = document.querySelector("[data-clock]");
    expect(clock).toHaveAttribute("data-timezone", "Europe/Madrid");
    expect(clock).toHaveAttribute("data-language", language);
    expect(clock?.className).toContain("invisible");
    // No se lee cada minuto.
    expect(clock?.querySelector("time")).toHaveAttribute("aria-live", "off");
  });

  it("los idiomas tienen nivel en 5 segmentos, sin porcentajes, y el nivel también en texto", async () => {
    const { document, getByText } = await render();

    const card = document.querySelector("article[aria-labelledby='about-languages']");
    expect(card?.textContent).not.toContain("%");
    const rows = [...(card?.querySelectorAll("li") ?? [])];
    expect(rows).toHaveLength(languages.length);
    for (const [index, row] of rows.entries()) {
      const segments = [...row.querySelectorAll("[aria-hidden='true'] > span")];
      expect(segments).toHaveLength(5);
      expect(segments.filter((segment) => segment.className.includes("bg-accent"))).toHaveLength(languages[index]?.segments ?? 0);
    }
    expect(getByText(language === "es" ? "Nativo" : "Native")).toBeInTheDocument();
    expect(getByText(language === "es" ? "B2 Cambridge" : "Cambridge B2")).toBeInTheDocument();
    expect(rows[1]).toHaveTextContent(language === "es" ? "nivel 3 de 5" : "level 3 of 5");
  });

  it("las cifras se calculan de los datos (años de experiencia y tecnologías del stack) y llevan el valor final en el HTML", async () => {
    const { document } = await render();

    const counters = [...document.querySelectorAll<HTMLElement>("[data-metrics] [data-count]")];
    expect(counters.map((counter) => Number(counter.dataset.count))).toEqual(metrics.map((metric) => metric.value));
    const [years, techs] = counters;
    expect(years?.textContent).toBe(`${metrics[0]?.value}+`);
    expect(years?.dataset.suffix).toBe("+");
    const names = new Set(stack.flatMap((category) => category.items.map((item) => item.es)));
    expect(Number(techs?.dataset.count)).toBe(names.size);
    for (const [index, counter] of counters.entries()) {
      const metric = metrics[index];
      expect(counter.textContent).toBe(`${metric?.prefix ?? ""}${metric?.value}${metric?.suffix ?? ""}`);
    }
  });

  it("el contador animado no se lee en voz alta: el lector ve solo el valor final", async () => {
    const { document } = await render();

    for (const counter of document.querySelectorAll("[data-metrics] [data-count]")) {
      expect(counter).toHaveAttribute("aria-hidden", "true");
      expect(counter.previousElementSibling).toHaveClass("sr-only");
      expect(counter.previousElementSibling?.textContent).toBe(counter.textContent);
    }
  });

  it("la última tarjeta, a ancho completo, lleva la etiqueta `stack` y el carrusel de logos de siempre", async () => {
    const { document } = await render();

    const wrapper = document.querySelector("article[aria-labelledby='about-stack']")?.parentElement;
    expect(wrapper?.className).toContain("nav:col-span-4");
    const card = wrapper?.querySelector("article");
    expect(card?.querySelector("h3")).toHaveTextContent("stack");
    expect(card?.querySelectorAll(".animate-marquee")).toHaveLength(1);
    expect(card?.querySelector(".animate-marquee svg[role='img']")).not.toBeNull();
    // Es la última de la cuadrícula.
    expect(document.querySelector("[data-bento]")?.lastElementChild).toBe(wrapper);
  });

  it("las tarjetas entran en cascada (envoltorio con fundido y 16 px) y tienen spotlight y elevación en el hover", async () => {
    const { document } = await render();

    const wrappers = document.querySelectorAll("[data-bento] > [data-reveal]");
    expect(wrappers).toHaveLength(5);
    for (const wrapper of wrappers) {
      expect(wrapper.className).toContain("group-data-ready:translate-y-4");
      expect(wrapper.className).toContain("group-data-ready:opacity-0");
      const card = wrapper.querySelector("article");
      expect(card).toHaveAttribute("data-spotlight");
      expect(card?.className).toContain("hover:-translate-y-[3px]");
      expect(card?.className).toContain("motion-reduce:before:hidden");
      expect(card?.className).toContain("motion-reduce:after:hidden");
    }
    // Sin JavaScript no se prepara nada: todo se ve.
    expect(document.querySelector("[data-bento]")).not.toHaveAttribute("data-ready");
  });

  it("ya no hay tarjeta de enfoque ni la cita «Venir del desarrollo…»", async () => {
    const { document, queryByText } = await render();

    expect(document.querySelector("blockquote")).toBeNull();
    expect(document.querySelector("#about-focus, #about-quote")).toBeNull();
    expect(queryByText(/Venir del desarrollo|Coming from development/)).toBeNull();
    expect(queryByText(/Pruebas manuales|Manual testing|Resolución de problemas|Problem solving/)).toBeNull();
  });

  it("el mosaico no deja huecos: la presentación ocupa 2×2 junto a ubicación, idiomas y cifras, y el stack va debajo a todo el ancho", async () => {
    const { document } = await render();

    const [intro, location, languages, numbers, stack] = [...document.querySelectorAll("[data-bento] > [data-reveal]")];
    expect(intro?.className).toContain("nav:row-span-2");
    expect(location?.className).not.toContain("col-span");
    expect(languages?.className).not.toContain("col-span");
    expect(numbers?.className).toContain("tight:col-span-2");
    expect(stack?.className).toContain("nav:col-span-4");
  });

  it("el reloj vive solo en la tarjeta de ubicación (un único reloj en la sección)", async () => {
    const { document } = await render();

    expect(document.querySelectorAll("[data-clock]")).toHaveLength(1);
  });
});
