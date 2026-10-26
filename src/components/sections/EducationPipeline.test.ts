// @vitest-environment node
import { describe, expect, it } from "vitest";
import { allEducationStages, educationStages, type EducationStage } from "../../data/education";
import { renderComponent } from "../../test/render";
import EducationPipeline from "./EducationPipeline.astro";

const render = (language?: "es" | "en", stages?: EducationStage[]) =>
  renderComponent(EducationPipeline, { ...(stages && { props: { stages } }), ...(language && { language }) });

// Con la etapa opcional activada (en los datos reales está desactivada).
const withOptional = (): EducationStage[] => [
  ...educationStages,
  { ...allEducationStages.find((stage) => stage.id === "istqb")!, enabled: true },
];

describe("EducationPipeline", () => {
  it("muestra un job por etapa, en orden cronológico, con nombre corto, centro y rango de años", async () => {
    const { document } = await render();

    const jobs = [...document.querySelectorAll("[data-job]")];
    expect(jobs).toHaveLength(educationStages.length);
    expect(jobs[0]).toHaveTextContent("Bachillerato Tecnológico");
    expect(jobs[0]).toHaveTextContent("C.D.P Santa Rosa De Lima");
    expect(jobs[0]?.textContent).not.toContain("Diocesano");
    expect(jobs[0]).toHaveTextContent("2018 – 2020");
    expect(jobs[1]).toHaveTextContent("2021 – 2024");
    expect(jobs[2]).toHaveTextContent("API Testing Learning Path");
    expect(jobs[2]).toHaveTextContent("Postman Academy");
    expect(jobs[2]).toHaveTextContent("2026");
    expect(document.querySelector("[data-job]")?.textContent).not.toMatch(/años/);
  });

  it("la cápsula del bachillerato abrevia el centro («C.D.P») y el panel de detalles lo lleva completo", async () => {
    const { document } = await render();

    expect(document.querySelectorAll("[data-job]")[0]).toHaveTextContent("C.D.P Santa Rosa De Lima");
    expect(document.querySelector("[data-panel='bachillerato']")).toHaveTextContent("Colegio Diocesano Santa Rosa De Lima");
  });

  it("la cápsula del DAM usa el nombre corto y el nombre completo queda en el panel de detalles", async () => {
    const { document } = await render();

    const job = document.querySelectorAll("[data-job]")[1];
    expect(job).toHaveTextContent("Desarrollo de Apps Multiplataforma");
    expect(job?.textContent).not.toContain("Aplicaciones");
    expect(document.querySelector("[data-panel='dam'] h3")).toHaveTextContent("Desarrollo de Aplicaciones Multiplataforma");
  });

  it("las cápsulas tienen la misma altura mínima y se estiran a la de su fila", async () => {
    const { document } = await render();

    for (const button of document.querySelectorAll("[data-job] > button")) {
      expect(button.className).toContain("h-full");
      expect(button.className).toContain("min-h-[7.5rem]");
    }
  });

  it("la cabecera es un workflow con la insignia «passing» cuando todo está completado", async () => {
    const { getByText, document } = await render();

    expect(getByText("formacion.yml")).toBeInTheDocument();
    expect(document.querySelector("[data-badge]")).toHaveTextContent("passing");
  });

  it("sin JavaScript todos los jobs se ven completados y con texto de estado (no solo color)", async () => {
    const { document } = await render();

    for (const job of document.querySelectorAll("[data-job]")) {
      expect(job).toHaveAttribute("data-state", "done");
      expect(job.querySelector(".sr-only")).toHaveTextContent("completado");
    }
    expect(document.querySelector("[data-pipeline]")).not.toHaveAttribute("data-ready");
  });

  it("los jobs son botones enfocables que controlan su panel; el DAM está abierto por defecto", async () => {
    const { document } = await render();

    const buttons = [...document.querySelectorAll<HTMLButtonElement>("button[data-target]")];
    expect(buttons.map((button) => button.getAttribute("aria-expanded"))).toEqual(["false", "true", "false"]);
    for (const button of buttons) {
      const panel = document.getElementById(button.getAttribute("aria-controls") ?? "");
      expect(panel).toHaveAttribute("role", "region");
      expect(panel).toHaveAttribute("aria-labelledby", button.id);
    }
    expect(document.querySelector("[data-pipeline]")).toHaveAttribute("data-open", "dam");
  });

  it("todos los paneles están en el DOM desde el principio, con centro, fechas y descripción", async () => {
    const { document } = await render();

    const panels = [...document.querySelectorAll("[data-panel]")];
    expect(panels).toHaveLength(educationStages.length);
    expect(panels[1]).toHaveTextContent("Colegio Concertado San José");
    expect(panels[1]).toHaveTextContent("2021 – 2024");
    expect(panels[1]).toHaveTextContent("Ciclo formativo de grado superior");
    for (const panel of panels) expect(panel).not.toHaveAttribute("hidden");
  });

  it("el panel de Postman lleva el botón «Mostrar credencial»: externo, seguro y con aria-label descriptivo", async () => {
    const { getByRole } = await render();

    const link = getByRole("link", { name: /Ver credencial de API Testing Learning Path/ });
    expect(link).toHaveAttribute("href", "https://verify.skilljar.com/c/pu9b9suir8w2");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("Mostrar credencial");
  });

  it("el panel es compacto: centro y fechas en una fila, y el estado comparte fila con el botón", async () => {
    const { document } = await render();

    const panel = document.querySelector("[data-panel='postman']");
    expect(panel?.querySelectorAll("dl > div")).toHaveLength(2);
    const footer = [...(panel?.querySelectorAll("div") ?? [])].find((div) => div.querySelector("a") && div.querySelector("p"));
    expect(footer).toHaveTextContent(/Estado\s*completado/);
    expect(footer?.querySelector("a")).toHaveTextContent("Mostrar credencial");
    expect(panel?.firstElementChild?.className).toContain("py-4");
  });

  it("solo la certificación tiene botón de credencial", async () => {
    const { document } = await render();

    expect(document.querySelectorAll("[data-panel] a")).toHaveLength(1);
  });

  it("la línea entre jobs se rellena según el estado del job anterior (y no hay conector tras el último)", async () => {
    const { document } = await render();

    const jobs = [...document.querySelectorAll("[data-job]")];
    expect(jobs.slice(0, -1).every((job) => job.querySelector("span[aria-hidden] > span.origin-top"))).toBe(true);
    expect(jobs.at(-1)?.querySelector("span.origin-top")).toBeNull();
  });

  it("los efectos solo se activan cuando el script lo pide (group-data-ready)", async () => {
    const { document } = await render();

    expect(document.querySelector("[data-badge]")?.className).toContain("group-data-ready:opacity-0");
  });

  it("se traduce al inglés", async () => {
    const { getByText, document } = await render("en");

    expect(getByText("education.yml")).toBeInTheDocument();
    expect(document.querySelectorAll("[data-job]")[1]).toHaveTextContent("Multiplatform App Development");
    expect(document.querySelectorAll("[data-job]")[0]?.querySelector(".sr-only")).toHaveTextContent("completed");
    expect(document.querySelector("[data-panel='dam']")).toHaveTextContent("Higher vocational training programme");
    expect(document.querySelector("[data-panel='postman'] a")?.getAttribute("aria-label")).toMatch(/^View credential for/);
  });

  it("la etapa opcional «en curso» no aparece mientras esté desactivada en los datos", async () => {
    const { document, queryByText } = await render();

    expect(document.querySelectorAll("[data-job]")).toHaveLength(3);
    expect(queryByText(/ISTQB/)).toBeNull();
    expect(queryByText("Próximamente")).toBeNull();
  });

  it("activada, sale como una cápsula discreta con spinner, «Próximamente» y la insignia en «running»", async () => {
    const { document, getByText } = await render("es", withOptional());

    const jobs = [...document.querySelectorAll("[data-job]")];
    expect(jobs).toHaveLength(4);
    const optional = jobs[3];
    expect(optional).toHaveTextContent("ISTQB Foundation");
    expect(optional).toHaveTextContent("Próximamente");
    expect(optional?.textContent).not.toContain("2026");
    expect(optional).toHaveAttribute("data-state", "running");
    expect(optional?.querySelector(".animate-spin")).not.toBeNull();
    expect(optional?.querySelector(".sr-only")).toHaveTextContent("en curso");
    expect(optional?.querySelector("button")?.className).toContain("border-dashed");
    // Las etapas completadas siguen igual y el workflow aún no ha terminado.
    expect(jobs[0]?.querySelector("button")?.className).not.toContain("border-dashed");
    expect(document.querySelector("[data-badge]")).toHaveTextContent("running");
    expect(getByText("ISTQB Foundation", { selector: "h3" })).toBeInTheDocument();
  });

  it("la etapa opcional se traduce: «Next» en inglés", async () => {
    const { document } = await render("en", withOptional());

    expect(document.querySelectorAll("[data-job]")[3]).toHaveTextContent("Next");
    expect(document.querySelectorAll("[data-job]")[3]?.querySelector(".sr-only")).toHaveTextContent("in progress");
  });

  it("una etapa pendiente (aún no empezada) lleva el círculo gris en vez del spinner", async () => {
    const upcoming: EducationStage = { ...withOptional().at(-1)!, status: "upcoming" };
    const { document } = await render("es", [...educationStages, upcoming]);

    const job = document.querySelectorAll("[data-job]")[3];
    expect(job).toHaveAttribute("data-state", "pending");
    expect(job).toHaveTextContent("Próximamente");
    expect(job?.querySelector(".sr-only")).toHaveTextContent("pendiente");
  });
});
