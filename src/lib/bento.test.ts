import { describe, expect, it } from "vitest";
import { moreTileSpan, projectSpan } from "./bento";

describe("projectSpan", () => {
  it("la destacada ocupa 4 columnas y las demás 2", () => {
    expect(projectSpan(true)).toBe(4);
    expect(projectSpan(false)).toBe(2);
  });
});

describe("moreTileSpan", () => {
  it("sin proyectos ocupa una fila entera", () => {
    expect(moreTileSpan([])).toBe(6);
  });

  it("con un proyecto destacado rellena las 2 columnas que quedan", () => {
    expect(moreTileSpan([true])).toBe(2);
  });

  it("con la destacada y un proyecto normal la fila está completa: ocupa una fila entera", () => {
    expect(moreTileSpan([true, false])).toBe(6);
  });

  it("con la destacada y dos normales rellena 4 columnas de la segunda fila", () => {
    expect(moreTileSpan([true, false, false])).toBe(4);
  });

  it("con la destacada y tres normales rellena 2 columnas", () => {
    expect(moreTileSpan([true, false, false, false])).toBe(2);
  });

  it("sin destacadas, tres proyectos completan la fila", () => {
    expect(moreTileSpan([false, false, false])).toBe(6);
    expect(moreTileSpan([false, false])).toBe(2);
  });
});
