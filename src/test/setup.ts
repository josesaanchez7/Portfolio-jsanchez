import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Los tests de lógica corren en jsdom y limpian el almacenamiento entre pruebas. Los de componentes
// .astro corren en Node (// @vitest-environment node: ver src/test/render.ts) y no tienen window.
afterEach(() => {
  if (typeof localStorage !== "undefined") localStorage.clear();
  if (typeof sessionStorage !== "undefined") sessionStorage.clear();
});
