import type { Project, ProjectImage } from "../types/content";

/** Capturas de un proyecto, en orden: `images`, o `image` como una sola captura, o ninguna. */
export const galleryOf = (project: Pick<Project, "images" | "image">): readonly ProjectImage[] => {
  if (project.images && project.images.length > 0) return project.images;
  return project.image ? [{ src: project.image }] : [];
};
