import { describe, expect, it } from "vitest";
import { formatInteger, formatMonthYear } from "./format";

describe("formatInteger", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1284, "1.284"],
    [1000000, "1.000.000"],
  ])("agrupa %i en español como %s", (value, expected) => {
    expect(formatInteger(value, "es")).toBe(expected);
  });

  it("usa la coma como separador en inglés", () => {
    expect(formatInteger(1284, "en")).toBe("1,284");
    expect(formatInteger(1234567, "en")).toBe("1,234,567");
  });

  it("descarta los decimales", () => {
    expect(formatInteger(1284.9, "es")).toBe("1.284");
  });
});

describe("formatMonthYear", () => {
  it("abrevia el mes como el resto de fechas de la web", () => {
    expect(formatMonthYear("2026-08", "es")).toBe("ago. 2026");
    expect(formatMonthYear("2026-08", "en")).toBe("Aug 2026");
  });

  it("una fecha solo con año se devuelve tal cual", () => {
    expect(formatMonthYear("2021", "es")).toBe("2021");
  });
});
