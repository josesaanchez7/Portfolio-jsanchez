import { useEffect, useState } from "react";

/**
 * Devuelve el id de la sección que cruza la franja central del viewport.
 * `ids` debe ser una referencia estable (constante de módulo): al cambiar se recrea el observer.
 */
export const useActiveSection = (ids: readonly string[]): string | null => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
};
