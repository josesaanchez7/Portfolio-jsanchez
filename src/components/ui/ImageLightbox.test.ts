// @vitest-environment node
import { describe, expect, it } from "vitest";
import { messages } from "../../i18n/messages";
import { LANGUAGES } from "../../lib/language";
import { renderComponent } from "../../test/render";
import ImageLightbox from "./ImageLightbox.astro";

describe.each(LANGUAGES)("ImageLightbox (%s)", (language) => {
  const t = messages[language].projects;

  it("es un diálogo modal con nombre y sin imagen hasta que se abre", async () => {
    const { document } = await renderComponent(ImageLightbox, { language });

    const dialog = document.querySelector("dialog[data-lightbox]");
    expect(dialog).not.toBeNull();
    expect(dialog).toHaveAttribute("aria-label", t.lightboxLabel());
    expect(dialog).not.toHaveAttribute("open");
    expect(document.querySelector("[data-lightbox-image]")).not.toHaveAttribute("src");
  });

  it("tiene botones con nombre para cerrar y para ir a la imagen anterior y a la siguiente", async () => {
    const { getByRole } = await renderComponent(ImageLightbox, { language });

    expect(getByRole("button", { name: t.closeImage, hidden: true })).toHaveAttribute("data-lightbox-close");
    expect(getByRole("button", { name: t.previousImage, hidden: true })).toHaveAttribute("data-lightbox-prev");
    expect(getByRole("button", { name: t.nextImage, hidden: true })).toHaveAttribute("data-lightbox-next");
  });

  it("anuncia la imagen actual con una región educada y no repite el pie de foto en voz alta", async () => {
    const { document } = await renderComponent(ImageLightbox, { language });

    expect(document.querySelector("[data-lightbox-live]")).toHaveAttribute("aria-live", "polite");
    expect(document.querySelector("[data-lightbox-caption]")).toHaveAttribute("aria-hidden", "true");
    expect(document.querySelector("[data-lightbox-counter]")).toHaveAttribute("aria-hidden", "true");
  });
});
