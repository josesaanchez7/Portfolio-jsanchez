import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../App";
import { cvUrl } from "../../data/cv";
import { profile } from "../../data/profile";
import Providers from "../../Providers";
import { setReducedMotion } from "../../test/reducedMotion";

const renderApp = () =>
  render(
    <Providers>
      <App />
    </Providers>,
  );

const openWithShortcut = () => fireEvent.keyDown(document, { key: "k", ctrlKey: true });
const queryDialog = () => screen.queryByRole("dialog", { name: "Consola" });
const getDialog = () => screen.getByRole("dialog", { name: "Consola" });
const getInput = () => screen.getByLabelText("Escribe un comando");
const getLog = () => screen.getByRole("log");
const logText = () => getLog().textContent ?? "";
const run = async (user: UserEvent, command: string) => {
  await user.type(getInput(), `${command}{Enter}`);
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Consola: apertura", () => {
  it("se abre con Ctrl+K, muestra la bienvenida y coloca el cursor en la línea de comandos", () => {
    renderApp();
    expect(queryDialog()).toBeNull();

    openWithShortcut();

    expect(getDialog()).toBeInTheDocument();
    expect(logText()).toContain("Bienvenido. Escribe help para ver los comandos.");
    expect(within(getLog()).getByText("help")).toHaveClass("text-boot-ok");
    expect(getInput()).toHaveFocus();
  });

  it("se abre con Cmd+K (Mac)", () => {
    renderApp();

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    expect(getDialog()).toBeInTheDocument();
  });

  it("se abre con la tecla ` y con la tecla muerta del teclado español", () => {
    renderApp();
    fireEvent.keyDown(document, { key: "`" });
    expect(getDialog()).toBeInTheDocument();
    fireEvent.keyDown(getDialog(), { key: "Escape" });
    expect(queryDialog()).toBeNull();

    fireEvent.keyDown(document, { key: "Dead", code: "BracketLeft" });
    expect(getDialog()).toBeInTheDocument();
  });

  it("la tecla muerta con Mayús (^) no la abre", () => {
    renderApp();

    fireEvent.keyDown(document, { key: "Dead", code: "BracketLeft", shiftKey: true });

    expect(queryDialog()).toBeNull();
  });

  it("la tecla ` no la abre si se está escribiendo en un campo de texto", () => {
    renderApp();
    const field = document.createElement("input");
    document.body.append(field);
    field.focus();

    fireEvent.keyDown(field, { key: "`" });

    expect(queryDialog()).toBeNull();
    field.remove();
  });

  it("la tecla ` tampoco abre con modificadores", () => {
    renderApp();

    fireEvent.keyDown(document, { key: "`", ctrlKey: true });

    expect(queryDialog()).toBeNull();
  });

  it("escribir ` dentro de la consola no la cierra", () => {
    renderApp();
    openWithShortcut();

    fireEvent.keyDown(getInput(), { key: "`" });

    expect(getDialog()).toBeInTheDocument();
  });

  it("se abre con el botón «>_ Ctrl+K» del footer", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Abrir la consola interactiva (Ctrl+K)" }));

    expect(getDialog()).toBeInTheDocument();
    expect(getInput()).toHaveFocus();
  });

  it("no se puede abrir mientras se muestra la pantalla de carga", () => {
    setReducedMotion(false);
    vi.useFakeTimers();
    renderApp();

    openWithShortcut();
    fireEvent.keyDown(document, { key: "`" });
    expect(queryDialog()).toBeNull();

    fireEvent.keyDown(document, { key: "Enter" });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    openWithShortcut();

    expect(getDialog()).toBeInTheDocument();
  });
});

