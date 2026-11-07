/**
 * Sección que se está leyendo, para la guía lateral (`[data-rail]`, ver SectionRail.astro): los nodos ya recorridos
 * se encienden, el activo se marca y el trazo se rellena hasta él.
 * La detección corre siempre (aunque la guía esté oculta por el ancho de pantalla): es la del cruce de la línea que
 * está un poco por encima del centro del viewport.
 */
export const initRail = (): void => {
  const rail = document.querySelector<HTMLElement>("[data-rail]");
  if (!rail) return;

  const links = [...rail.querySelectorAll<HTMLElement>("[data-rail-link]")];
  const ids = links.map((link) => link.dataset.railLink ?? "");
  const sections = ids.map((id) => document.getElementById(id));
  const last = Math.max(links.length - 1, 1);

  const setActive = (index: number): void => {
    links.forEach((link, position) => {
      link.dataset.state = position < index ? "done" : position === index ? "active" : "todo";
    });
    rail.style.setProperty("--p", String(index / last));
  };

  // Estado inicial: al cargar con un ancla o a mitad de página, el observador lo corrige enseguida.
  setActive(0);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = sections.indexOf(entry.target as HTMLElement);
        if (index >= 0) setActive(index);
      }
    },
    { rootMargin: "-42% 0px -55% 0px" },
  );
  for (const section of sections) if (section) observer.observe(section);
};
