// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Language } from "../../lib/language";
import { renderComponent } from "../../test/render";
import type { ExperienceItem } from "../../types/content";
import ExperienceEntry from "./ExperienceEntry.astro";

const certification: ExperienceItem = {
  kind: "certification",
  start: "2026-01",
  title: { es: "Certificación de ejemplo", en: "Example certification" },
  organization: { es: "Entidad de ejemplo", en: "Example issuer" },
  period: { es: "ene. 2026", en: "Jan 2026" },
  credential: { id: "ABC-123", url: "https://example.com/verify/ABC-123" },
};

const renderEntry = (item: ExperienceItem, language?: Language) =>
  renderComponent(ExperienceEntry, { props: { item }, ...(language && { language }) });

describe("ExperienceEntry: credencial", () => {
  it("muestra el ID y un enlace externo seguro a la verificación", async () => {
    const { getByText, getByRole } = await renderEntry(certification);

    expect(getByText("ID de la credencial: ABC-123")).toBeInTheDocument();
    const link = getByRole("link", { name: "Mostrar credencial" });
    expect(link).toHaveAttribute("href", "https://example.com/verify/ABC-123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("se traduce al inglés", async () => {
    const { getByText, getByRole } = await renderEntry(certification, "en");

    expect(getByText("Credential ID: ABC-123")).toBeInTheDocument();
    expect(getByRole("link", { name: "Show credential" })).toBeInTheDocument();
  });

  it("sin URL muestra solo el ID, sin botón", async () => {
    const { getByText, queryByRole } = await renderEntry({ ...certification, credential: { id: "ABC-123" } });

    expect(getByText("ID de la credencial: ABC-123")).toBeInTheDocument();
    expect(queryByRole("link")).toBeNull();
  });

  it("sin ID muestra solo el botón", async () => {
    const { queryByText, getByRole } = await renderEntry({
      ...certification,
      credential: { url: "https://example.com/verify" },
    });

    expect(queryByText(/ID de la credencial/)).toBeNull();
    expect(getByRole("link", { name: "Mostrar credencial" })).toBeInTheDocument();
  });

  it("sin credencial no muestra nada extra", async () => {
    const { queryByText, queryByRole } = await renderEntry({ ...certification, credential: undefined });

    expect(queryByText(/ID de la credencial/)).toBeNull();
    expect(queryByRole("link")).toBeNull();
  });

  it("muestra entidad, fecha y el tipo de entrada", async () => {
    const { getByText } = await renderEntry(certification);

    expect(getByText("Entidad de ejemplo")).toBeInTheDocument();
    expect(getByText("ene. 2026")).toBeInTheDocument();
    expect(getByText("Certificación")).toBeInTheDocument();
  });
});
