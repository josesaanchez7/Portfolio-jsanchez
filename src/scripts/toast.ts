const VISIBLE_MS = 2500;

let timer: number | undefined;

/**
 * Muestra un aviso breve abajo en el centro (el elemento `[data-toast]` de components/ui/Toast.astro).
 * Es una región `role="status"`: los lectores de pantalla anuncian el texto. Un aviso nuevo sustituye al anterior.
 */
export const showToast = (message: string, tone: "ok" | "error" = "ok"): void => {
  const box = document.querySelector<HTMLElement>("[data-toast]");
  const text = box?.querySelector<HTMLElement>("[data-toast-text]");
  if (!box || !text) return;

  box.dataset.tone = tone;
  text.textContent = message;
  box.toggleAttribute("data-visible", true);

  window.clearTimeout(timer);
  timer = window.setTimeout(() => box.removeAttribute("data-visible"), VISIBLE_MS);
};
