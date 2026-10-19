import { FaCode, FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import Button from "../../components/ui/Button/Button";
import { useI18n } from "../../i18n/useI18n";
import type { Project } from "../../types/content";
import ProjectCaseStudy from "./ProjectCaseStudy";

const ProjectCard = ({ project }: { project: Project }) => {
  const { t, localize } = useI18n();
  const titleId = `project-${project.id}-title`;
  const title = localize(project.title);

  return (
    <article
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-[border-color,translate] duration-250 ease-[ease] hover:-translate-y-[3px] hover:border-accent"
      aria-labelledby={titleId}
    >
      <div className="aspect-[16/10] border-b border-border bg-page">
        {project.image ? (
          <img
            src={project.image}
            alt={t.projects.screenshotAlt(title)}
            className="h-full w-full object-cover"
            loading="lazy"
            width={640}
            height={400}
          />
        ) : (
          // Vista previa provisional: sustitúyela añadiendo `image` al proyecto.
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-size-[32px_32px] bg-center p-6 text-center font-code text-[0.85rem] text-fg-muted"
            aria-hidden="true"
          >
            <FaCode className="text-[1.75rem] text-accent" />
            <span>{title}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 id={titleId} className="text-[1.3rem]">
          {title}
        </h3>
        <p className="text-fg-muted">{localize(project.description)}</p>

        <ul className="flex flex-wrap gap-2" aria-label={t.projects.techLabel}>
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-accent-soft px-[0.65rem] py-[0.2rem] font-code text-[0.78rem] text-accent"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          {project.demo && (
            <Button href={project.demo} external icon={<FaExternalLinkAlt aria-hidden="true" />}>
              {t.projects.demo}
            </Button>
          )}
          {project.code && (
            <Button
              href={project.code}
              external
              variant="secondary"
              icon={<FaGithub aria-hidden="true" />}
            >
              {t.projects.code}
            </Button>
          )}
          {project.caseStudy && <ProjectCaseStudy project={project} caseStudy={project.caseStudy} />}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