describe("Consola: cierre", () => {
  const closers: [string, () => void | Promise<void>][] = [
    ["Escape", () => void fireEvent.keyDown(getDialog(), { key: "Escape" })],
    ["el botón ×", () => void fireEvent.click(screen.getByRole("button", { name: "Cerrar consola" }))],
    ["un clic fuera de la ventana", () => void fireEvent.click(getDialog())],
    ["Ctrl+K otra vez", () => void openWithShortcut()],
    ["el comando exit", async () => run(userEvent.setup(), "exit")],
  ];

  it.each(closers)("se cierra con %s", async (_name, close) => {
    renderApp();
    openWithShortcut();
    expect(getDialog()).toBeInTheDocument();

    await close();

    expect(queryDialog()).toBeNull();
  });

  it("un clic dentro de la ventana no la cierra", () => {
    renderApp();
    openWithShortcut();

    fireEvent.click(getLog());

    expect(getDialog()).toBeInTheDocument();
  });

  it("al cerrar, el foco vuelve al elemento que la abrió", async () => {
    const user = userEvent.setup();
    renderApp();
    const opener = screen.getByRole("button", { name: "Abrir la consola interactiva (Ctrl+K)" });
    await user.click(opener);
    expect(getInput()).toHaveFocus();

    fireEvent.keyDown(getDialog(), { key: "Escape" });

    expect(opener).toHaveFocus();
  });

  it("bloquea el scroll de la página mientras está abierta y lo restaura al cerrar", () => {
    document.body.style.overflow = "scroll";
    renderApp();

    openWithShortcut();
    expect(document.body.style.overflow).toBe("hidden");

    openWithShortcut();
    expect(document.body.style.overflow).toBe("scroll");
  });
});

describe("Consola: uso", () => {
  it("repite el comando con el prompt y muestra su resultado", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();

    await run(user, "whoami");

    expect(logText()).toContain("jose@portfolio ~ $ whoami");
    expect(logText()).toContain("José Sánchez. QA Tester en Torcal y desarrollador multiplataforma.");
    expect(getInput()).toHaveValue("");
  });

  it("una línea vacía solo repite el prompt", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();
    const before = getLog().children.length;

    await user.type(getInput(), "{Enter}");

    expect(getLog().children).toHaveLength(before + 1);
    expect(getLog().lastElementChild?.textContent?.trim()).toBe("jose@portfolio ~ $");
  });

  it("un comando desconocido responde con el aviso", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();

    await run(user, "FooBar");

    expect(logText()).toContain("comando no encontrado: FooBar. Escribe help.");
  });

  it("lo que escribe el usuario se muestra siempre como texto plano", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();

    await user.type(getInput(), "<b>hola</b> <img src=x>{Enter}");

    expect(logText()).toContain("<b>hola</b> <img src=x>");
    expect(getLog().querySelector("b, img")).toBeNull();
  });

  it("clear limpia la zona de resultados", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();
    await run(user, "whoami");

    await run(user, "clear");

    expect(getLog().children).toHaveLength(0);
  });

  it("contacto muestra el email como texto y LinkedIn y GitHub como enlaces a otra pestaña", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();

    await run(user, "contacto");

    expect(logText()).toContain(profile.email);
    expect(within(getLog()).queryByRole("link", { name: profile.email })).toBeNull();
    for (const url of [profile.linkedin, profile.github]) {
      const link = within(getLog()).getByRole("link", { name: url });
      expect(link).toHaveAttribute("href", url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("proyectos lista los proyectos reales de la web con su estado", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();

    await run(user, "proyectos");

    expect(logText()).toContain("portfolio  Portfolio personal  En curso");
    expect(within(getLog()).getByText("En curso")).toHaveClass("text-boot-prompt");
  });

  it("cv abre el CV en otra pestaña y cierra la consola", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();

    await run(user, "cv");

    expect(open).toHaveBeenCalledWith(cvUrl, "_blank", "noopener,noreferrer");
    expect(queryDialog()).toBeNull();
  });

  it("debug activa el modo debug de la web y se refleja en el botón del footer", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();

    await run(user, "debug");

    expect(logText()).toContain("Modo debug activado.");
    expect(document.documentElement.dataset.debug).toBe("true");
    expect(screen.getByRole("button", { name: "Debug", hidden: true })).toHaveAttribute("aria-pressed", "true");

    await run(user, "debug");
    expect(logText()).toContain("Modo debug desactivado.");
    expect(document.documentElement.dataset.debug).toBeUndefined();
  });

  it("404 queda preparado pero la consola avisa de que la página aún no existe", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();

    await run(user, "404");

    expect(logText()).toContain("La página 404 todavía no está disponible.");
    expect(getDialog()).toBeInTheDocument();
  });

  it("run tests muestra las líneas una a una con una pausa y bloquea la entrada mientras tanto", () => {
    vi.useFakeTimers();
    renderApp();
    openWithShortcut();

    fireEvent.change(getInput(), { target: { value: "run tests" } });
    fireEvent.submit(getInput());
    expect(logText()).toContain("Running 5 tests using 1 worker");
    expect(logText()).not.toContain("perfil › es QA Tester en Torcal");
    expect(getInput()).toHaveAttribute("readonly");

    act(() => {
      vi.advanceTimersByTime(140);
    });
    expect(logText()).toContain("perfil › es QA Tester en Torcal");
    expect(logText()).not.toContain("5 passed");

    act(() => {
      vi.advanceTimersByTime(140 * 6);
    });
    expect(logText()).toContain("5 passed (1.9s)");
    expect(getInput()).not.toHaveAttribute("readonly");
  });

  it("sudo contratar responde en verde y otro sudo da la pista", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();

    await run(user, "sudo contratar");
    expect(within(getLog()).getByText(`Permiso concedido. Escríbeme a ${profile.email} 😉`)).toHaveClass("text-boot-ok");

    await run(user, "sudo rm -rf /");
    expect(logText()).toContain("Buen intento. Prueba con sudo contratar");
  });
});

