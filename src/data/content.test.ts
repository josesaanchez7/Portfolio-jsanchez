import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { galleryOf } from "../lib/gallery";
import { LANGUAGES, type LocalizedText } from "../lib/language";
import { languages, profile } from "./profile";
import { allEducationStages } from "./education";
import { byMostRecent, education, experience, upcomingCertifications, workExperience } from "./experience";
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

  it("los puestos llevan un ID de ticket único y al menos un logro; solo el último sigue en curso", () => {
    const tickets = workExperience.map((item) => item.ticket);
    expect(tickets.every((ticket) => ticket && /^[A-Z]+-\d+$/.test(ticket))).toBe(true);
    expect(new Set(tickets).size).toBe(tickets.length);
    for (const item of workExperience) expect(item.highlights?.length, item.title.es).toBeGreaterThan(0);
    expect(workExperience.filter((item) => item.end === undefined)).toHaveLength(1);
  });

  it("los puestos son consecutivos: cada uno empieza el mes siguiente a que termine el anterior", () => {
    const chronological = [...workExperience].reverse();
    for (const [i, item] of chronological.entries()) {
      const previous = chronological[i - 1];
      if (!previous?.end) continue;
      const [year, month] = previous.end.split("-").map(Number) as [number, number];
      const next = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
      expect(item.start, item.title.es).toBe(next);
    }
  });

  it("las subtareas caen dentro del periodo de su puesto y su ID cuelga del ticket del puesto", () => {
    const subtasks = workExperience.flatMap((item) => (item.subtasks ?? []).map((subtask) => ({ item, subtask })));
    expect(subtasks.length).toBeGreaterThan(0);
    for (const { item, subtask } of subtasks) {
      expect(subtask.ticket, subtask.title.es).toMatch(new RegExp(`^${item.ticket}-\\d+$`));
      expect(subtask.start >= item.start, `${subtask.title.es}: empieza antes que el puesto`).toBe(true);
      if (item.end !== undefined) {
        expect(subtask.end, `${subtask.title.es}: debe acabar con el puesto`).toBeDefined();
        expect((subtask.end ?? "") <= item.end, `${subtask.title.es}: acaba después que el puesto`).toBe(true);
      }
      if (subtask.end !== undefined) expect(subtask.end >= subtask.start).toBe(true);
    }
  });

  it("solo el puesto más reciente se marca como promoción interna", () => {
    expect(workExperience.filter((item) => item.promotion)).toEqual([workExperience[0]]);
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

  it("«Stack» ya no es una sección: «Sobre mí» pasa a 04 y «Contacto» a 05", () => {
    expect(SECTIONS.map((section) => section.id)).toEqual(["Proyectos", "Experience", "Education", "SobreMi", "Contacto"]);
    expect(getSection("SobreMi").number).toBe("04");
    expect(getSection("Contacto").number).toBe("05");
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
    ...languages.flatMap((entry) => [entry.name, entry.level]),
    ...projects.flatMap((project) => [
      project.title,
      project.description,
    ]),
    ...experience.flatMap((item) => [
      item.title,
      ...(item.organization ? [item.organization] : []),
      ...(item.period ? [item.period] : []),
      ...(item.description ? [item.description] : []),
      ...(item.highlights ?? []),
      ...(item.shortTitle ? [item.shortTitle] : []),
      ...(item.subtasks ?? []).flatMap((subtask) => [subtask.title, subtask.period]),
    ]),
    ...allEducationStages.flatMap((stage) => [
      stage.title,
      stage.period,
      ...(stage.shortTitle ? [stage.shortTitle] : []),
      ...(stage.organization ? [stage.organization] : []),
      ...(stage.description ? [stage.description] : []),
    ]),
    ...upcomingCertifications.flatMap(({ title, status }) => [title, ...(status ? [status] : [])]),
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
