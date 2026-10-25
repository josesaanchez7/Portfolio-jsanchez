// @vitest-environment node
import { describe, expect, it } from "vitest";
import { projects } from "../../data/projects";
import { moreTileSpan } from "../../lib/bento";
import { galleryOf } from "../../lib/gallery";
import { renderComponent } from "../../test/render";
import type { Project } from "../../types/content";
import ProjectCard from "./ProjectCard.astro";
import ProjectsSection from "./ProjectsSection.astro";

const base: Project = {
  id: "demo",
  title: { es: "Proyecto de prueba", en: "Test project" },
  description: { es: "Descripción", en: "Description" },
  tags: ["Playwright"],
  status: "done",
};

const renderCard = (project: Project, featured = false) =>
  renderComponent(ProjectCard, { props: { project, featured } });

describe("ProjectsSection (bento)", () => {
  it("el proyecto destacado ocupa 4 columnas, los demás 2, y «más proyectos» rellena el hueco", async () => {
    const { document } = await renderComponent(ProjectsSection);

    const cells = [...document.querySelectorAll("[data-project-card]")].map((card) => card.parentElement?.className);
    expect(cells).toHaveLength(projects.length);
    expect(cells[0]).toContain("lg:col-span-4");
    for (const cell of cells.slice(1)) expect(cell).toContain("lg:col-span-2");
    const span = moreTileSpan(projects.map((project, index) => project.featured ?? index === 0));
    expect(document.querySelector("aside")?.className).toContain(`lg:col-span-${span}`);
  });

  it("el primer proyecto es el destacado: título grande y su captura entera arriba", async () => {
    const { document } = await renderComponent(ProjectsSection);

    const titles = [...document.querySelectorAll("[data-project-card] h3")];
    expect(titles[0]?.className).toContain("lg:text-[1.7rem]");
    for (const title of titles.slice(1)) expect(title.className).not.toContain("lg:text-[1.7rem]");
    const image = document.querySelector("[data-project-card] img");
    expect(image).toHaveAttribute("src", galleryOf(projects[0] as Project)[0]?.src);
    expect(image).toHaveAttribute("alt", expect.stringContaining("IPTVFlix"));
  });

  it("todas las tarjetas tienen el efecto spotlight", async () => {
    const { document } = await renderComponent(ProjectsSection);

    expect(document.querySelectorAll("[data-spotlight]")).toHaveLength(projects.length + 1);
  });
});

describe("ProjectCard", () => {
  it("la tarjeta destacada lleva el título más grande y la normal no", async () => {
    const featured = await renderCard(base, true);
    const normal = await renderCard(base, false);

    expect(featured.document.querySelector("h3")?.className).toContain("lg:text-[1.7rem]");
    expect(normal.document.querySelector("h3")?.className).not.toContain("lg:text-[1.7rem]");
  });

  it("sin vídeo no hay elemento <video>; con vídeo es decorativo, mudo y no carga hasta usarse", async () => {
    const without = await renderCard(base);
    expect(without.document.querySelector("video")).toBeNull();

    const { document } = await renderCard({ ...base, image: "/img/demo.jpg", video: "/videos/demo.mp4" });
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute("src", "/videos/demo.mp4");
    expect(video).toHaveAttribute("poster", "/img/demo.jpg");
    expect(video?.hasAttribute("muted")).toBe(true);
    expect(video).toHaveAttribute("preload", "none");
    expect(video).toHaveAttribute("aria-hidden", "true");
    expect(video).toHaveAttribute("tabindex", "-1");
  });

  it("muestra los enlaces a la demo y al código solo si existen, y se abren de forma segura", async () => {
    const none = await renderCard(base);
    expect(none.queryByRole("link", { name: "Demo" })).toBeNull();
    expect(none.queryByRole("link", { name: "Código" })).toBeNull();

    const both = await renderCard({ ...base, demo: "https://example.com/demo", code: "https://github.com/x/y" });
    const demo = both.getByRole("link", { name: "Demo" });
    const code = both.getByRole("link", { name: "Código" });
    expect(demo).toHaveAttribute("href", "https://example.com/demo");
    expect(code).toHaveAttribute("href", "https://github.com/x/y");
    for (const link of [demo, code]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
