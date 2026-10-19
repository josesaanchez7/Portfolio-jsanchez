export interface TextPart {
  text: string;
  /** Nombre de la etiqueta que envolvía el texto (<ok>…</ok> → "ok"). Sin etiqueta, texto normal. */
  tag?: string;
}

const TAG_PATTERN = /<(\w+)>(.*?)<\/\1>/g;

/**
 * Divide un texto con marcas simples (<b>…</b>) en partes. Función pura: no interpreta HTML.
 * Las etiquetas que no están en `knownTags` se dejan como texto literal.
 */
export const parseTags = (text: string, knownTags: readonly string[]): TextPart[] => {
  const parts: TextPart[] = [];
  let cursor = 0;

  for (const match of text.matchAll(TAG_PATTERN)) {
    const [raw, tag, content] = match;
    if (raw === undefined || tag === undefined || content === undefined || !knownTags.includes(tag)) {
      continue;
    }
    if (match.index > cursor) parts.push({ text: text.slice(cursor, match.index) });
    parts.push({ text: content, tag });
    cursor = match.index + raw.length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });

  return parts;
};
