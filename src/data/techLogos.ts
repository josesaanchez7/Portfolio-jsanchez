import { techLogoShapes, type TechLogoShape } from "./techLogos.generated";

/** Color con el que se pinta el logo al pasar el ratón: el acento del sitio o un hexadecimal. */
export type HoverColor = "accent" | `#${string}`;
export type ThemeName = "dark" | "light";

/**
 * Logo oficial de una tecnología. `brandColor` es el color oficial (el hex de simple-icons o, para Playwright y Java, el
 * de devicon) y `source` anota de qué librería y archivo sale cada logo (ver `techLogos.generated.ts`).
 */
export interface TechLogo extends TechLogoShape {
  brandColor: string;
  /**
   * Color de hover por tema, solo donde el de marca no contrasta (< 3:1, WCAG 1.4.11) con la baldosa de ese tema. Donde no se
   * indica, se usa `brandColor`. Lo comprueba `techLogos.test.ts`, así que si cambia un color o el tema, el test avisa.
   */
  hoverColor?: Partial<Record<ThemeName, HoverColor>>;
}

export type TechName = keyof typeof techLogoShapes;

// Sobre la baldosa oscura (#202635) no se ven: CSS, Jira, GitHub, Vite y ESLint. Sobre la clara (#fff): JavaScript, Tailwind CSS,
// Playwright y Postman. En esos casos, en ese tema, el logo se enciende con el acento del sitio.
const hoverOverrides: Partial<Record<TechName, NonNullable<TechLogo["hoverColor"]>>> = {
  JavaScript: { light: "accent" },
  CSS: { dark: "accent" },
  "Tailwind CSS": { light: "accent" },
  Playwright: { light: "accent" },
  Postman: { light: "accent" },
  Jira: { dark: "accent" },
  GitHub: { dark: "accent" },
  Vite: { dark: "accent" },
  ESLint: { dark: "accent" },
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

/** Valor CSS del color de hover de un logo en un tema. */
export const hoverCss = (logo: TechLogo, theme: ThemeName): string => {
  const color = logo.hoverColor?.[theme] ?? logo.brandColor;
  return color === "accent" ? "var(--accent)" : color;
};
