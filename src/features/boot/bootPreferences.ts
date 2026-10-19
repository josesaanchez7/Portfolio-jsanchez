const SEEN_STORAGE_KEY = "boot-seen";

export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasSeenBoot = (): boolean => {
  try {
    return sessionStorage.getItem(SEEN_STORAGE_KEY) === "1";
  } catch {
    // sessionStorage puede no estar disponible (modo privado, etc.)
    return false;
  }
};

export const markBootSeen = (): void => {
  try {
    sessionStorage.setItem(SEEN_STORAGE_KEY, "1");
  } catch {
    // Sin persistencia, la pantalla simplemente se repetirá al recargar.
  }
};

export const shouldShowBoot = (oncePerSession: boolean): boolean =>
  !prefersReducedMotion() && !(oncePerSession && hasSeenBoot());
