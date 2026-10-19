import { FaGithub } from "react-icons/fa";
import Section from "../../components/layout/Section/Section";
import Button from "../../components/ui/Button/Button";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { useI18n } from "../../i18n/useI18n";
import ProjectCard from "./ProjectCard";

const ProjectsSection = () => {
  const { t } = useI18n();

  return (
    <Section id="Proyectos">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        <aside className="flex flex-col items-start justify-center gap-4 rounded-lg border border-dashed border-border-strong p-6">
          <h3 className="text-[1.2rem]">{t.projects.moreTitle}</h3>
          <p className="text-fg-muted">{t.projects.moreDescription}</p>
          <Button
            href={profile.github}
            external
            variant="secondary"
            icon={<FaGithub aria-hidden="true" />}
          >
            {t.projects.moreButton}
          </Button>
        </aside>
      </div>
    </Section>
  );
};

export default ProjectsSection;
