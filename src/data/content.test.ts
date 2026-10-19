import { describe, expect, it } from "vitest";
import { LANGUAGES, type LocalizedText } from "../lib/language";
import { aboutFacts, profile } from "./profile";
import { experience } from "./experience";
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
      expect(category.items.length).toBeGreaterThan(0);
      expect(new Set(category.items).size).toBe(category.items.length);
    }
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
      item.organization,
      ...(item.period ? [item.period] : []),
      ...(item.description ? [item.description] : []),
    ]),
    ...SECTIONS.flatMap((section) => [section.navLabel, section.title]),
    ...stack.map((category) => category.label),
  ];

  it("ningún texto está vacío en ningún idioma", () => {
    for (const text of localizedTexts) {
      for (const language of LANGUAGES) {
        expect(text[language].trim(), JSON.stringify(text)).not.toBe("");
      }
    }
  });
});
