// @vitest-environment node
import { describe, expect, it } from "vitest";
import { projects } from "../../data/projects";
import { galleryOf } from "../../lib/gallery";
import { messages } from "../../i18n/messages";
import { LANGUAGES, type Language } from "../../lib/language";
import { renderComponent } from "../../test/render";
import type { Project } from "../../types/content";
import ProjectCarousel from "./ProjectCarousel.astro";

const base: Project = {
  id: "demo",
  title: { es: "Proyecto de prueba", en: "Test project" },
  description: { es: "d", en: "d" },
  tags: [],
  status: "done",
};

const three: Project = {
  ...base,
  images: [
    { src: "/img/1.webp", alt: { es: "Uno", en: "One" } },
    { src: "/img/2.webp", alt: { es: "Dos", en: "Two" } },
    { src: "/img/3.webp" },
  ],
};

const render = (project: Project, language: Language = "es") =>
  renderComponent(ProjectCarousel, { props: { project, title: project.title[language] }, language });

describe("ProjectCarousel: sin carrusel", () => {
  it("sin imágenes muestra la vista previa provisional (decorativa) y ningún control", async () => {
    const { document } = await render(base);

    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("[data-carousel]")).toBeNull();
    expect(document.querySelector("[data-carousel-controls]")).toBeNull();
    expect(document.querySelector('[aria-hidden="true"]')).toHaveTextContent("Proyecto de prueba");
    // Sin imágenes no hay nada que ampliar.
    expect(document.querySelector("[data-lightbox-open]")).toBeNull();
    expect(document.querySelector("[data-lightbox-group]")).toBeNull();
  });

  it("con una sola imagen (image o images) no hay carrusel: solo la imagen, con su texto alternativo", async () => {
    for (const project of [{ ...base, image: "/img/solo.webp" }, { ...base, images: [{ src: "/img/solo.webp" }] }]) {
      const { document } = await render(project);

      expect(document.querySelectorAll("img")).toHaveLength(1);
      expect(document.querySelector("img")).toHaveAttribute("alt", "Captura del proyecto Proyecto de prueba");
      expect(document.querySelector("[data-carousel]")).toBeNull();
      expect(document.querySelector("[data-carousel-controls]")).toBeNull();
      expect(document.querySelector('[role="region"]')).toBeNull();
      // Una sola imagen también se puede ampliar.
      expect(document.querySelectorAll("[data-lightbox-open]")).toHaveLength(1);
      expect(document.querySelector("[data-lightbox-group]")).not.toBeNull();
    }
  });
});

