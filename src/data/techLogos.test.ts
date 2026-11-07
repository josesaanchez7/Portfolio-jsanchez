import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "../lib/color";
import { stack } from "./stack";
import { getTechLogo, hoverCss, techLogos } from "./techLogos";

const css = readFileSync("src/styles/global.css", "utf8");
/** Valor de una variable CSS dentro de un bloque (`:root {`). */
const token = (block: string, name: string): string => {
  const start = css.indexOf(block);
  const value = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css.slice(start))?.[1];
  if (!value) throw new Error(`No se encuentra --${name} en ${block}`);
  return value;
};
const SURFACE = token(":root {", "surface");
const ACCENT = token(":root {", "accent");

describe("logos de tecnologías", () => {
  it("cada tecnología del stack tiene su logo", () => {
    const names = new Set(stack.flatMap((category) => category.items.map((item) => item.es)));
    for (const name of names) expect(getTechLogo(name), name).toBeDefined();
  });

  it("cada logo anota su fuente (librería y archivo) y su color de marca oficial", () => {
    for (const [name, logo] of Object.entries(techLogos)) {
      expect(logo.source, name).toMatch(/^(simple-icons|devicon)@\d+\.\d+\.\d+ \((CC0-1\.0|MIT)\) · \S+/);
      expect(logo.brandColor, name).toMatch(/^#[0-9A-F]{6}$/);
    }
    // Las dos excepciones respecto a simple-icons.
    expect(techLogos.Playwright.source).toContain("devicon");
    expect(techLogos.Java.source).toContain("devicon");
    expect(techLogos.Astro.source).toContain("simple-icons");
  });

  it("ningún SVG optimizado pesa más de 2 KB, y cada uno es un único tono (solo trazados, sin colores propios)", () => {
    for (const [name, logo] of Object.entries(techLogos)) {
      expect(logo.bytes, name).toBeLessThanOrEqual(2048);
      expect(logo.paths.length, name).toBeGreaterThan(0);
      expect(logo.viewBox, name).toMatch(/^0 0 \d+ \d+$/);
    }
  });

  it("el tamaño de dibujo mantiene todos los logos dentro de una baldosa de 56 px", () => {
    for (const [name, logo] of Object.entries(techLogos)) {
      expect(logo.width, name).toBeLessThanOrEqual(56);
      expect(logo.height, name).toBeLessThanOrEqual(56);
      expect(logo.width, name).toBeGreaterThanOrEqual(32);
    }
  });

  it("el color de hover de cada logo contrasta al menos 3:1 con la baldosa oscura (marca o acento)", () => {
    for (const [name, logo] of Object.entries(techLogos)) {
      const color = hoverCss(logo);
      const resolved = color === "var(--accent)" ? ACCENT : color;
      expect(contrastRatio(resolved, SURFACE), `${name} (${resolved})`).toBeGreaterThanOrEqual(3);
    }
  });

  it("solo se sustituye el color de marca por el acento donde de verdad no contrasta", () => {
    for (const [name, logo] of Object.entries(techLogos)) {
      const brandFails = contrastRatio(logo.brandColor, SURFACE) < 3;
      expect(Boolean(logo.hoverColor), name).toBe(brandFails);
    }
  });
});
