/**
 * Sigue al ratón sobre las tarjetas `[data-spotlight]` (ver src/lib/spotlight.ts). Se puede llamar varias veces:
 * cada tarjeta se enlaza una sola vez.
 */
export const initSpotlight = (): void => {
  for (const card of document.querySelectorAll<HTMLElement>("[data-spotlight]")) {
    if (card.dataset.spotlightBound !== undefined) continue;
    card.dataset.spotlightBound = "";

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  }
};
