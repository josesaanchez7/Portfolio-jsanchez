export const LANGUAGES = ["es", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Texto con una versión por idioma: el compilador exige rellenar todas. */
export type LocalizedText = Record<Language, string>;

export const DEFAULT_LANGUAGE: Language = "es";
export const LANGUAGE_STORAGE_KEY = "language";

/** Código mostrado en el selector de idioma. */
export const LANGUAGE_CODE: Record<Language, string> = { es: "ES", en: "EN" };

export const parseLanguage = (value: unknown): Language | null =>
  LANGUAGES.find((language) => language === value) ?? null;

/** Elige el primer idioma soportado entre las preferencias del navegador (p. ej. "en-US" → "en"). */
export const detectLanguage = (preferred: readonly string[]): Language => {
  for (const tag of preferred) {
    const match = parseLanguage(tag.toLowerCase().split("-")[0]);
    if (match) return match;
  }
  return DEFAULT_LANGUAGE;
};

export const readStoredLanguage = (): Language | null => {
  try {
    return parseLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.)
    return null;
  }
};

export const storeLanguage = (language: Language): void => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // El idioma sigue funcionando sin persistencia.
  }
};

/** Idioma guardado por el usuario o, si nunca eligió, el del navegador. */
export const getInitialLanguage = (): Language =>
  readStoredLanguage() ?? detectLanguage(navigator.languages);
