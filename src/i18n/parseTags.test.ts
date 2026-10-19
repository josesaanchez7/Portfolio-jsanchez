import { describe, expect, it } from "vitest";
import { parseTags } from "./parseTags";

describe("parseTags", () => {
  it("separa el texto y las partes con etiqueta conocida", () => {
    expect(parseTags("a <ok>b</ok> c <dim>d</dim>", ["ok", "dim"])).toEqual([
      { text: "a " },
      { text: "b", tag: "ok" },
      { text: " c " },
      { text: "d", tag: "dim" },
    ]);
  });

  it("deja como texto las etiquetas desconocidas", () => {
    expect(parseTags("a <i>b</i> c", ["ok"])).toEqual([{ text: "a <i>b</i> c" }]);
  });

  it("devuelve una sola parte si no hay marcas, y ninguna si el texto está vacío", () => {
    expect(parseTags("Sin marcas", ["ok"])).toEqual([{ text: "Sin marcas" }]);
    expect(parseTags("", ["ok"])).toEqual([]);
  });

  it("no interpreta HTML: un <script> queda como texto", () => {
    expect(parseTags('<script>alert("x")</script>', ["ok"])).toEqual([
      { text: '<script>alert("x")</script>' },
    ]);
  });

  it("respeta los espacios iniciales de la línea", () => {
    expect(parseTags("  <ok>✓</ok> test", ["ok"])).toEqual([
      { text: "  " },
      { text: "✓", tag: "ok" },
      { text: " test" },
    ]);
  });
});
