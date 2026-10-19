import Section from "../../components/layout/Section/Section";
import { aboutFacts, profile } from "../../data/profile";
import { useI18n } from "../../i18n/useI18n";

const AboutSection = () => {
  const { t, localize } = useI18n();

  return (
    <Section id="SobreMi">
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start gap-[clamp(2rem,5vw,4rem)] max-nav:grid-cols-1">
        <div className="flex max-w-[60ch] flex-col gap-5 text-[1.1rem]">
          <p>{t.about.intro({ fullName: profile.fullName, nickname: profile.nickname })}</p>
          <p>
            {t.about.current({ job: localize(profile.currentJob), employer: profile.employer })}
          </p>
        </div>

        <dl className="m-0 flex flex-col rounded-md border border-border bg-surface">
          {aboutFacts.map((fact) => (
            <div
              key={fact.label.es}
              className="flex flex-col gap-[0.15rem] px-5 py-4 not-first:border-t not-first:border-border"
            >
              <dt className="font-code text-[0.78rem] text-accent">{localize(fact.label)}</dt>
              <dd className="m-0 font-medium">{localize(fact.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
};

export default AboutSection;
