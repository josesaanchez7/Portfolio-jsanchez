import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { DebugModeContext } from "./debug-context";

/**
 * Modo debug compartido (botón «Debug» del footer y comando `debug` de la consola).
 * Mientras está activo, <html> lleva data-debug="true" y las variantes `in-data-[debug=true]:`
 * de src/lib/debugSection.ts marcan cada sección. Se limpia solo al desactivarlo o desmontar.
 */
export const DebugModeProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.dataset.debug = "true";
    return () => {
      delete document.documentElement.dataset.debug;
    };
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((current) => !current), []);
  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle]);

  return <DebugModeContext.Provider value={value}>{children}</DebugModeContext.Provider>;
};
