import { describe, expect, it } from "vitest";
import { matchesQuery, normalizeSearch, wrapIndex } from "./palette";

describe("normalizeSearch", () => {
  it("quita tildes y mayúsculas", () => {
    expect(normalizeSearch("  Educación Sobre MÍ ")).toBe("educacion sobre mi");
  });
});

describe("matchesQuery", () => {
  const haystack = normalizeSearch("Cambiar a tema claro tema modo oscuro dark light");

  it("una búsqueda vacía encaja con todo", () => {
    expect(matchesQuery(haystack, "")).toBe(true);
    expect(matchesQuery(haystack, "   ")).toBe(true);
  });

  it("no distingue tildes ni mayúsculas", () => {
    expect(matchesQuery(normalizeSearch("Educación"), "EDUCACION")).toBe(true);
    expect(matchesQuery(normalizeSearch("Educacion"), "educación")).toBe(true);
  });

  it("todas las palabras deben aparecer, en cualquier orden", () => {
    expect(matchesQuery(haystack, "claro cambiar")).toBe(true);
    expect(matchesQuery(haystack, "claro idioma")).toBe(false);
  });

  it("encuentra por las palabras clave extra", () => {
    expect(matchesQuery(haystack, "dark")).toBe(true);
  });

  it("busca por fragmentos", () => {
    expect(matchesQuery(haystack, "osc")).toBe(true);
  });
});

describe("wrapIndex", () => {
  it("avanza y retrocede dando la vuelta", () => {
    expect(wrapIndex(0, 1, 3)).toBe(1);
    expect(wrapIndex(2, 1, 3)).toBe(0);
    expect(wrapIndex(0, -1, 3)).toBe(2);
  });

  it("sin selección, bajar elige el primero y subir el último", () => {
    expect(wrapIndex(-1, 1, 4)).toBe(0);
    expect(wrapIndex(-1, -1, 4)).toBe(3);
  });

  it("una lista vacía no tiene selección", () => {
    expect(wrapIndex(-1, 1, 0)).toBe(-1);
    expect(wrapIndex(0, -1, 0)).toBe(-1);
  });
});
