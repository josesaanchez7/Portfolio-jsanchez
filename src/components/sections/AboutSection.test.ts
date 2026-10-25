// @vitest-environment node
import { describe, expect, it } from "vitest";
import { metrics } from "../../data/metrics";
import { aboutFacts } from "../../data/profile";
import { LANGUAGES } from "../../lib/language";
import { renderComponent } from "../../test/render";
import AboutSection from "./AboutSection.astro";

describe.each(LANGUAGES)("Sobre mí (%s)", (language) => {
  it("cuenta el origen, el recorrido y lo que aporta venir del desarrollo", async () => {
    const { getByRole } = await renderComponent(AboutSection, { language });
    const section = getByRole("region");
    // Los tres primeros párrafos son el relato; los siguientes son las cifras.
    const paragraphs = [...section.querySelectorAll("p")].slice(0, 3);

    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0]).toHaveTextContent("José Francisco Sánchez Aldana");
    expect(paragraphs[1]?.querySelector("strong")).toHaveTextContent("QA Tester");
    expect(paragraphs[1]).toHaveTextContent("Torcal");
  });

  it("la tarjeta no repite lo que ya dicen Educación y Experiencia", async () => {
    const { document } = await renderComponent(AboutSection, { language });

    const labels = [...document.querySelectorAll("dt")].map((dt) => dt.textContent);
    expect(labels).toEqual(aboutFacts.map((fact) => fact.label[language]));
    expect(labels.length).toBeGreaterThanOrEqual(3);
  });

  it("muestra la ubicación de la barra de estado en el idioma de la página", async () => {
    const { getByText } = await renderComponent(AboutSection, { language });

    expect(getByText(language === "es" ? "Málaga, España" : "Málaga, Spain")).toBeInTheDocument();
  });

  it("muestra las cifras con el valor final ya en el HTML (el script solo las anima)", async () => {
    const { document } = await renderComponent(AboutSection, { language });

    const counters = [...document.querySelectorAll<HTMLElement>("[data-metrics] [data-count]")];
    expect(counters.map((counter) => Number(counter.dataset.count))).toEqual(metrics.map((metric) => metric.value));
    for (const [index, counter] of counters.entries()) {
      const metric = metrics[index];
      expect(counter.textContent).toBe(`${metric?.prefix ?? ""}${metric?.value}${metric?.suffix ?? ""}`);
    }
  });

  it("el contador animado no se lee en voz alta: el lector ve solo el valor final", async () => {
    const { document } = await renderComponent(AboutSection, { language });

    for (const counter of document.querySelectorAll("[data-metrics] [data-count]")) {
      expect(counter).toHaveAttribute("aria-hidden", "true");
      expect(counter.previousElementSibling).toHaveClass("sr-only");
      expect(counter.previousElementSibling?.textContent).toBe(counter.textContent);
    }
  });
});
