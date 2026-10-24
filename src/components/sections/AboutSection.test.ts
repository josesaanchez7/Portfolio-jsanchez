// @vitest-environment node
import { describe, expect, it } from "vitest";
import { aboutFacts } from "../../data/profile";
import { LANGUAGES } from "../../lib/language";
import { renderComponent } from "../../test/render";
import AboutSection from "./AboutSection.astro";

describe.each(LANGUAGES)("Sobre mí (%s)", (language) => {
  it("cuenta el origen, el recorrido y lo que aporta venir del desarrollo", async () => {
    const { getByRole } = await renderComponent(AboutSection, { language });
    const section = getByRole("region");
    const paragraphs = [...section.querySelectorAll("p")];

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
});
