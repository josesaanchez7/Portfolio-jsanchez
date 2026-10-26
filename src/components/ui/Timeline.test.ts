// @vitest-environment node
import { describe, expect, it } from "vitest";
import { workExperience } from "../../data/experience";
import { renderComponent } from "../../test/render";
import type { ExperienceItem } from "../../types/content";
import ExperienceSection from "../sections/ExperienceSection.astro";

const job = (
  title: string,
  organization: string,
  start: string,
  end: string | undefined,
  extra: Partial<ExperienceItem> = {},
): ExperienceItem => ({
  kind: "work",
  start,
  ...(end !== undefined && { end }),
  title: { es: title, en: title },
  organization: { es: organization, en: organization },
  period: { es: `${start} – ${end ?? "Actualidad"}`, en: `${start} – ${end ?? "Present"}` },
  ticket: `T-${start.replace("-", "")}`,
  highlights: [{ es: `Logro de ${title}`, en: `Achievement of ${title}` }],
  ...extra,
});

// Datos de prueba (no se publican): dos empresas con un hueco de 3 meses entre ellas y un puesto anterior sin hueco.
const WITH_GAP = [
  job("Jefe", "Beta SL", "2024-05", undefined, { promotion: true }),
  job("Junior", "Beta SL", "2023-05", "2024-04"),
  job("Becario", "Alfa SA", "2022-03", "2023-01"),
];
const CONTIGUOUS = [job("Senior", "Beta SL", "2023-05", undefined), job("Junior", "Alfa SA", "2022-03", "2023-04")];

const render = (items?: ExperienceItem[], language?: "es" | "en") =>
  renderComponent(ExperienceSection, { ...(items && { props: { items } }), ...(language && { language }) });

describe("Timeline: eje único", () => {
  it("toda la sección es un solo eje, y las empresas son nodos sobre él, no tarjetas con borde", async () => {
    const { document } = await render(WITH_GAP);

    expect(document.querySelectorAll("[data-timeline]")).toHaveLength(1);
    const companies = [...document.querySelectorAll("[data-timeline] > li[data-company]")];
    expect(companies.map((company) => company.getAttribute("data-company"))).toEqual(["Beta SL", "Alfa SA"]);
    // Cada puesto cuelga de su empresa.
    expect(companies.map((company) => company.querySelectorAll("article").length)).toEqual([2, 1]);
    for (const company of companies) expect(company.className).not.toMatch(/border|rounded|bg-/);
  });

  it("entre empresas el eje continúa con un tramo discontinuo, y solo etiqueta el hueco si lo hubo", async () => {
    const gap = await render(WITH_GAP);
    const chained = await render(CONTIGUOUS);

    expect(gap.document.querySelectorAll("[data-gap]")).toHaveLength(1);
    expect(gap.document.querySelector("[data-gap]")).toHaveTextContent("Hueco: 3 meses");
    expect(chained.document.querySelectorAll("[data-gap]")).toHaveLength(1);
    expect(chained.document.querySelector("[data-gap]")?.textContent?.trim()).toBe("");
    expect(chained.queryByText(/Hueco/)).toBeNull();
  });

  it("la etiqueta del hueco se traduce", async () => {
    const { getByText } = await render(WITH_GAP, "en");

    expect(getByText("Gap: 3 months")).toBeInTheDocument();
  });

  it("empieza en «Hoy», con punto verde pulsante, y acaba en el nodo tenue «Inicio de mi trayectoria profesional»", async () => {
    const { document } = await render(WITH_GAP);

    const nodes = [...document.querySelectorAll("[data-timeline] > li")];
    expect(nodes[0]).toHaveTextContent("Hoy");
    expect(nodes[0]?.querySelector(".animate-ping")).not.toBeNull();
    expect(nodes.at(-1)).toHaveTextContent("Inicio de mi trayectoria profesional");
    expect(nodes.at(-1)?.querySelector(".animate-ping")).toBeNull();
  });

  it("los nodos de «Hoy» e «Inicio» se traducen", async () => {
    const { getByText } = await render(WITH_GAP, "en");

    expect(getByText("Today")).toBeInTheDocument();
    expect(getByText("Start of my professional career")).toBeInTheDocument();
  });

  it("la cabecera de la empresa lleva solo la duración total: las fechas aparecen una vez, en cada puesto", async () => {
    const { document } = await render(WITH_GAP);

    const beta = document.querySelector("[data-company='Beta SL']");
    const header = beta?.querySelector("[data-node]:not(li)");
    expect(header).toHaveTextContent("Beta SL");
    expect(header?.querySelector("[data-tenure]")).not.toBeNull();
    expect(header?.textContent).not.toMatch(/2023|2024|–/);
    // Cada puesto muestra su periodo una sola vez.
    expect(document.body.textContent?.match(/2024-05 – Actualidad/g)).toHaveLength(1);
  });

  it("recorta lo que sobresale por la derecha: los tickets sin revelar no provocan scroll horizontal", async () => {
    const { document } = await render(WITH_GAP);

    expect(document.querySelector("[data-timeline]")?.parentElement?.className).toContain("overflow-x-clip");
  });

  it("no hay regla de años: solo nodos con sus fechas", async () => {
    const { document } = await render(WITH_GAP);

    expect(document.querySelector("[data-year]")).toBeNull();
  });

  it("agrupa los puestos de una empresa solo con un fondo suave, sin bordes", async () => {
    const { document } = await render(WITH_GAP);

    const roles = document.querySelector("[data-company] > ol");
    expect(roles?.className).toContain("before:bg-linear-to-r");
    expect(roles?.className).not.toMatch(/before:border/);
  });

  it("la píldora de promoción solo va entre dos puestos de la misma empresa", async () => {
    const withPill = await render(WITH_GAP);
    const without = await render([
      job("Jefe", "Beta SL", "2024-05", undefined, { promotion: true }),
      job("Becario", "Alfa SA", "2022-03", "2024-04"),
    ]);

    expect(withPill.document.querySelectorAll("[data-promotion]")).toHaveLength(1);
    expect(without.document.querySelectorAll("[data-promotion]")).toHaveLength(0);
  });
});

