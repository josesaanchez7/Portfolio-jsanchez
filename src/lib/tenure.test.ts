import { describe, expect, it } from "vitest";
import { formatTenure, monthsBetween } from "./tenure";

const date = (year: number, month: number) => new Date(year, month - 1, 15);

describe("monthsBetween", () => {
  it("sin fin cuenta los meses cumplidos hasta hoy", () => {
    expect(monthsBetween("2025-10", undefined, date(2026, 10))).toBe(12);
    expect(monthsBetween("2025-10", undefined, date(2026, 12))).toBe(14);
  });

  it("con fin el periodo es cerrado: el mes de fin cuenta entero", () => {
    expect(monthsBetween("2023-05", "2024-09", date(2030, 1))).toBe(17);
    expect(monthsBetween("2024-10", "2025-09", date(2030, 1))).toBe(12);
  });

  it("una fecha solo con año vale enero y nunca devuelve negativos", () => {
    expect(monthsBetween("2024", undefined, date(2024, 3))).toBe(2);
    expect(monthsBetween("2030-01", undefined, date(2026, 1))).toBe(0);
  });
});

describe("formatTenure", () => {
  it("usa años y meses con el plural de cada idioma", () => {
    expect(formatTenure(12, "es")).toBe("1 año y 0 meses");
    expect(formatTenure(29, "es")).toBe("2 años y 5 meses");
    expect(formatTenure(13, "es")).toBe("1 año y 1 mes");
    expect(formatTenure(12, "en")).toBe("1 year and 0 months");
    expect(formatTenure(25, "en")).toBe("2 years and 1 month");
  });

  it("por debajo del año solo muestra meses", () => {
    expect(formatTenure(5, "es")).toBe("5 meses");
    expect(formatTenure(1, "en")).toBe("1 month");
  });
});
