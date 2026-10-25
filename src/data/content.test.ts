import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { galleryOf } from "../lib/gallery";
import { LANGUAGES, type LocalizedText } from "../lib/language";
import { aboutFacts, profile } from "./profile";
import { byMostRecent, education, experience, workExperience } from "./experience";
import type { ExperienceItem } from "../types/content";
import { projects } from "./projects";
import { getSection, SECTIONS } from "./sections";
import { stack } from "./stack";

describe("contenido estático", () => {
  it("los proyectos tienen ids únicos", () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("los enlaces externos son https", () => {
    const links = [
      profile.github,
      profile.linkedin,
      ...projects.flatMap((project) => [project.code, project.demo]),
      ...experience.map((item) => item.credential?.url),
    ].filter((link): link is NonNullable<typeof link> => link !== undefined);

    for (const link of links) {
      expect(link).toMatch(/^https:\/\//);
    }
  });

  it("el correo tiene formato válido", () => {
    expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("el stack no contiene categorías vacías ni tecnologías repetidas", () => {
    for (const category of stack) {
      const names = category.items.map((item) => item.es);
      expect(names.length).toBeGreaterThan(0);
      expect(new Set(names).size).toBe(names.length);
    }
  });
});

describe("proyectos", () => {
  const images = projects.flatMap((project) => galleryOf(project).map((image) => ({ project, image })));

  it("cada imagen existe en public/ y es un webp", () => {
    expect(images.length).toBeGreaterThan(0);
    for (const { project, image } of images) {
      expect(image.src, project.id).toMatch(/^\/img\/projects\/.+\.webp$/);
      expect(existsSync(join(process.cwd(), "public", image.src)), `${project.id}: falta ${image.src}`).toBe(true);
    }
  });

  it("los proyectos con varias imágenes las describen todas, en los dos idiomas", () => {
    for (const project of projects) {
      const gallery = galleryOf(project);
      if (gallery.length < 2) continue;
      for (const image of gallery) {
        for (const language of LANGUAGES) {
          expect(image.alt?.[language]?.trim().length ?? 0, `${project.id} ${image.src} (${language})`).toBeGreaterThan(10);
        }
      }
    }
  });

  it("no se repite ninguna imagen dentro de un mismo proyecto", () => {
    for (const project of projects) {
      const sources = galleryOf(project).map((image) => image.src);
      expect(new Set(sources).size, project.id).toBe(sources.length);
    }
  });

  it("los estados son válidos y el primer proyecto es el destacado", () => {
    for (const project of projects) expect(["done", "in-progress", "todo"]).toContain(project.status);
    expect(projects[0]?.featured ?? true).toBe(true);
  });
});

describe("experiencia y educación", () => {
  it("cada entrada va en una sola sección: trabajo en Experiencia; estudios y certificaciones en Educación", () => {
    expect(workExperience.every((item) => item.kind === "work")).toBe(true);
    expect(education.every((item) => item.kind === "education" || item.kind === "certification")).toBe(true);
    expect(workExperience.length + education.length).toBe(experience.length);
  });

  it("las fechas de orden tienen formato AAAA-MM (o AAAA) y el fin no es anterior al inicio", () => {
    for (const { start, end, title } of experience) {
      expect(start, title.es).toMatch(/^\d{4}(-(0[1-9]|1[0-2]))?$/);
      if (end !== undefined) {
        expect(end, title.es).toMatch(/^\d{4}(-(0[1-9]|1[0-2]))?$/);
        expect(end >= start, `${title.es}: el fin es anterior al inicio`).toBe(true);
      }
    }
  });

  it("cada lista va de la entrada más reciente a la más antigua", () => {
    for (const list of [experience, workExperience, education]) {
      expect([...list].sort(byMostRecent)).toEqual(list);
    }
  });

  it("lo que sigue en curso va el primero y la certificación más nueva encabeza Educación", () => {
    expect(workExperience[0]?.end).toBeUndefined();
    expect(education[0]?.kind).toBe("certification");
  });

  it("ninguna de las dos secciones queda vacía", () => {
    expect(workExperience.length).toBeGreaterThan(0);
    expect(education.length).toBeGreaterThan(0);
  });
});

describe("secciones", () => {
  it("los ids son únicos", () => {
    const ids = SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("numera las secciones según su orden", () => {
    expect(getSection("Proyectos").number).toBe("01");
    expect(getSection("Contacto").number).toBe(String(SECTIONS.length).padStart(2, "0"));
  });
});

describe("traducciones del contenido", () => {
  const localizedTexts: LocalizedText[] = [
    profile.role,
    profile.currentJob,
    ...aboutFacts.flatMap((fact) => [fact.label, fact.value]),
    ...projects.flatMap((project) => [
      project.title,
      project.description,
      ...(project.caseStudy
        ? [
            project.caseStudy.problem,
            project.caseStudy.solution,
            ...project.caseStudy.decisions,
            ...project.caseStudy.results,
          ]
        : []),
    ]),
    ...experience.flatMap((item) => [
      item.title,
      ...(item.organization ? [item.organization] : []),
      ...(item.period ? [item.period] : []),
      ...(item.description ? [item.description] : []),
    ]),
    ...SECTIONS.flatMap((section) => [section.navLabel, section.title]),
    ...stack.flatMap((category) => [category.label, ...category.items]),
  ];

  it("ningún texto está vacío en ningún idioma", () => {
    for (const text of localizedTexts) {
      for (const language of LANGUAGES) {
        expect(text[language].trim(), JSON.stringify(text)).not.toBe("");
      }
    }
  });
});

describe("byMostRecent", () => {
  const item = (start: string, end?: string): ExperienceItem => ({
    kind: "work",
    start,
    ...(end && { end }),
    title: { es: `${start}–${end ?? "hoy"}`, en: `${start}–${end ?? "now"}` },
  });
  const titles = (list: ExperienceItem[]) => [...list].sort(byMostRecent).map((entry) => entry.title.es);

  it("ordena por fin del periodo, de más reciente a más antiguo", () => {
    expect(titles([item("2018", "2020"), item("2021", "2024"), item("2023-05", "2025-09")])).toEqual([
      "2023-05–2025-09",
      "2021–2024",
      "2018–2020",
    ]);
  });

  it("lo que sigue en curso va antes que lo terminado, aunque empezara antes", () => {
    expect(titles([item("2024-01", "2025-12"), item("2020-01")])).toEqual(["2020-01–hoy", "2024-01–2025-12"]);
  });

  it("a igual fin, va primero lo que empezó más tarde", () => {
    expect(titles([item("2019", "2024"), item("2022", "2024")])).toEqual(["2022–2024", "2019–2024"]);
    expect(titles([item("2019-03"), item("2022-06")])).toEqual(["2022-06–hoy", "2019-03–hoy"]);
  });

  it("un año sin mes cuenta como diciembre al terminar y enero al empezar", () => {
    expect(titles([item("2020-01", "2024-06"), item("2021", "2024")])).toEqual(["2021–2024", "2020-01–2024-06"]);
  });

  it("no cambia el orden de entradas idénticas", () => {
    expect(byMostRecent(item("2020", "2021"), item("2020", "2021"))).toBe(0);
  });
});
