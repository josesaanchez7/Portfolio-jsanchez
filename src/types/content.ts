import type { LocalizedText } from "../lib/language";

/** URL absoluta https: impide en tiempo de compilación valores como "#" o "javascript:...". */
export type HttpsUrl = `https://${string}`;

export interface Profile {
  name: string;
  fullName: string;
  nickname: string;
  role: LocalizedText;
  currentJob: LocalizedText;
  employer: string;
  email: string;
  github: HttpsUrl;
  linkedin: HttpsUrl;
}

export interface CaseStudy {
  problem: LocalizedText;
  solution: LocalizedText;
  decisions: LocalizedText[];
  results: LocalizedText[];
}

export interface Project {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  /** Nombres de tecnologías: no se traducen. */
  tags: string[];
  /** Captura del proyecto. Si falta, se muestra una vista previa provisional. */
  image?: string;
  /** Repositorio. Si falta, el botón no se muestra. */
  code?: HttpsUrl;
  /** Demo. Si falta, el botón no se muestra. */
  demo?: HttpsUrl;
  /** Si existe, la tarjeta muestra "Ver detalle" con el caso de estudio. */
  caseStudy?: CaseStudy;
}

export type ExperienceKind = "work" | "education";

export interface ExperienceItem {
  kind: ExperienceKind;
  title: LocalizedText;
  organization: LocalizedText;
  /** Opcional (p. ej. "2024 – Actualidad"). */
  period?: LocalizedText;
  description?: LocalizedText;
}

export interface StackCategory {
  label: LocalizedText;
  /** Nombres de tecnologías: no se traducen. */
  items: string[];
}

export interface AboutFact {
  label: LocalizedText;
  value: LocalizedText;
}