describe("Timeline: datos publicados", () => {
  it("un puesto por ticket, del más reciente al más antiguo, con su duración", async () => {
    const { document, getAllByRole } = await render();

    expect(getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent)).toEqual(
      workExperience.map((item) => item.title.es),
    );
    expect(document.querySelectorAll("[data-node] [data-tenure]").length).toBeGreaterThan(0);
  });

  it("sin JavaScript la línea se ve ya dibujada (--fill: 1) y sin marca de «preparada»", async () => {
    const { document } = await render();

    const list = document.querySelector("[data-timeline]");
    expect(list).toHaveAttribute("style", expect.stringContaining("--fill:1"));
    expect(list).not.toHaveAttribute("data-ready");
  });

  it("los nodos, y el contenido de los puestos, solo se apagan cuando el script marca el eje como preparado", async () => {
    const { document } = await render();

    const tracks = [...document.querySelectorAll("[data-node] [data-track]")];
    expect(tracks.length).toBeGreaterThan(0);
    expect(tracks.some((track) => track.className.includes("group-data-ready:data-lit:bg-accent"))).toBe(true);
    expect(document.querySelector("[data-reveal]")?.className).toContain("group-data-ready:opacity-0");
  });

  it("la ruta de la cabecera va de la más antigua a la actual e incluye la subtarea como «+ PHP»", async () => {
    const { getByRole } = await render();

    const stages = getByRole("list", { name: "Trayectoria" });
    const names = [...stages.querySelectorAll("li:not([aria-hidden])")].map((stage) => stage.textContent?.trim());
    expect(names).toEqual(["Soporte técnico", "+ PHP", "QA Tester"]);
    expect(stages.querySelector("[aria-current='step']")).toHaveTextContent("QA Tester");
  });

  it("entre QA Tester y Soporte técnico hay una píldora de promoción interna, también en inglés", async () => {
    const es = await render();
    const en = await render(undefined, "en");

    expect(es.getByText(/Promoción interna/)).toBeInTheDocument();
    expect(en.getByText(/Internal promotion/)).toBeInTheDocument();
  });

  it("no se publican puestos de prueba", () => {
    for (const item of workExperience) {
      expect(`${item.organization?.es} ${item.title.es}`, item.title.es).not.toMatch(/ficticia|ejemplo|placeholder|lorem/i);
    }
  });
});
