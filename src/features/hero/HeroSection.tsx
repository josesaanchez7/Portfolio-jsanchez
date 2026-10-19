import { FaArrowRight, FaDownload, FaGithub, FaLinkedin } from "react-icons/fa";
import cvFile from "../../assets/doc/cv.pdf";
import perfil from "../../assets/img/hero.png";
import Button from "../../components/ui/Button/Button";
import { profile } from "../../data/profile";
import { HERO_ID } from "../../data/sections";
import { stack } from "../../data/stack";
import RichText from "../../i18n/RichText";
import { useI18n } from "../../i18n/useI18n";
import { DEBUG_SECTION } from "../../lib/debugSection";

const TITLE_TAGS = {
  h: (content: string) => <span className="text-accent">{content}</span>,
};

const HeroSection = () => {
  const { t, localize } = useI18n();
  const mainStack = (stack[0]?.items ?? []).map(localize);
  const job = localize(profile.currentJob);

  return (
    <section
      id={HERO_ID}
      data-section={HERO_ID}
      aria-labelledby="hero-title"
      className={`relative isolate scroll-mt-(--header-height) px-6 pt-[clamp(3.5rem,9vw,7rem)] pb-[clamp(4rem,9vw,7rem)] before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(color-mix(in_srgb,var(--text-muted)_25%,transparent)_1px,transparent_1px)] before:bg-size-[28px_28px] before:mask-[linear-gradient(to_bottom,#000_0%,transparent_85%)] before:content-[''] ${DEBUG_SECTION}`}
    >
      <div className="mx-auto grid max-w-site grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-center gap-[clamp(2rem,6vw,5rem)] max-nav:grid-cols-1">
        <div className="flex flex-col items-start gap-6">
          <p className="font-code text-[0.85rem] text-accent">
            {profile.name} <span className="px-[0.15rem] text-fg-muted" aria-hidden="true">
              /
            </span>{" "}
            {t.hero.eyebrowRole(job, profile.employer)}
          </p>

          <h1
            id="hero-title"
            className="text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.05] tracking-[-0.035em] text-balance"
          >
            <RichText text={t.hero.title} tags={TITLE_TAGS} />
          </h1>

          <p className="max-w-[56ch] text-[clamp(1rem,2vw,1.15rem)] text-fg-muted [&_strong]:font-semibold [&_strong]:text-fg">
            <RichText
              text={t.hero.lead({
                role: localize(profile.role),
                job,
                employer: profile.employer,
              })}
            />
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <Button href="#Proyectos" icon={<FaArrowRight aria-hidden="true" />}>
              {t.hero.viewProjects}
            </Button>
            <Button href="#Contacto" variant="secondary">
              {t.hero.contact}
            </Button>
          </div>

          <ul className="-ml-2 flex flex-wrap gap-x-4 gap-y-1" aria-label={t.hero.profileLinksLabel}>
            <li>
              <Button
                href={profile.github}
                external
                variant="ghost"
                icon={<FaGithub aria-hidden="true" />}
              >
                GitHub
              </Button>
            </li>
            <li>
              <Button
                href={profile.linkedin}
                external
                variant="ghost"
                icon={<FaLinkedin aria-hidden="true" />}
              >
                LinkedIn
              </Button>
            </li>
            <li>
              <Button
                href={cvFile}
                download="Jose_Sanchez_CV.pdf"
                variant="ghost"
                icon={<FaDownload aria-hidden="true" />}
              >
                {t.hero.downloadCv}
              </Button>
            </li>
          </ul>

          {mainStack.length > 0 && (
            <p className="border-t border-border pt-5 font-code text-[0.82rem] text-fg-muted">
              <span className="mr-2 text-accent">{t.hero.stackLabel}</span> {mainStack.join(" · ")}
            </p>
          )}
        </div>

        <div className="aspect-square w-[min(100%,340px)] justify-self-center rounded-lg border border-border bg-surface p-4 shadow-card max-nav:order-first max-nav:w-[120px] max-nav:justify-self-start max-nav:p-2">
          <img
            src={perfil}
            alt={t.hero.portraitAlt(profile.name)}
            width={865}
            height={865}
            className="h-full w-full rounded-md object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
