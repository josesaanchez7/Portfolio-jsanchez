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

export type ProjectStatus = "done" | "in-progress" | "todo";

export interface Project {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  /** Nombres de tecnologías: no se traducen. */
  tags: string[];
  /** Estado del proyecto (se muestra en la consola). */
  status: ProjectStatus;
  /** Captura del proyecto. Si falta, se muestra una vista previa provisional. */
  image?: string;
  /** Repositorio. Si falta, el botón no se muestra. */
  code?: HttpsUrl;
  /** Demo. Si falta, el botón no se muestra. */
  demo?: HttpsUrl;
  /** Si existe, la tarjeta muestra "Ver detalle" con el caso de estudio. */
  caseStudy?: CaseStudy;
}

export type ExperienceKind = "work" | "education" | "certification";

/** Credencial verificable (como en LinkedIn): ID y enlace a la página de verificación. */
export interface Credential {
  id?: string;
  /** Enlace de verificación de la entidad emisora. Si falta, no se muestra el botón. */
  url?: HttpsUrl;
}

export interface ExperienceItem {
  kind: ExperienceKind;
  title: LocalizedText;
  /** Opcional: una certificación puede no indicar la entidad. */
  organization?: LocalizedText;
  /** Opcional (p. ej. "2024 – Actualidad"). */
  period?: LocalizedText;
  description?: LocalizedText;
  /** Solo para certificaciones. */
  credential?: Credential;
}

/** Tecnologías y aptitudes. Los nombres propios llevan el mismo texto en ambos idiomas. */
export interface StackCategory {
  label: LocalizedText;
  items: LocalizedText[];
}

export interface AboutFact {
  label: LocalizedText;
  value: LocalizedText;
}
