/**
 * Efecto «spotlight» de una tarjeta: al pasar el ratón, el borde (y un brillo suave del fondo) se ilumina donde está
 * el puntero. Se añade a la tarjeta junto con el atributo `data-spotlight`; src/scripts/spotlight.ts pone --mx y --my.
 * Hay dos capas: `before:` (brillo del fondo, detrás del contenido) y `after:` (anillo de 1px, recortado con una máscara
 * de dos capas: la del borde menos la del contenido). La máscara se escribe con sus propiedades por separado:
 * con el atajo `mask:` el orden del CSS generado puede reiniciar `mask-composite`.
 */
export const SPOTLIGHT = [
  "relative isolate",
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300 before:content-[''] before:bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),var(--accent-soft),transparent_70%)] hover:before:opacity-100",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:opacity-0 after:transition-opacity after:duration-300 after:content-[''] after:bg-[radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,50%),var(--accent),transparent_70%)] after:[mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)] after:[mask-clip:content-box,border-box] after:[mask-composite:exclude] hover:after:opacity-100",
].join(" ");
