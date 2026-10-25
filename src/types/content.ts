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

export type ProjectStatus = "done" | "in-progress" | "todo";

/** Una captura de un proyecto. */
export interface ProjectImage {
  /** Ruta dentro de public/ (p. ej. "/img/projects/captura.webp"). Proporción recomendada: 16:10. */
  src: string;
  /** Texto alternativo. Si falta, se usa «Captura del proyecto …». */
  alt?: LocalizedText;
}

export interface Project {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  /** Nombres de tecnologías: no se traducen. */
  tags: string[];
  /** Estado del proyecto (se muestra en la consola). */
  status: ProjectStatus;
  /** Capturas del proyecto: con dos o más se ven como un carrusel. Si no hay ninguna, se muestra una vista previa provisional. */
  images?: ProjectImage[];
  /** Una sola captura (equivale a `images` con una imagen). Si hay `images`, se ignora. */
  image?: string;
  /**
   * Vídeo corto de vista previa (mp4 o webm, sin audio): se reproduce al pasar el ratón o enfocar la tarjeta.
   * La primera captura hace de póster. Ruta dentro de public/ (p. ej. "/videos/portfolio.mp4") o URL https.
   */
  video?: string;
  /** Tarjeta destacada del bento (más ancha y en horizontal). Por defecto lo es la primera. */
  featured?: boolean;
  /** Repositorio. Si falta, el botón no se muestra. */
  code?: HttpsUrl;
  /** Demo. Si falta, el botón no se muestra. */
  demo?: HttpsUrl;
}

export type ExperienceKind = "work" | "education" | "certification";

/** Credencial verificable (como en LinkedIn): ID y enlace a la página de verificación. */
export interface Credential {
  id?: string;
  /** Enlace de verificación de la entidad emisora. Si falta, no se muestra el botón. */
  url?: HttpsUrl;
}

/** Fecha para ordenar: "AAAA-MM", o solo "AAAA" cuando no se conoce el mes. */
export type SortableDate = string;

export interface ExperienceItem {
  kind: ExperienceKind;
  /**
   * Inicio del periodo. Con `end` fija el orden de la línea de tiempo (más reciente primero); el texto
   * que se muestra es `period`. En una certificación, la fecha en que se obtuvo.
   */
  start: SortableDate;
  /** Fin del periodo. Si falta, sigue en curso y la entrada va la primera. */
  end?: SortableDate;
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

/** Cifra destacada de «Sobre mí»: se muestra con un contador animado. */
export interface Metric {
  value: number;
  /** Delante del número (p. ej. "+"). */
  prefix?: string;
  /** Detrás del número (p. ej. "%"). */
  suffix?: string;
  label: LocalizedText;
}
