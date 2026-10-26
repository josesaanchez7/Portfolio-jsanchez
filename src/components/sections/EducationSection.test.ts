// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderComponent } from "../../test/render";
import EducationSection from "./EducationSection.astro";

describe("EducationSection", () => {
  it("es la sección «Formación», con su encabezado y una versión dentro", async () => {
    const { getByRole, document } = await renderComponent(EducationSection);

    expect(getByRole("heading", { level: 2, name: "Formación" })).toBeInTheDocument();
    expect(document.querySelector("#Education")).not.toBeNull();
    expect(document.querySelector("#Education")).toHaveTextContent("Colegio Concertado San José");
  });

  it("importa una sola versión, y cambiar de versión es cambiar ese import", () => {
    const source = readFileSync("src/components/sections/EducationSection.astro", "utf8");
    const imports = [...source.matchAll(/^import .+ from "(.+)";$/gm)].map((match) => match[1]);

    expect(imports.filter((path) => path?.startsWith("./Education"))).toHaveLength(1);
  });
});
