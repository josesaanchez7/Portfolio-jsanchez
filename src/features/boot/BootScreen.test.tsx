import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Providers from "../../Providers";
import { setReducedMotion } from "../../test/reducedMotion";
import BootScreen from "./BootScreen";
import { BOOT_SEQUENCE, PROMPT } from "./bootSequence";
import {
  buildTimeline,
  CHAR_DELAY_MS,
  EXIT_DURATION_MS,
  getTimelineDuration,
  START_DELAY_MS,
} from "./bootTimeline";

const FULL_DURATION = getTimelineDuration(buildTimeline(BOOT_SEQUENCE));

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

const renderBoot = (props: Parameters<typeof BootScreen>[0] = {}, strict = false) => {
  const tree = (
    <Providers>
      <BootScreen {...props} />
    </Providers>
  );
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
};

// Texto realmente visible: las líneas aún no escritas están en el DOM (ocultas) para reservar espacio.
const terminalText = () => {
  const clone = screen.getByRole("status").cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-pending]").forEach((element) => element.remove());
  return clone.textContent ?? "";
};

beforeEach(() => {
  setReducedMotion(false);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("BootScreen: secuencia", () => {
  it("expone un estado accesible y oculta el texto que se escribe", () => {
    const { container } = renderBoot();

    expect(screen.getByRole("status", { name: "Cargando portfolio" })).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Saltar la animación de carga" })).toBeInTheDocument();
  });

  it("escribe el primer comando letra a letra tras el prompt", () => {
    renderBoot();
    expect(terminalText()).not.toContain(PROMPT);

    advance(START_DELAY_MS);
    expect(terminalText()).toContain(PROMPT);

    advance(CHAR_DELAY_MS * 3);
    expect(terminalText()).toContain(`${PROMPT} git`);
    expect(terminalText()).not.toContain("git clone");
  });

  it("al terminar muestra toda la salida con sus colores", () => {
    const { container } = renderBoot();

    advance(FULL_DURATION - 1);

    expect(terminalText()).toContain("Cloning into 'portfolio'... done.");
    expect(terminalText()).toContain("Encuéntralos tú.");
    expect(container.querySelector('[data-tone="ok"]')).toHaveTextContent("✓");
    const passed = [...container.querySelectorAll('[data-tone="ok"]')].find((el) => el.textContent === "5 passed");
    expect(passed).toBeDefined();
    expect(container.querySelector('[data-tone="warn"]')).toHaveTextContent("5 bugs detectados");
  });

  it("muestra la salida en inglés si ese es el idioma", () => {
    localStorage.setItem("language", "en");
    renderBoot();

    advance(FULL_DURATION - 1);

    expect(terminalText()).toContain("Find them yourself.");
    expect(terminalText()).not.toContain("Encuéntralos");
  });

  it("se cierra solo: tras la secuencia hace el fundido y avisa una vez con onFinish", () => {
    const onFinish = vi.fn();
    const { container } = renderBoot({ onFinish });

    advance(FULL_DURATION);
    expect(container.querySelector("[data-exiting]")).not.toBeNull();
    expect(onFinish).not.toHaveBeenCalled();

    advance(EXIT_DURATION_MS);
    expect(screen.queryByRole("status")).toBeNull();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});

describe("BootScreen: saltar", () => {
  it("un clic en cualquier parte salta la animación", () => {
    const onFinish = vi.fn();
    const { container } = renderBoot({ onFinish });
    advance(500);

    fireEvent.click(screen.getByRole("status"));
    expect(container.querySelector("[data-exiting]")).not.toBeNull();

    advance(EXIT_DURATION_MS);
    expect(screen.queryByRole("status")).toBeNull();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("el botón Saltar también funciona", () => {
    const onFinish = vi.fn();
    renderBoot({ onFinish });

    fireEvent.click(screen.getByRole("button", { name: /saltar/i }));
    advance(EXIT_DURATION_MS);

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["Enter", "Enter"],
    ["Escape", "Escape"],
    ["espacio", " "],
  ])("la tecla %s salta la animación", (_name, key) => {
    const onFinish = vi.fn();
    renderBoot({ onFinish });

    fireEvent.keyDown(document, { key });
    advance(EXIT_DURATION_MS);

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("Ctrl+Enter no salta (no interfiere con atajos del navegador)", () => {
    const { container } = renderBoot();

    fireEvent.keyDown(document, { key: "Enter", ctrlKey: true });

    expect(container.querySelector("[data-exiting]")).toBeNull();
  });

  it("varios intentos de salto seguidos solo avisan una vez", () => {
    const onFinish = vi.fn();
    renderBoot({ onFinish });

    fireEvent.click(screen.getByRole("status"));
    fireEvent.keyDown(document, { key: "Enter" });
    fireEvent.click(screen.getByRole("status"));
    advance(EXIT_DURATION_MS * 3);

    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});

describe("BootScreen: cuándo se muestra", () => {
  it("con prefers-reduced-motion no se muestra y avisa de que ha terminado", () => {
    setReducedMotion(true);
    const onFinish = vi.fn();

    renderBoot({ onFinish });

    expect(screen.queryByRole("status")).toBeNull();
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(document.body.style.overflow).toBe("");
  });

  it("oncePerSession: la primera vez se muestra y la segunda no", () => {
    const first = renderBoot({ oncePerSession: true });
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(sessionStorage.getItem("boot-seen")).toBe("1");
    first.unmount();

    const onFinish = vi.fn();
    renderBoot({ oncePerSession: true, onFinish });

    expect(screen.queryByRole("status")).toBeNull();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("sin oncePerSession se muestra siempre y no guarda nada", () => {
    renderBoot().unmount();
    renderBoot();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(sessionStorage.getItem("boot-seen")).toBeNull();
  });

  it("si sessionStorage falla, se muestra igualmente", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => renderBoot({ oncePerSession: true })).not.toThrow();
    expect(screen.getByRole("status")).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});

describe("BootScreen: scroll y limpieza", () => {
  it("bloquea el scroll mientras se ve y lo restaura al cerrar", () => {
    document.body.style.overflow = "scroll";
    renderBoot();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Enter" });
    advance(EXIT_DURATION_MS);

    expect(document.body.style.overflow).toBe("scroll");
  });

  it("al desmontar a mitad de secuencia restaura el scroll y cancela todos los temporizadores", () => {
    const onFinish = vi.fn();
    const { unmount } = renderBoot({ onFinish });
    advance(1000);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(document.body.style.overflow).toBe("");
    expect(vi.getTimerCount()).toBe(0);
    advance(FULL_DURATION + EXIT_DURATION_MS);
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("al desmontar quita el listener de teclado", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderBoot();

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});

describe("BootScreen: StrictMode", () => {
  it("no duplica caracteres ni temporizadores con el doble montaje", () => {
    renderBoot({}, true);

    // Una sola cadena de setTimeout, no dos.
    expect(vi.getTimerCount()).toBe(1);

    advance(START_DELAY_MS + CHAR_DELAY_MS * 3);
    expect(terminalText()).toContain(`${PROMPT} git`);
    expect(terminalText()).not.toContain("gitgit");
    expect(vi.getTimerCount()).toBe(1);
  });

  it("completa la secuencia y llama a onFinish exactamente una vez", () => {
    const onFinish = vi.fn();
    renderBoot({ onFinish }, true);

    // Por separado: el temporizador del fundido solo se programa cuando React termina de renderizar.
    advance(FULL_DURATION);
    advance(EXIT_DURATION_MS);

    expect(screen.queryByRole("status")).toBeNull();
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("con reduced-motion llama a onFinish una sola vez aunque React monte dos veces", () => {
    setReducedMotion(true);
    const onFinish = vi.fn();

    renderBoot({ onFinish }, true);

    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
