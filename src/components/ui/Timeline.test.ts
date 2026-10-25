// @vitest-environment node
import { describe, expect, it } from "vitest";
import { education, workExperience } from "../../data/experience";
import { renderComponent } from "../../test/render";
import EducationSection from "../sections/EducationSection.astro";
import ExperienceSection from "../sections/ExperienceSection.astro";

describe("Timeline", () => {
  it("Experiencia y Educación usan la línea de tiempo con sus hitos", async () => {
    const experience = await renderComponent(ExperienceSection);
    const studies = await renderComponent(EducationSection);

    expect(experience.document.querySelectorAll("[data-timeline] > li")).toHaveLength(workExperience.length);
    expect(studies.document.querySelectorAll("[data-timeline] > li")).toHaveLength(education.length);
  });

  it("sin JavaScript la línea se ve ya dibujada (--fill: 1) y sin marca de «preparada»", async () => {
    const { document } = await renderComponent(ExperienceSection);

    const list = document.querySelector("[data-timeline]");
    expect(list).toHaveAttribute("style", expect.stringContaining("--fill:1"));
    expect(list).not.toHaveAttribute("data-ready");
  });

  it("los puntos solo se apagan cuando el script marca la lista como preparada (group-data-ready)", async () => {
    const { document } = await renderComponent(ExperienceSection);

    const item = document.querySelector("[data-timeline] > li");
    expect(item?.className).toContain("group-data-ready:before:bg-border-strong");
    expect(item?.className).toContain("group-data-ready:data-lit:before:bg-accent");
  });
});
