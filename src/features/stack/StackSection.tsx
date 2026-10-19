import Section from "../../components/layout/Section/Section";
import { stack } from "../../data/stack";
import { useI18n } from "../../i18n/useI18n";

const StackSection = () => {
  const { localize } = useI18n();

  return (
    <Section id="Stack">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-6">
        {stack.map((category) => (
          <div
            key={category.label.es}
            className="flex flex-col gap-4 rounded-md border border-border bg-surface p-6"
          >
            <h3 className="font-code text-[0.8rem] font-medium tracking-[0.04em] text-accent uppercase">
              {localize(category.label)}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {category.items.map((item) => (
                <li
                  key={item}
                  className="rounded-sm border border-border-strong px-3 py-[0.3rem] text-[0.92rem]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default StackSection;
