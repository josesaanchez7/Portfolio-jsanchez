import { describe, expect, it } from "vitest";
import { galleryOf } from "./gallery";

describe("galleryOf", () => {
  it("sin imágenes devuelve una lista vacía", () => {
    expect(galleryOf({})).toEqual([]);
    expect(galleryOf({ images: [] })).toEqual([]);
  });

  it("`image` cuenta como una sola captura", () => {
    expect(galleryOf({ image: "/a.webp" })).toEqual([{ src: "/a.webp" }]);
  });

  it("`images` manda sobre `image` y conserva el orden", () => {
    const images = [{ src: "/1.webp" }, { src: "/2.webp", alt: { es: "Dos", en: "Two" } }];

    expect(galleryOf({ images, image: "/otra.webp" })).toEqual(images);
  });
});
