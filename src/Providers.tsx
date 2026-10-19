import type { ReactNode } from "react";
import { I18nProvider } from "./i18n/I18nProvider";
import { ThemeProvider } from "./theme/ThemeProvider";

/** Proveedores globales de la aplicación. También los usan los tests. */
const Providers = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <I18nProvider>{children}</I18nProvider>
  </ThemeProvider>
);

export default Providers;
