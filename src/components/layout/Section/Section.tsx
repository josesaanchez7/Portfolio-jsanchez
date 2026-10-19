import type { ReactNode } from "react";
import { getSection, type SectionId } from "../../../data/sections";
import { useI18n } from "../../../i18n/useI18n";
import { DEBUG_SECTION } from "../../../lib/debugSection";

interface SectionProps {
  id: SectionId;
  children: ReactNode;
}

/** Sección con encabezado numerado. Título y número salen de `data/sections.ts`. */
const Section = ({ id, children }: SectionProps) => {
  const { localize } = useI18n();
  const { title, number } = getSection(id);
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={headingId}
      className={`w-full scroll-mt-(--header-height) border-t border-border px-6 py-24 max-tablet:px-5 max-tablet:py-16 ${DEBUG_SECTION}`}
    >
      <div className="mx-auto flex w-full max-w-site flex-col gap-10 max-tablet:gap-8">
        <header className="flex items-baseline gap-4">
          <span className="font-code text-[0.9rem] text-accent" aria-hidden="true">
            {number}
          </span>
          <h2 id={headingId} className="text-[clamp(1.75rem,4vw,2.5rem)]">
            {localize(title)}
          </h2>
        </header>
        {children}
      </div>
    </section>
  );
};

export default Section;
