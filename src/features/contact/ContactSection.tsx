import { FaCheck, FaCopy, FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";
import Section from "../../components/layout/Section/Section";
import Button from "../../components/ui/Button/Button";
import { profile } from "../../data/profile";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { useI18n } from "../../i18n/useI18n";

const ContactSection = () => {
  const { t } = useI18n();
  const { status, copy } = useCopyToClipboard();

  const statusMessage = {
    idle: "",
    copied: t.contact.copied,
    error: t.contact.copyError,
  }[status];

  return (
    <Section id="Contacto">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-[clamp(2rem,5vw,4rem)] max-[820px]:grid-cols-1">
        <p className="max-w-[44ch] text-[1.1rem] text-fg-muted">{t.contact.intro}</p>

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-stretch overflow-hidden rounded-sm border border-border-strong bg-page">
            <a
              href={`mailto:${profile.email}`}
              className="min-w-0 flex-1 px-4 py-[0.8rem] font-code text-[0.92rem] [overflow-wrap:anywhere] text-fg hover:text-accent"
            >
              {profile.email}
            </a>
            <button
              type="button"
              className="grid w-12 cursor-pointer place-items-center border-l border-border-strong bg-transparent text-base text-fg-muted transition-[color,background-color] duration-200 ease-[ease] hover:bg-surface-hover hover:text-accent"
              onClick={() => void copy(profile.email)}
              aria-label={t.contact.copyLabel}
            >
              {status === "copied" ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />}
            </button>
          </div>
          <p
            className="-mt-[0.4rem] min-h-[1.4em] text-[0.88rem] text-accent"
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button href={`mailto:${profile.email}`} icon={<FaEnvelope aria-hidden="true" />}>
              {t.contact.sendEmail}
            </Button>
            <Button
              href={profile.linkedin}
              external
              variant="secondary"
              icon={<FaLinkedin aria-hidden="true" />}
            >
              LinkedIn
            </Button>
            <Button
              href={profile.github}
              external
              variant="secondary"
              icon={<FaGithub aria-hidden="true" />}
            >
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ContactSection;
