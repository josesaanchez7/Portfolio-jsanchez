import { useRef } from "react";
import { FaTimes } from "react-icons/fa";
import Button from "../../components/ui/Button/Button";
import { useI18n } from "../../i18n/useI18n";
import type { CaseStudy, Project } from "../../types/content";

const DETAIL_HEADING =
  "mb-[0.4rem] font-code text-[0.8rem] font-medium tracking-[0.04em] text-accent uppercase";

interface ProjectCaseStudyProps {
  project: Project;
  caseStudy: CaseStudy;
}

/**
 * Botón "Ver detalle" + caso de estudio (problema, solución, decisiones y resultados).
 * Usa <dialog> nativo, que gestiona foco, Escape y capa modal sin dependencias.
 */
const ProjectCaseStudy = ({ project, caseStudy }: ProjectCaseStudyProps) => {
  const { t, localize } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `project-${project.id}-detail-title`;

  return (
    <>
      <Button variant="ghost" onClick={() => dialogRef.current?.showModal()}>
        {t.projects.viewDetail}
      </Button>

      <dialog
        ref={dialogRef}
        className="m-auto max-h-[calc(100dvh-4rem)] w-[min(680px,calc(100%-2rem))] rounded-lg border border-border bg-surface p-0 text-fg backdrop:bg-[rgba(8,10,16,0.7)]"
        aria-labelledby={titleId}
        onClick={(event) => {
          // Atajo para ratón: clic en el fondo cierra el diálogo. Con teclado se cierra con Escape o el botón.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="flex flex-col gap-6 p-7">
          <header className="flex items-start justify-between gap-4">
            <h3 id={titleId} className="text-[1.3rem]">
              {localize(project.title)}
            </h3>
            <form method="dialog">
              <button
                type="submit"
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border border-border-strong bg-transparent text-fg hover:border-accent hover:text-accent"
                aria-label={t.projects.closeDetail}
              >
                <FaTimes aria-hidden="true" />
              </button>
            </form>
          </header>

          <section>
            <h4 className={DETAIL_HEADING}>{t.projects.problem}</h4>
            <p className="text-fg-muted">{localize(caseStudy.problem)}</p>
          </section>
          <section>
            <h4 className={DETAIL_HEADING}>{t.projects.solution}</h4>
            <p className="text-fg-muted">{localize(caseStudy.solution)}</p>
          </section>
          <section>
            <h4 className={DETAIL_HEADING}>{t.projects.decisions}</h4>
            <ul className="flex list-disc flex-col gap-[0.4rem] pl-[1.1rem] text-fg-muted">
              {caseStudy.decisions.map((item) => (
                <li key={item.es}>{localize(item)}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className={DETAIL_HEADING}>{t.projects.results}</h4>
            <ul className="flex list-disc flex-col gap-[0.4rem] pl-[1.1rem] text-fg-muted">
              {caseStudy.results.map((item) => (
                <li key={item.es}>{localize(item)}</li>
              ))}
            </ul>
          </section>
        </div>
      </dialog>
    </>
  );
};

export default ProjectCaseStudy;
