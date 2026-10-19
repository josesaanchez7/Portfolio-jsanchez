import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Providers from "../../Providers";
import type { ExperienceItem } from "../../types/content";
import ExperienceEntry from "./ExperienceEntry";

const certification: ExperienceItem = {
  kind: "certification",
  title: { es: "Certificación de ejemplo", en: "Example certification" },
  organization: { es: "Entidad de ejemplo", en: "Example issuer" },
  period: { es: "ene. 2026", en: "Jan 2026" },
  credential: { id: "ABC-123", url: "https://example.com/verify/ABC-123" },
};

const renderEntry = (item: ExperienceItem) =>
  render(
    <Providers>
      <ol>
        <ExperienceEntry item={item} />
      </ol>
    </Providers>,
  );

describe("ExperienceEntry: credencial", () => {
  it("muestra el ID y un enlace externo seguro a la verificación", () => {
    renderEntry(certification);

    expect(screen.getByText("ID de la credencial: ABC-123")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Mostrar credencial" });
    expect(link).toHaveAttribute("href", "https://example.com/verify/ABC-123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("se traduce al inglés", () => {
    localStorage.setItem("language", "en");
    renderEntry(certification);

    expect(screen.getByText("Credential ID: ABC-123")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Show credential" })).toBeInTheDocument();
  });

  it("sin URL muestra solo el ID, sin botón", () => {
    renderEntry({ ...certification, credential: { id: "ABC-123" } });

    expect(screen.getByText("ID de la credencial: ABC-123")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("sin ID muestra solo el botón", () => {
    renderEntry({ ...certification, credential: { url: "https://example.com/verify" } });

    expect(screen.queryByText(/ID de la credencial/)).toBeNull();
    expect(screen.getByRole("link", { name: "Mostrar credencial" })).toBeInTheDocument();
  });

  it("sin credencial no muestra nada extra", () => {
    renderEntry({ ...certification, credential: undefined });

    expect(screen.queryByText(/ID de la credencial/)).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("muestra entidad, fecha y el tipo de entrada", () => {
    renderEntry(certification);

    expect(screen.getByText("Entidad de ejemplo")).toBeInTheDocument();
    expect(screen.getByText("ene. 2026")).toBeInTheDocument();
    expect(screen.getByText("Certificación")).toBeInTheDocument();
  });
});
