import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getInitialLanguage,
  storeLanguage,
  type Language,
  type LocalizedText,
} from "../lib/language";
import { I18nContext } from "./i18n-context";
import { messages } from "./messages";

const setMeta = (selector: string, content: string) =>
  document.querySelector(selector)?.setAttribute("content", content);

/** Sincroniza lang, título y metadatos del documento con el idioma activo. */
const applyDocumentLanguage = (language: Language) => {
  const { meta } = messages[language];
  document.documentElement.lang = language;
  document.title = meta.title;
  setMeta('meta[name="description"]', meta.description);
  setMeta('meta[property="og:title"]', meta.title);
  setMeta('meta[property="og:description"]', meta.ogDescription);
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  // Solo se persiste una elección explícita: mientras el usuario no elige, manda el idioma del navegador.
  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    storeLanguage(next);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: messages[language],
      localize: (text: LocalizedText) => text[language],
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
