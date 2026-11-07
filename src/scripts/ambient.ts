/**
 * Entrada de los elementos `[data-reveal-in]` y `[data-reveal-head]` al verse, una sola vez (ver global.css).
 * Es el único movimiento «de ambiente» de la página: sin resplandor que siga al cursor ni inclinaciones.
 */

const initReveal = (): void => {
  const root = document.documentElement;
  const items = [...document.querySelectorAll<HTMLElement>("[data-reveal-in], [data-reveal-head]")];
  (window as Window & { __revealReady?: boolean }).__revealReady = true;
  // Sin la marca del <head> (reducir movimiento) no hay nada oculto que revelar.
  if (!root.hasAttribute("data-reveal") || items.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // También se marca lo que ya quedó por encima del viewport (p. ej. al llegar por un ancla).
        if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) continue;
        entry.target.setAttribute("data-seen", "");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  for (const item of items) observer.observe(item);
};

export const initAmbient = (): void => {
  initReveal();
};
