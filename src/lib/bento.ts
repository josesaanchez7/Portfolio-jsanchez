/** Columnas de la cuadrícula de proyectos (en pantallas anchas). */
export const BENTO_COLUMNS = 6;
export const FEATURED_SPAN = 4;
export const REGULAR_SPAN = 2;

/** Columnas que ocupa una tarjeta de proyecto: la destacada 4 y las demás 2. */
export const projectSpan = (featured: boolean): number => (featured ? FEATURED_SPAN : REGULAR_SPAN);

/**
 * Columnas de la tarjeta «más proyectos»: rellena el hueco que queda en la última fila (2 o 4 columnas) o, si esa
 * fila está completa, ocupa una fila entera. `featured` indica, por proyecto y en orden, si es destacado.
 */
export const moreTileSpan = (featured: readonly boolean[]): number => {
  const used = featured.reduce((total, isFeatured) => total + projectSpan(isFeatured), 0);
  const free = (BENTO_COLUMNS - (used % BENTO_COLUMNS)) % BENTO_COLUMNS;
  return free === 0 ? BENTO_COLUMNS : free;
};
