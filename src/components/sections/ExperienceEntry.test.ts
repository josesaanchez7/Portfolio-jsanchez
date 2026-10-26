// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Language } from "../../lib/language";
import { renderComponent } from "../../test/render";
import type { ExperienceItem } from "../../types/content";
import ExperienceEntry from "./ExperienceEntry.astro";

const current: ExperienceItem = {
  kind: "work",
  start: "2025-10",
  title: { es: "QA Tester", en: "QA Tester" },
  period: { es: "oct. 2025 – Actualidad", en: "Oct 2025 – Present" },
  ticket: "TOR-2025",
  highlights: [
    { es: "Pruebas manuales", en: "Manual testing" },
    { es: "Validación de APIs", en: "API validation" },
  ],
  tech: ["JIRA", "Postman"],
};

const past: ExperienceItem = {
  kind: "work",
  start: "2023-05",
  end: "2025-09",
  title: { es: "Soporte técnico", en: "Technical support" },
  period: { es: "may. 2023 – sep. 2025", en: "May 2023 – Sep 2025" },
  ticket: "TOR-2023",
  highlights: [{ es: "Asistencia técnica", en: "Technical assistance" }],
  subtasks: [
    {
      ticket: "TOR-2023-1",
      title: { es: "Desarrollo PHP", en: "PHP development" },
      label: "PHP",
      start: "2024-10",
      end: "2025-09",
      period: { es: "oct. 2024 – sep. 2025", en: "Oct 2024 – Sep 2025" },
      tech: ["PHP"],
    },
  ],
};

const renderEntry = (item: ExperienceItem, language?: Language) =>
  renderComponent(ExperienceEntry, { props: { item }, ...(language && { language }) });

describe("ExperienceEntry: tarjeta tipo ticket", () => {
  it("muestra el ID, el título, el periodo y los criterios de aceptación", async () => {
    const { getByText, getByRole } = await renderEntry(current);

    expect(getByText("TOR-2025")).toBeInTheDocument();
    expect(getByRole("heading", { level: 4, name: "QA Tester" })).toBeInTheDocument();
    expect(getByText("oct. 2025 – Actualidad")).toBeInTheDocument();
    expect(getByText("Criterios de aceptación")).toBeInTheDocument();
    expect(getByText("Pruebas manuales")).toBeInTheDocument();
    expect(getByText("Validación de APIs")).toBeInTheDocument();
  });

  it("el puesto en curso va «En curso» con su duración en vivo; el anterior, «Hecho» y con duración fija", async () => {
    const ongoing = await renderEntry(current);
    const done = await renderEntry(past);

    expect(ongoing.getByText("En curso")).toBeInTheDocument();
    expect(ongoing.document.querySelector("[data-tenure]")).toHaveAttribute("data-start", "2025-10");
    expect(done.getByText("Hecho")).toBeInTheDocument();
    expect(done.document.querySelector("[data-tenure]")).toBeNull();
    expect(done.getByText("2 años y 5 meses")).toBeInTheDocument();
  });

  it("muestra las tecnologías como chips y no pinta lo que no hay", async () => {
    const withTech = await renderEntry(current);
    const without = await renderEntry({ ...past, subtasks: undefined });

    expect(withTech.getByRole("list", { name: "Tecnologías" })).toHaveTextContent("JIRAPostman");
    expect(without.queryByRole("list", { name: "Tecnologías" })).toBeNull();
    expect(without.queryByRole("group")).toBeNull();
  });

  it("la subtarea cuelga del ticket con su ID, su periodo, su duración y su chip", async () => {
    const { getByRole, getByText } = await renderEntry(past);

    const subtask = getByRole("group", { name: "Subtarea: Desarrollo PHP" });
    expect(subtask).toHaveTextContent("TOR-2023-1");
    expect(subtask).toHaveTextContent("oct. 2024 – sep. 2025");
    expect(subtask).toHaveTextContent("1 año y 0 meses");
    expect(subtask.querySelector("li")).toHaveTextContent("PHP");
    // Va dentro de la tarjeta del puesto padre, no como ticket aparte.
    expect(subtask.closest("article")).toHaveTextContent("TOR-2023");
    expect(getByText("TOR-2023")).toBeInTheDocument();
  });

  it("el falso criterio sobre PHP ya no aparece entre los criterios de aceptación", async () => {
    const { queryByText } = await renderEntry(past);

    expect(queryByText(/durante su último año/)).toBeNull();
  });

  it("se traduce al inglés", async () => {
    const ongoing = await renderEntry(current, "en");
    const done = await renderEntry(past, "en");

    expect(ongoing.getByText("In progress")).toBeInTheDocument();
    expect(ongoing.getByText("Acceptance criteria")).toBeInTheDocument();
    expect(ongoing.getByText("Manual testing")).toBeInTheDocument();
    expect(done.getByRole("group", { name: "Subtask: PHP development" })).toBeInTheDocument();
    expect(done.getByText("2 years and 5 months")).toBeInTheDocument();
  });
});
