/** Texto comparable: sin tildes, en minúsculas y sin espacios en los extremos («Educación» → «educacion»). */
export const normalizeSearch = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * ¿Encaja la búsqueda con un comando? Cada palabra escrita debe aparecer en el texto del comando,
 * en cualquier orden y sin importar tildes ni mayúsculas. `haystack` ya viene normalizado
 * (con `normalizeSearch`). Una búsqueda vacía encaja con todo.
 */
export const matchesQuery = (haystack: string, query: string): boolean =>
  normalizeSearch(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));

/** Índice al mover la selección `delta` posiciones dentro de una lista circular de `count` elementos. */
export const wrapIndex = (current: number, delta: number, count: number): number => {
  if (count <= 0) return -1;
  // Sin selección previa, bajar entra por el primero y subir por el último.
  if (current < 0) return delta >= 0 ? 0 : count - 1;
  return (((current + delta) % count) + count) % count;
};
