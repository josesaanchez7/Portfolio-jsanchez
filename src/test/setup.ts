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
  delete document.documentElement.dataset.debug;
  document.documentElement.lang = "es";
  window.history.replaceState(null, "", "/");
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

HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  if (!this.hasAttribute("open")) return;
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};
