import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { setReducedMotion } from "./reducedMotion";

// jsdom anuncia "en-US": los tests parten de español salvo que indiquen otra cosa.
// Por defecto se simula "reducir movimiento" para que la pantalla de carga no tape la web en los tests.
beforeEach(() => {
  localStorage.setItem("language", "es");
  setReducedMotion(true);
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  document.body.style.overflow = "";
  delete document.documentElement.dataset.theme;
  document.documentElement.lang = "es";
});

// jsdom no implementa IntersectionObserver ni los métodos modales de <dialog>.
class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly scrollMargin = "";
  readonly thresholds: readonly number[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

HTMLDialogElement.prototype.showModal = vi.fn();
HTMLDialogElement.prototype.close = vi.fn();
