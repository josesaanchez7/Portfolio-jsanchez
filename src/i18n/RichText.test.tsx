import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RichText from "./RichText";

describe("RichText", () => {
  it("convierte <b> en <strong> por defecto", () => {
    const { container } = render(<RichText text="Soy <b>QA Tester</b> en <b>Torcal</b>." />);

    expect(container.textContent).toBe("Soy QA Tester en Torcal.");
    expect([...container.querySelectorAll("strong")].map((el) => el.textContent)).toEqual([
      "QA Tester",
      "Torcal",
    ]);
  });

  it("usa los renderizadores indicados", () => {
    const { container } = render(
      <RichText text="Hola <h>mundo</h>" tags={{ h: (content) => <mark>{content}</mark> }} />,
    );

    expect(container.querySelector("mark")).toHaveTextContent("mundo");
  });

  it("deja como texto las etiquetas desconocidas", () => {
    const { container } = render(<RichText text="a <i>b</i> c" />);

    expect(container.textContent).toBe("a <i>b</i> c");
    expect(container.querySelector("i")).toBeNull();
  });

  it("no interpreta HTML: un <script> queda como texto", () => {
    const { container } = render(<RichText text='<script>alert("x")</script>' />);

    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toBe('<script>alert("x")</script>');
  });

  it("renderiza texto plano sin marcas", () => {
    const { container } = render(<RichText text="Sin marcas" />);

    expect(container.textContent).toBe("Sin marcas");
  });
});
