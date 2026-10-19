import Section from "../../components/layout/Section/Section";
import { experience } from "../../data/experience";
import ExperienceEntry from "./ExperienceEntry";

const ExperienceSection = () => (
  <Section id="Experience">
    <ol className="ml-[0.4rem] flex flex-col border-l border-border-strong">
      {experience.map((item) => (
        <ExperienceEntry key={`${item.kind}-${item.title.es}`} item={item} />
      ))}
    </ol>
  </Section>
);

export default ExperienceSection;
