import { describe, expect, it } from "vitest";
import { monthsBetweenJobs } from "./timeline";

describe("monthsBetweenJobs", () => {
  it("0 si un empleo empieza el mes siguiente a que acabe el anterior", () => {
    expect(monthsBetweenJobs({ end: "2023-04" }, { start: "2023-05" })).toBe(0);
  });

  it("cuenta los meses completos sin trabajo entre dos empleos", () => {
    // acaba en ene. 2023 y empieza en may. 2023: febrero, marzo y abril.
    expect(monthsBetweenJobs({ end: "2023-01" }, { start: "2023-05" })).toBe(3);
  });

  it("nunca es negativo (empleos solapados) ni cuenta un empleo que sigue en curso", () => {
    expect(monthsBetweenJobs({ end: "2023-08" }, { start: "2023-05" })).toBe(0);
    expect(monthsBetweenJobs({}, { start: "2023-05" })).toBe(0);
  });
});
