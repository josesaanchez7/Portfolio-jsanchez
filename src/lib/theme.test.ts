import { describe, expect, it, vi } from "vitest";
import { DEFAULT_THEME, parseTheme, readStoredTheme, storeTheme, THEME_STORAGE_KEY } from "./theme";

describe("parseTheme", () => {
  it("acepta solo los temas válidos", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
  });

  it.each([null, undefined, "", "Dark", "blue", 1, {}])("rechaza %j", (value) => {
    expect(parseTheme(value)).toBeNull();
  });
});

describe("readStoredTheme / storeTheme", () => {
  it("devuelve el tema por defecto si no hay nada guardado", () => {
    expect(readStoredTheme()).toBe(DEFAULT_THEME);
  });

  it("recupera el tema guardado", () => {
    storeTheme("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(readStoredTheme()).toBe("light");
  });

  it("ignora valores corruptos en localStorage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "{not-a-theme}");
    expect(readStoredTheme()).toBe(DEFAULT_THEME);
  });

  it("no falla si localStorage no está disponible", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(readStoredTheme()).toBe(DEFAULT_THEME);
    expect(() => storeTheme("light")).not.toThrow();

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
