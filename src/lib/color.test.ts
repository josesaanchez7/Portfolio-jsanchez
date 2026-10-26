import { describe, expect, it } from "vitest";
import { contrastRatio } from "./color";

describe("contrastRatio", () => {
  it("negro sobre blanco es 21:1 y un color sobre sí mismo, 1:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrastRatio("#3550d6", "#3550d6")).toBeCloseTo(1);
  });

  it("no depende del orden de los colores", () => {
    expect(contrastRatio("#202635", "#8ca5ff")).toBeCloseTo(contrastRatio("#8ca5ff", "#202635"));
  });

  it("coincide con valores conocidos (gris #767676 sobre blanco ≈ 4,54:1)", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 1);
  });
});
