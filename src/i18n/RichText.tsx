import { Fragment, type ReactNode } from "react";

type TagRenderers = Record<string, (content: string) => ReactNode>;

const DEFAULT_TAGS: TagRenderers = {
  b: (content) => <strong>{content}</strong>,
};

const TAG_PATTERN = /<(\w+)>(.*?)<\/\1>/g;

interface RichTextProps {
  text: string;
  /** Renderizadores por etiqueta. Las etiquetas sin renderizador se muestran como texto literal. */
  tags?: TagRenderers;
}

/**
 * Convierte marcas simples (<b>…</b>) de los textos traducidos en elementos React.
 * No interpreta HTML: es seguro aunque el texto contenga caracteres especiales.
 */
const RichText = ({ text, tags = DEFAULT_TAGS }: RichTextProps) => {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(TAG_PATTERN)) {
    const [raw, tagName, content] = match;
    const render = tagName === undefined ? undefined : tags[tagName];
    if (raw === undefined || content === undefined || !render) continue;

    nodes.push(text.slice(cursor, match.index), <Fragment key={match.index}>{render(content)}</Fragment>);
    cursor = match.index + raw.length;
  }
  nodes.push(text.slice(cursor));

  return <>{nodes}</>;
};

export default RichText;
