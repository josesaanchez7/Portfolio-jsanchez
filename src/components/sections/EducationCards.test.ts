// @vitest-environment node
import { describe, expect, it } from "vitest";
import { education, upcomingCertifications } from "../../data/experience";
import { renderComponent } from "../../test/render";
import EducationCards from "./EducationCards.astro";

describe("EducationCards (versión de tarjetas)", () => {
  it("la titulación principal va primero y es la tarjeta grande; el bachillerato va al lado, más pequeño", async () => {
    const { document, getByRole } = await renderComponent(EducationCards);

    const cards = [...document.querySelectorAll("article")];
    expect(cards.map((card) => card.querySelector("h3")?.textContent)).toEqual([
      "Desarrollo de Aplicaciones Multiplataforma",
      "Bachillerato Tecnológico",
    ]);
    expect(cards[0]?.querySelector("svg")).not.toBeNull();
    expect(cards[1]?.querySelector("svg")).toBeNull();
    expect(getByRole("heading", { level: 3, name: "Desarrollo de Aplicaciones Multiplataforma" })).toBeInTheDocument();
  });

  it("en el bachillerato las fechas van justo bajo el centro: no se empujan al fondo de la tarjeta", async () => {
    const { document } = await renderComponent(EducationCards);

    const [main, other] = [...document.querySelectorAll("article")];
    expect(main?.querySelector("p.mt-auto")).not.toBeNull();
    expect(other?.querySelector("p.mt-auto")).toBeNull();
    expect(other?.querySelector("p:last-child")).toHaveTextContent("2018 – 2020");
    // Su columna no se estira a la altura del DAM, así que tampoco queda hueco debajo.
    expect(other?.closest("[data-deal]")?.parentElement?.className).toContain("nav:self-start");
  });

  it("las certificaciones van debajo, en una lista de insignias compactas con su propio encabezado", async () => {
    const { document, getByRole } = await renderComponent(EducationCards);

    const heading = getByRole("heading", { level: 3, name: "Certificaciones" });
    const badges = heading.parentElement?.querySelectorAll("ul > li");
    expect(badges).toHaveLength(education.filter((item) => item.kind === "certification").length);
    expect(badges?.[0]).toHaveTextContent("API Testing Learning Path");
    expect(badges?.[0]).toHaveTextContent("Postman Academy · ago. 2026");
    // Las certificaciones van después de las titulaciones.
    const order = [...document.querySelectorAll("article, h3")];
    expect(order.indexOf(heading)).toBeGreaterThan(order.findLastIndex((element) => element.tagName === "ARTICLE"));
  });

  it("el enlace a la credencial conserva la URL, es externo seguro y tiene una etiqueta descriptiva", async () => {
    const { getByRole } = await renderComponent(EducationCards);

    const link = getByRole("link", { name: /Ver credencial de API Testing Learning Path \(Postman Academy\)/ });
    expect(link).toHaveAttribute("href", "https://verify.skilljar.com/c/pu9b9suir8w2");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("se traduce al inglés", async () => {
    const { getByRole, getByText } = await renderComponent(EducationCards, { language: "en" });

    expect(getByRole("heading", { level: 3, name: "Certifications" })).toBeInTheDocument();
    expect(getByRole("link", { name: /View credential for API Testing Learning Path/ })).toBeInTheDocument();
    expect(getByText("Postman Academy · Aug 2026")).toBeInTheDocument();
  });

  it("cada entrada tiene su elemento de entrada animada: las tarjetas con 80 ms y las insignias con 40 ms", async () => {
    const { document } = await renderComponent(EducationCards);

    const deals = [...document.querySelectorAll("[data-deal]")];
    expect(deals).toHaveLength(education.length + upcomingCertifications.length);
    expect(document.querySelector("article")?.closest("[data-deal]")?.className).toContain("*80ms");
    expect(document.querySelector("ul > li[data-deal]")?.className).toContain("*40ms");
    expect(deals[0]?.className).toContain("scale-[0.96]");
  });

  it("sin JavaScript todo se ve: la marca «preparada» solo la añade el script", async () => {
    const { document } = await renderComponent(EducationCards);

    expect(document.querySelector("[data-showcase]")).not.toHaveAttribute("data-ready");
    expect(document.querySelector("[data-deal]")?.className).toContain("group-data-ready:opacity-0");
  });
});
