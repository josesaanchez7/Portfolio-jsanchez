import Section from "../../components/layout/Section/Section";
import { experience } from "../../data/experience";
import { useI18n } from "../../i18n/useI18n";

const ExperienceSection = () => {
  const { t, localize } = useI18n();

  return (
    <Section id="Experience">
      <ol className="ml-[0.4rem] flex flex-col border-l border-border-strong">
        {experience.map((item) => (
          <li
            key={`${item.kind}-${item.title.es}`}
            className="relative grid grid-cols-[minmax(130px,220px)_1fr] gap-6 pb-10 pl-8 last:pb-0 before:absolute before:top-[0.45rem] before:-left-[0.3rem] before:h-[0.6rem] before:w-[0.6rem] before:rounded-full before:bg-accent before:shadow-[0_0_0_4px_var(--bg)] before:content-[''] max-[640px]:grid-cols-1 max-[640px]:gap-2 max-[640px]:pl-6"
          >
            <div className="flex flex-col gap-[0.2rem] pt-[0.2rem] font-code text-[0.82rem] max-[640px]:flex-row max-[640px]:gap-3">
              <span className="text-accent">{t.experience[item.kind]}</span>
              {item.period && <span className="text-fg-muted">{localize(item.period)}</span>}
            </div>
            <div className="flex flex-col gap-[0.35rem]">
              <h3 className="text-[1.25rem]">{localize(item.title)}</h3>
              <p className="font-medium">{localize(item.organization)}</p>
              {item.description && (
                <p className="mt-[0.4rem] max-w-[60ch] text-fg-muted">{localize(item.description)}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
};

export default ExperienceSection;
