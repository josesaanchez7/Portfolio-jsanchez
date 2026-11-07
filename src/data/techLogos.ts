import { techLogoShapes, type TechLogoShape } from "./techLogos.generated";

/** Color con el que se pinta el logo al pasar el ratón: el acento del sitio o un hexadecimal. */
export type HoverColor = "accent" | `#${string}`;

/**
 * Logo oficial de una tecnología. `brandColor` es el color oficial (el hex de simple-icons o, para Playwright y Java, el
 * de devicon) y `source` anota de qué librería y archivo sale cada logo (ver `techLogos.generated.ts`).
 */
export interface TechLogo extends TechLogoShape {
  brandColor: string;
  /**
   * Color de hover, solo donde el de marca no contrasta (< 3:1, WCAG 1.4.11) con la baldosa oscura. Donde no se indica,
   * se usa `brandColor`. Lo comprueba `techLogos.test.ts`, así que si cambia un color o la baldosa, el test avisa.
   */
  hoverColor?: HoverColor;
}

export type TechName = keyof typeof techLogoShapes;

// Sobre la baldosa oscura (#111111) no se ven: CSS, Jira, GitHub y ESLint. En esos casos el logo se enciende con el acento del sitio.
const hoverOverrides: Partial<Record<TechName, HoverColor>> = {
  CSS: "accent",
  Jira: "accent",
  GitHub: "accent",
  ESLint: "accent",
};

const build = (name: TechName): TechLogo => {
  const hoverColor = hoverOverrides[name];
  return { ...techLogoShapes[name], ...(hoverColor && { hoverColor }) };
};

export const techLogos = Object.fromEntries(
  (Object.keys(techLogoShapes) as TechName[]).map((name) => [name, build(name)]),
) as Record<TechName, TechLogo>;

/** Logo de una tecnología por su nombre (el de `stack.ts`), o `undefined` si no hay. */
export const getTechLogo = (name: string): TechLogo | undefined => (techLogos as Record<string, TechLogo>)[name];

/** Valor CSS del color de hover de un logo. */
export const hoverCss = (logo: TechLogo): string => {
  const color = logo.hoverColor ?? logo.brandColor;
  return color === "accent" ? "var(--accent)" : color;
};
