import { Fragment, type ReactNode } from "react";
import { parseTags } from "./parseTags";

type TagRenderers = Record<string, (content: string) => ReactNode>;

const DEFAULT_TAGS: TagRenderers = {
  b: (content) => <strong>{content}</strong>,
};

interface RichTextProps {
  text: string;
  /** Renderizadores por etiqueta. Las etiquetas sin renderizador se muestran como texto literal. */
  tags?: TagRenderers;
}

/**
 * Convierte marcas simples (<b>…</b>) de los textos traducidos en elementos React.
 * No interpreta HTML: es seguro aunque el texto contenga caracteres especiales.
 */
const RichText = ({ text, tags = DEFAULT_TAGS }: RichTextProps) => (
  <>
    {parseTags(text, Object.keys(tags)).map((part, index) => (
      <Fragment key={index}>{part.tag ? tags[part.tag]?.(part.text) : part.text}</Fragment>
    ))}
  </>
);

export default RichText;
