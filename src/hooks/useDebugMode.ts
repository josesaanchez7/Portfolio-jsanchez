import { useCallback, useEffect, useState } from "react";

/**
 * Modo debug: mientras está activo, <html> lleva data-debug="true" y los estilos de
 * las variantes `in-data-[debug=true]:` de src/lib/debugSection.ts marcan cada sección.
 * Se limpia solo al desactivarlo o desmontar.
 */
export const useDebugMode = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.dataset.debug = "true";
    return () => {
      delete document.documentElement.dataset.debug;
    };
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((current) => !current), []);

  return { enabled, toggle };
};
