import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./clipboard";

const setClipboard = (writeText?: (text: string) => Promise<void>) =>
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });

describe("copyText", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setClipboard(undefined);
  });

  it("usa la Clipboard API cuando está disponible", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    await expect(copyText("hola@ejemplo.com")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("hola@ejemplo.com");
  });

  it("si la API falla, copia con un textarea oculto y lo retira después", async () => {
    setClipboard(() => Promise.reject(new Error("Document is not focused")));
    const exec = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", { value: exec, configurable: true });

    await expect(copyText("hola@ejemplo.com")).resolves.toBe(true);
    expect(exec).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("devuelve false si ningún método funciona", async () => {
    setClipboard(undefined);
    Object.defineProperty(document, "execCommand", { value: () => false, configurable: true });

    await expect(copyText("x")).resolves.toBe(false);
  });
});