describe.each(LANGUAGES)("ProjectCarousel (%s)", (language) => {
  const t = messages[language].projects;

  it("con varias imágenes es una región «carrusel» con nombre propio", async () => {
    const { document } = await render(three, language);

    const region = document.querySelector("[data-carousel]");
    expect(region).toHaveAttribute("role", "region");
    expect(region).toHaveAttribute("aria-roledescription", t.carouselRole);
    expect(region).toHaveAttribute("aria-label", t.carouselLabel(three.title[language]));
  });

  it("cada imagen es una diapositiva etiquetada «n de N», en el orden de los datos", async () => {
    const { document } = await render(three, language);

    const slides = [...document.querySelectorAll("[data-carousel-slide]")];
    expect(slides).toHaveLength(3);
    slides.forEach((slide, index) => {
      expect(slide).toHaveAttribute("role", "group");
      expect(slide).toHaveAttribute("aria-roledescription", t.slideRole);
      expect(slide).toHaveAttribute("aria-label", t.slideLabel(index + 1, 3));
      expect(slide.querySelector("img")).toHaveAttribute("src", galleryOf(three)[index]?.src);
    });
  });

  it("usa el texto alternativo de cada imagen y, si falta, el genérico del proyecto", async () => {
    const { document } = await render(three, language);

    const alts = [...document.querySelectorAll("img")].map((img) => img.getAttribute("alt"));
    expect(alts).toEqual([three.images?.[0]?.alt?.[language], three.images?.[1]?.alt?.[language], t.screenshotAlt(three.title[language])]);
  });

  it("los controles (flechas y un punto por imagen) están ocultos hasta que el script los activa", async () => {
    const { document } = await render(three, language);

    const controls = document.querySelector("[data-carousel-controls]");
    expect(controls).toHaveAttribute("hidden");
    expect(controls?.querySelector("[data-carousel-prev]")).toHaveAttribute("aria-label", t.previousImage);
    expect(controls?.querySelector("[data-carousel-next]")).toHaveAttribute("aria-label", t.nextImage);
    const dots = [...(controls?.querySelectorAll("[data-carousel-dot]") ?? [])];
    expect(dots.map((dot) => dot.getAttribute("aria-label"))).toEqual([1, 2, 3].map((n) => t.goToImage(n, 3)));
  });

  it("el orden en el HTML (que es el de tabulación) es anterior → puntos → siguiente", async () => {
    const { document } = await render(three, language);

    const order = [...document.querySelectorAll("[data-carousel-controls] button")].map((button) =>
      button.hasAttribute("data-carousel-prev") ? "prev" : button.hasAttribute("data-carousel-next") ? "next" : "dot",
    );
    expect(order).toEqual(["prev", "dot", "dot", "dot", "next"]);
  });

  it("la pista se desliza sola (scroll-snap) y avisa de los cambios sin ser una parada de tabulación extra", async () => {
    const { document } = await render(three, language);

    const track = document.querySelector("[data-carousel-track]");
    expect(track?.className).toContain("snap-x");
    expect(track?.className).toContain("snap-mandatory");
    expect(track).not.toHaveAttribute("tabindex");
    expect(track).toHaveAttribute("aria-live", "polite");
  });

  it("cada imagen es un botón que la abre en grande, con el icono decorativo", async () => {
    const { document } = await render(three, language);

    const buttons = [...document.querySelectorAll("[data-lightbox-open]")];
    expect(buttons).toHaveLength(3);
    buttons.forEach((button, index) => {
      expect(button.tagName).toBe("BUTTON");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("aria-haspopup", "dialog");
      expect(button).toHaveAttribute("aria-label", t.enlargeImage(button.querySelector("img")?.getAttribute("alt") ?? ""));
      expect(button.querySelector("img")).toHaveAttribute("src", galleryOf(three)[index]?.src);
      expect(button.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
    });
  });

  it("el contenedor es el grupo de la vista ampliada y lleva el nombre del proyecto", async () => {
    const { document } = await render(three, language);

    const group = document.querySelector("[data-lightbox-group]");
    expect(group).toHaveAttribute("data-lightbox-title", three.title[language]);
    expect(group?.querySelectorAll("[data-lightbox-open]")).toHaveLength(3);
  });
});

describe("ProjectCarousel: datos reales", () => {
  it("IPTVFlix tiene tres capturas, todas con texto alternativo en los dos idiomas", () => {
    const iptv = projects.find((project) => project.id === "iptvflix");

    const gallery = galleryOf(iptv as Project);
    expect(gallery).toHaveLength(3);
    for (const image of gallery) {
      expect(image.src).toMatch(/^\/img\/projects\/.+\.webp$/);
      for (const language of LANGUAGES) expect(image.alt?.[language]?.trim().length).toBeGreaterThan(10);
    }
  });

  it("el vídeo de vista previa, si existe, va en la primera diapositiva", async () => {
    const { document } = await render({ ...three, video: "/videos/demo.mp4" });

    const slides = [...document.querySelectorAll("[data-carousel-slide]")];
    expect(slides[0]?.querySelector("video")).not.toBeNull();
    expect(document.querySelectorAll("video")).toHaveLength(1);
    expect(slides[0]?.querySelector("video")).toHaveAttribute("poster", "/img/1.webp");
    // El vídeo no debe interceptar el clic de «ampliar».
    expect(slides[0]?.querySelector("video")?.className).toContain("pointer-events-none");
  });
});
