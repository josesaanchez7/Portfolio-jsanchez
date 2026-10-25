import { describe, expect, it } from "vitest";
import { LANGUAGES } from "../lib/language";
import { fullYearsSince, metrics } from "./metrics";

describe("fullYearsSince", () => {
  const now = new Date("2026-10-24T12:00:00Z");

  it("cuenta años completos, no redondeados", () => {
    expect(fullYearsSince("2023-05", now)).toBe(3);
    expect(fullYearsSince("2023-11", now)).toBe(2);
    expect(fullYearsSince("2023-10", now)).toBe(3);
  });

  it("un año sin mes cuenta desde enero", () => {
    expect(fullYearsSince("2021", now)).toBe(5);
  });

  it("nunca sale negativo (fecha futura)", () => {
    expect(fullYearsSince("2030-01", now)).toBe(0);
  });
});

describe("metrics", () => {
  it("hay al menos una cifra, todas positivas y con texto en los dos idiomas", () => {
    expect(metrics.length).toBeGreaterThan(0);
    for (const metric of metrics) {
      expect(Number.isInteger(metric.value) && metric.value > 0, JSON.stringify(metric)).toBe(true);
      for (const language of LANGUAGES) expect(metric.label[language].trim()).not.toBe("");
    }
  });
});
