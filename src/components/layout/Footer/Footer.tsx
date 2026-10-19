import { profile } from "../../../data/profile";
import { statusBar } from "../../../data/statusBar";
import { useDebugMode } from "../../../debug/useDebugMode";
import { useI18n } from "../../../i18n/useI18n";
import { formatInteger } from "../../../lib/format";

const ITEM = "inline-flex items-center gap-1.5 px-2.5 py-1 whitespace-nowrap";

// Botones que no parecen botones: sin borde ni fondo propio; al pasar el ratón se oscurece el fondo.
const BUTTON = [
  ITEM,
  "cursor-pointer border-0 bg-transparent font-[inherit] text-inherit",
  "hover:bg-black/20 aria-pressed:bg-black/30",
  "aria-disabled:cursor-default aria-disabled:opacity-60 aria-disabled:hover:bg-transparent",
  "focus-visible:rounded-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-contrast",
].join(" ");

/** Elemento secundario: se oculta en móvil. */
const SECONDARY = "max-sm:hidden";

interface FooterProps {
  /** Muestra la página de error 404. Mientras no se pase, el botón queda preparado pero inactivo. */
  onShow404?: () => void;
  /** Abre la consola interactiva. Mientras no se pase, el botón queda preparado pero inactivo. */
  onOpenConsole?: () => void;
}

/** Pie de página con aspecto de la barra de estado de VS Code. */
const Footer = ({ onShow404, onOpenConsole }: FooterProps) => {
  const { t, language, localize } = useI18n();
  const { enabled: debugEnabled, toggle: toggleDebug } = useDebugMode();

  return (
    <footer
      aria-label={t.footer.label}
      className="w-full bg-accent pr-[max(0.25rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom)] pl-[max(0.25rem,env(safe-area-inset-left))] font-code text-[12px] leading-4 text-accent-contrast sm:text-[13px]"
    >
      <div className="flex flex-wrap items-center">
        <ul className="flex flex-wrap items-center">
          <li>
            <span className={ITEM}>
              <span aria-hidden="true">⎇</span> {statusBar.branch}
            </span>
          </li>
          <li>
            <span className={ITEM}>
              © {new Date().getFullYear()} {profile.name}
            </span>
          </li>
          <li className={SECONDARY}>
            <span className={ITEM}>
              <span aria-hidden="true">✓</span> {t.footer.errors(statusBar.errors)}
            </span>
          </li>
        </ul>

        <ul className="ml-auto flex flex-wrap items-center">
          <li className={SECONDARY}>
            <span className={ITEM}>
              <span aria-hidden="true">▶</span>{" "}
              {t.footer.testedTimes(formatInteger(statusBar.testRuns, language))}
            </span>
          </li>
          <li className={SECONDARY}>
            <span className={ITEM}>
              <span aria-hidden="true">📍</span> {localize(statusBar.location)}
            </span>
          </li>
          {statusBar.available && (
            <li className={SECONDARY}>
              <span className={ITEM}>
                <span aria-hidden="true">●</span> {t.footer.available}
              </span>
            </li>
          )}
          <li>
            <button
              type="button"
              className={BUTTON}
              aria-pressed={debugEnabled}
              onClick={toggleDebug}
            >
              {t.footer.debug}
            </button>
          </li>
          <li>
            <button
              type="button"
              className={BUTTON}
              aria-label={t.footer.notFoundLabel}
              aria-disabled={onShow404 ? undefined : true}
              title={onShow404 ? undefined : t.footer.comingSoon}
              onClick={onShow404}
            >
              {t.footer.notFound}
            </button>
          </li>
          <li>
            <button
              type="button"
              className={BUTTON}
              aria-label={t.footer.consoleLabel}
              aria-disabled={onOpenConsole ? undefined : true}
              title={onOpenConsole ? undefined : t.footer.comingSoon}
              onClick={onOpenConsole}
            >
              <span aria-hidden="true">&gt;_</span> {t.footer.console}
            </button>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
