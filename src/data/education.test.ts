import { describe, expect, it } from "vitest";
import { allEducationStages, educationItems, educationStages, stageName, stageRange } from "./education";
import { education, upcomingCertifications } from "./experience";

describe("datos de Formación", () => {
  it("las etapas activas van en orden cronológico: bachillerato, DAM y certificación de Postman", () => {
    expect(educationStages.map((stage) => stage.id)).toEqual(["bachillerato", "dam", "postman"]);
  });

  it("la etapa opcional «en curso» existe pero está desactivada y no sale en ninguna lista", () => {
    const optional = allEducationStages.find((stage) => stage.status === "in-progress");
    expect(optional?.title.es).toBe("ISTQB Foundation");
    expect(optional?.enabled).toBe(false);
    expect(educationStages).not.toContain(optional);
    expect(educationItems.map((item) => item.title.es)).not.toContain("ISTQB Foundation");
    expect(upcomingCertifications).toEqual([]);
  });

  it("los ids son únicos", () => {
    const ids = allEducationStages.map((stage) => stage.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("solo hay una etapa abierta por defecto y es el DAM", () => {
    expect(educationStages.filter((stage) => stage.openByDefault).map((stage) => stage.id)).toEqual(["dam"]);
  });

  it("la cápsula muestra el rango de años de unos estudios y solo el año de una certificación", () => {
    const by = (id: string) => allEducationStages.find((stage) => stage.id === id)!;
    expect(stageRange(by("bachillerato"))).toBe("2018 – 2020");
    expect(stageRange(by("dam"))).toBe("2021 – 2024");
    expect(stageRange(by("postman"))).toBe("2026");
    expect(stageRange(by("istqb"))).toBe("2026");
  });

  it("solo las certificaciones tienen credencial, y es un enlace https conservado", () => {
    for (const stage of allEducationStages) {
      expect(Boolean(stage.credential), stage.id).toBe(stage.kind === "certification" && stage.status === "done");
    }
    expect(educationStages.find((stage) => stage.id === "postman")?.credential?.url).toBe(
      "https://verify.skilljar.com/c/pu9b9suir8w2",
    );
  });

  it("el nombre corto sirve para las cápsulas y, si no hay, se usa el título", () => {
    const dam = allEducationStages.find((stage) => stage.id === "dam")!;
    expect(stageName(dam)).toEqual({ es: "Desarrollo de Apps Multiplataforma", en: "Multiplatform App Development" });
    // El nombre completo sigue disponible para el panel de detalles.
    expect(dam.title.es).toBe("Desarrollo de Aplicaciones Multiplataforma");
    expect(stageName(allEducationStages.find((stage) => stage.id === "postman")!).es).toBe("API Testing Learning Path");
  });

  it("la versión de tarjetas y la lista general de experiencia reciben las mismas etapas completadas", () => {
    expect(education.map((item) => item.title.es).sort()).toEqual(educationItems.map((item) => item.title.es).sort());
    expect(education.find((item) => item.kind === "certification")?.period?.es).toBe("Completado: 12 ago. 2026");
  });
});
