import { FaExternalLinkAlt } from "react-icons/fa";
import Button from "../../components/ui/Button/Button";
import { useI18n } from "../../i18n/useI18n";
import type { ExperienceItem } from "../../types/content";

/** Una entrada de la línea de tiempo: trabajo, estudios o certificación (con su credencial). */
const ExperienceEntry = ({ item }: { item: ExperienceItem }) => {
  const { t, localize } = useI18n();
  const { credential } = item;

  return (
    <li className="relative grid grid-cols-[minmax(130px,220px)_1fr] gap-6 pb-10 pl-8 last:pb-0 before:absolute before:top-[0.45rem] before:-left-[0.3rem] before:h-[0.6rem] before:w-[0.6rem] before:rounded-full before:bg-accent before:shadow-[0_0_0_4px_var(--bg)] before:content-[''] max-tight:grid-cols-1 max-tight:gap-2 max-tight:pl-6">
      <div className="flex flex-col gap-[0.2rem] pt-[0.2rem] font-code text-[0.82rem] max-tight:flex-row max-tight:gap-3">
        <span className="text-accent">{t.experience[item.kind]}</span>
        {item.period && <span className="text-fg-muted">{localize(item.period)}</span>}
      </div>
      <div className="flex flex-col gap-[0.35rem]">
        <h3 className="text-[1.25rem]">{localize(item.title)}</h3>
        {item.organization && <p className="font-medium">{localize(item.organization)}</p>}
        {item.description && (
          <p className="mt-[0.4rem] max-w-[60ch] text-fg-muted">{localize(item.description)}</p>
        )}
        {credential && (credential.id || credential.url) && (
          <div className="mt-[0.4rem] flex flex-col items-start gap-3">
            {credential.id && (
              <p className="font-code text-[0.82rem] text-fg-muted">
                {t.experience.credentialId}: {credential.id}
              </p>
            )}
            {credential.url && (
              <Button
                href={credential.url}
                external
                variant="secondary"
                icon={<FaExternalLinkAlt aria-hidden="true" />}
              >
                {t.experience.showCredential}
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

export default ExperienceEntry;
