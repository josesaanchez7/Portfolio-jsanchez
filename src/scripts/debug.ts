/**
 * Modo debug compartido (botón «Debug» del footer y comando `debug` de la consola).
 * Mientras está activo, <html> lleva data-debug="true" y las variantes `in-data-[debug=true]:`
 * de src/lib/debugSection.ts marcan cada sección. La fuente de verdad es ese atributo.
 */
const DEBUG_EVENT = "portfolio:debug-change";

export const isDebugEnabled = (): boolean => document.documentElement.dataset.debug === "true";

export const toggleDebug = (): void => {
  if (isDebugEnabled()) delete document.documentElement.dataset.debug;
  else document.documentElement.dataset.debug = "true";
  document.dispatchEvent(new CustomEvent(DEBUG_EVENT));
};

/** Avisa cuando el modo debug cambia (lo active el botón o la consola). */
export const onDebugChange = (listener: (enabled: boolean) => void): void => {
  document.addEventListener(DEBUG_EVENT, () => listener(isDebugEnabled()));
};
