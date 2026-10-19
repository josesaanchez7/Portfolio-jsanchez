import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LANGUAGE,
  detectLanguage,
  getInitialLanguage,
  LANGUAGE_STORAGE_KEY,
  parseLanguage,
  readStoredLanguage,
  storeLanguage,
} from "./language";

describe("parseLanguage", () => {
  it("acepta solo idiomas soportados", () => {
    expect(parseLanguage("es")).toBe("es");
    expect(parseLanguage("en")).toBe("en");
  });

  it.each([null, undefined, "", "fr", "EN", "en-US", 1])("rechaza %j", (value) => {
    expect(parseLanguage(value)).toBeNull();
  });
});

describe("detectLanguage", () => {
  it("usa el primer idioma soportado de las preferencias", () => {
    expect(detectLanguage(["fr-FR", "en-GB", "es"])).toBe("en");
    expect(detectLanguage(["es-ES", "en"])).toBe("es");
  });

  it("ignora mayúsculas y regiones", () => {
    expect(detectLanguage(["EN-us"])).toBe("en");
  });

  it("vuelve al idioma por defecto si no hay coincidencias", () => {
    expect(detectLanguage(["fr-FR", "de"])).toBe(DEFAULT_LANGUAGE);
    expect(detectLanguage([])).toBe(DEFAULT_LANGUAGE);
  });
});

describe("persistencia", () => {
  it("guarda y recupera el idioma", () => {
    storeLanguage("en");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    expect(readStoredLanguage()).toBe("en");
  });

  it("ignora valores corruptos", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "klingon");
    expect(readStoredLanguage()).toBeNull();
  });

  it("no falla si localStorage no está disponible", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(readStoredLanguage()).toBeNull();
    expect(() => storeLanguage("en")).not.toThrow();

    getItem.mockRestore();
    setItem.mockRestore();
  });
});

describe("getInitialLanguage", () => {
  it("prioriza la elección guardada sobre el navegador", () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US"]);
    storeLanguage("es");

    expect(getInitialLanguage()).toBe("es");
    vi.restoreAllMocks();
  });

  it("sin elección guardada usa el idioma del navegador", () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US"]);
    localStorage.clear();

    expect(getInitialLanguage()).toBe("en");
    vi.restoreAllMocks();
  });
});