describe("Consola: historial", () => {
  it("las flechas arriba y abajo recorren los comandos anteriores", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();
    await run(user, "whoami");
    await run(user, "skills");
    await user.type(getInput(), "bor");

    await user.keyboard("{ArrowUp}");
    expect(getInput()).toHaveValue("skills");
    await user.keyboard("{ArrowUp}");
    expect(getInput()).toHaveValue("whoami");
    await user.keyboard("{ArrowUp}");
    expect(getInput()).toHaveValue("whoami");

    await user.keyboard("{ArrowDown}");
    expect(getInput()).toHaveValue("skills");
    await user.keyboard("{ArrowDown}");
    expect(getInput()).toHaveValue("bor");
  });

  it("se mantiene aunque se cierre y se vuelva a abrir la consola", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();
    await run(user, "skills");
    openWithShortcut();
    expect(queryDialog()).toBeNull();

    openWithShortcut();
    await user.keyboard("{ArrowUp}");

    expect(getInput()).toHaveValue("skills");
    expect(logText()).toContain("jose@portfolio ~ $ skills");
  });

  it("no guarda líneas vacías ni repite comandos seguidos", async () => {
    const user = userEvent.setup();
    renderApp();
    openWithShortcut();
    await run(user, "whoami");
    await run(user, "whoami");
    await user.type(getInput(), "{Enter}");

    await user.keyboard("{ArrowUp}");
    expect(getInput()).toHaveValue("whoami");
    await user.keyboard("{ArrowUp}");
    expect(getInput()).toHaveValue("whoami");
    await user.keyboard("{ArrowDown}");
    expect(getInput()).toHaveValue("");
  });
});

describe("Consola: accesibilidad e idioma", () => {
  it("es un diálogo con etiqueta, un campo etiquetado y resultados anunciados", () => {
    renderApp();
    openWithShortcut();

    expect(getDialog()).toHaveAccessibleName("Consola");
    expect(getInput()).toHaveAccessibleName("Escribe un comando");
    expect(getLog()).toHaveAttribute("aria-live", "polite");
    expect(getInput()).toHaveAttribute("placeholder", "escribe help");
    expect(screen.getByText("jose@portfolio — zsh")).toBeInTheDocument();
  });

  it("en inglés todo está traducido", () => {
    localStorage.setItem("language", "en");
    renderApp();

    openWithShortcut();

    expect(screen.getByRole("dialog", { name: "Console" })).toBeInTheDocument();
    expect(screen.getByLabelText("Type a command")).toHaveAttribute("placeholder", "type help");
    expect(logText()).toContain("Welcome. Type help to see the commands.");
  });
});
