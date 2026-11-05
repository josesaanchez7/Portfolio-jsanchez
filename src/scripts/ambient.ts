/**
 * Movimiento ambiental de toda la página (ver `.cursor-glow` y `[data-reveal-in]` en global.css):
 *  - el resplandor que sigue al cursor, con inercia, solo con puntero fino y sin «reducir movimiento»;
 *  - la entrada de los elementos `[data-reveal-in]` y `[data-reveal-head]` al verse (una sola vez);
 *  - la inclinación del retrato del hero hacia el cursor, con la tarjeta del test moviéndose a contramano para dar profundidad.
 */

const LERP = 0.12;
const SETTLED_PX = 0.4;

const initCursorGlow = (): void => {
  const glow = document.querySelector<HTMLElement>("[data-cursor-glow]");
  if (!glow) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let frame = 0;

  // Persigue al cursor con inercia y se detiene al alcanzarlo: no hay bucle de animación en reposo.
  const step = () => {
    x += (targetX - x) * LERP;
    y += (targetY - y) * LERP;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    frame = Math.abs(targetX - x) > SETTLED_PX || Math.abs(targetY - y) > SETTLED_PX ? requestAnimationFrame(step) : 0;
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!glow.hasAttribute("data-active")) {
        // La primera vez aparece ya en su sitio, sin cruzar la pantalla desde la esquina.
        x = targetX;
        y = targetY;
        glow.setAttribute("data-active", "");
      }
      if (frame === 0) frame = requestAnimationFrame(step);
    },
    { passive: true },
  );
};

/**
 * Retrato del hero (`[data-tilt]`): se inclina hasta 6° hacia el cursor y la tarjeta del test se desplaza en sentido
 * contrario (--px/--py). Misma inercia que el resplandor y mismo cuidado: solo puntero fino, sin «reducir movimiento»
 * y sin bucle de animación en reposo. Decorativo: no lleva información.
 */
const initTilt = (): void => {
  const stage = document.querySelector<HTMLElement>("[data-tilt]");
  if (!stage) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const area = stage.closest("section") ?? stage;
  const MAX_DEG = 6;
  const REACH_PX = 520;
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let frame = 0;

  const clamp = (value: number) => Math.max(-1, Math.min(1, value));
  const step = () => {
    x += (targetX - x) * 0.1;
    y += (targetY - y) * 0.1;
    stage.style.setProperty("--ry", (x * MAX_DEG).toFixed(2));
    stage.style.setProperty("--rx", (-y * MAX_DEG).toFixed(2));
    stage.style.setProperty("--px", x.toFixed(3));
    stage.style.setProperty("--py", y.toFixed(3));
    frame = Math.abs(targetX - x) > 0.002 || Math.abs(targetY - y) > 0.002 ? requestAnimationFrame(step) : 0;
  };
  const aim = (nx: number, ny: number) => {
    targetX = nx;
    targetY = ny;
    if (frame === 0) frame = requestAnimationFrame(step);
  };

  area.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = stage.getBoundingClientRect();
      aim(
        clamp((event.clientX - (rect.left + rect.width / 2)) / REACH_PX),
        clamp((event.clientY - (rect.top + rect.height / 2)) / REACH_PX),
      );
    },
    { passive: true },
  );
  area.addEventListener("pointerleave", () => aim(0, 0));
};

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
  initCursorGlow();
  initTilt();
  initReveal();
};
