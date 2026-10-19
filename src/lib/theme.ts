export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME: Theme = "dark";

export const parseTheme = (value: unknown): Theme | null =>
  value === "light" || value === "dark" ? value : null;

// index.html aplica el mismo valor antes del primer pintado con un script inline: mantener ambos en sincronía.
export const readStoredTheme = (): Theme => {
  try {
    return parseTheme(localStorage.getItem(THEME_STORAGE_KEY)) ?? DEFAULT_THEME;
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.)
    return DEFAULT_THEME;
  }
};

export const storeTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // El tema sigue funcionando sin persistencia.
  }
};
