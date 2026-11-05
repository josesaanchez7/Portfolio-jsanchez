/**
 * Efecto «spotlight» de una tarjeta: al pasar el ratón, el borde se ilumina donde está
 * el puntero. Se añade a la tarjeta junto con el atributo `data-spotlight`; src/scripts/spotlight.ts pone --mx y --my.
 * Solo hay un anillo de 1 px (`after:`), recortado con una máscara de dos capas: la del borde menos la del contenido.
 * No hay brillo de fondo: ese halo difuminado daba un aire «vidrioso» demasiado visto. La máscara se escribe con sus propiedades por separado:
 * con el atajo `mask:` el orden del CSS generado puede reiniciar `mask-composite`.
 */
export const SPOTLIGHT = [
  "relative isolate",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:opacity-0 after:transition-opacity after:duration-300 after:content-[''] after:bg-[radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,50%),var(--accent),transparent_70%)] after:[mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)] after:[mask-clip:content-box,border-box] after:[mask-composite:exclude] hover:after:opacity-100",
].join(" ");
