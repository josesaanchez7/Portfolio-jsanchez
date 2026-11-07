/**
 * Copia un texto al portapapeles y dice si lo consiguió. Primero lo intenta con la Clipboard API; si no existe o el
 * navegador la rechaza (http sin TLS, ventana sin foco…), recurre a seleccionar un <textarea> oculto y `execCommand`.
 * `container` es donde se inserta ese <textarea>: dentro de un <dialog> modal tiene que ir en el propio diálogo, porque
 * el resto de la página está inerte y no se puede seleccionar.
 */
export const copyText = async (text: string, container: HTMLElement = document.body): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Seguimos con el método antiguo.
  }

  const previousFocus = document.activeElement;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  container.append(area);
  area.select();

  const copied = (() => {
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    }
  })();

  area.remove();
  if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  return copied;
};
