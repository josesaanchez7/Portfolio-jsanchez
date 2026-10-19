import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCopyToClipboard } from "./useCopyToClipboard";

const stubClipboard = (writeText: (text: string) => Promise<void>) =>
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("marca 'copied' y vuelve a 'idle' pasado el tiempo", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const { result } = renderHook(() => useCopyToClipboard(1000));

    await act(() => result.current.copy("hola"));

    expect(writeText).toHaveBeenCalledWith("hola");
    expect(result.current.status).toBe("copied");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.status).toBe("idle");
  });

  it("marca 'error' si el portapapeles rechaza la escritura", async () => {
    stubClipboard(() => Promise.reject(new Error("denied")));
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy("hola"));

    expect(result.current.status).toBe("error");
  });

  it("marca 'error' si no existe la Clipboard API", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy("hola"));

    expect(result.current.status).toBe("error");
  });

  it("reinicia el temporizador si se copia de nuevo antes de que expire", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    const { result } = renderHook(() => useCopyToClipboard(1000));

    await act(() => result.current.copy("a"));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    await act(() => result.current.copy("b"));
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.status).toBe("copied");
  });
});
