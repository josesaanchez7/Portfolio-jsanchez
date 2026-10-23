import { within } from "@testing-library/dom";
import type { SSRManifest } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { JSDOM } from "jsdom";
import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from "../lib/language";
import { pathForLanguage } from "../lib/seo";

type ContainerComponent = Parameters<AstroContainer["renderToString"]>[0];
/** Cualquier componente .astro: las páginas sin props se tipan como `(props: never) => any`. */
type Component = ContainerComponent | ((props: never) => unknown);

interface RenderOptions {
  props?: Record<string, unknown>;
  /** Contenido del slot por defecto. */
  slot?: string;
  /** Idioma de la página que se simula ("/" o "/en/"). Por defecto, español. */
  language?: Language;
}

/**
 * Renderiza un componente .astro con la Container API y devuelve su HTML ya parseado con jsdom,
 * junto a las consultas de Testing Library (getByRole…) acotadas a él. Es HTML estático: los
 * <script> de los componentes no se ejecutan.
 *
 * Los archivos que lo usan deben empezar por `// @vitest-environment node`: Astro compila los
 * componentes para el servidor, y el entorno jsdom de Vitest los trataría como código de navegador.
 */
export const renderComponent = async (
  component: Component,
  { props, slot, language = DEFAULT_LANGUAGE }: RenderOptions = {},
) => {
  // La Container API toma `i18n` del manifest (no de astroConfig): es lo que fija Astro.currentLocale.
  // Solo se indica lo necesario; el contenedor rellena el resto del manifest con valores por defecto.
  const manifest: Partial<SSRManifest> = {
    trailingSlash: "always",
    i18n: {
      strategy: "pathname-prefix-other-locales",
      locales: [...LANGUAGES],
      defaultLocale: DEFAULT_LANGUAGE,
      fallback: undefined,
      fallbackType: "redirect",
      domainLookupTable: {},
      domains: undefined,
    },
  };
  const container = await AstroContainer.create({ manifest: manifest as SSRManifest });
  const html = await container.renderToString(component as ContainerComponent, {
    ...(props && { props }),
    ...(slot !== undefined && { slots: { default: slot } }),
    request: new Request(`http://localhost${pathForLanguage(language)}`),
  });

  const { document } = new JSDOM(html).window;
  return { html, document, ...within(document.body) };
};
