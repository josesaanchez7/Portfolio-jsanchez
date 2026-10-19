import { useRef, useState } from "react";
import { FaBars, FaGithub, FaLinkedin, FaMoon, FaSun, FaTimes } from "react-icons/fa";
import { profile } from "../../../data/profile";
import { HERO_ID, SECTIONS } from "../../../data/sections";
import { useActiveSection } from "../../../hooks/useActiveSection";
import { useDismissable } from "../../../hooks/useDismissable";
import { useI18n } from "../../../i18n/useI18n";
import { LANGUAGE_CODE } from "../../../lib/language";
import { useTheme } from "../../../theme/useTheme";

// El menú móvil se activa en ≤ 820px. Sin ancho ni display: cada botón añade los suyos.
const ICON_BUTTON =
  "h-[38px] place-items-center rounded-sm bg-transparent text-fg-muted cursor-pointer transition-[color,background-color] duration-200 ease-[ease] hover:bg-surface hover:text-accent";

// Constante de módulo: useActiveSection necesita una referencia estable.
const OBSERVED_IDS = [HERO_ID, ...SECTIONS.map((section) => section.id)];

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, localize } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const activeId = useActiveSection(OBSERVED_IDS);

  useDismissable(menuOpen, headerRef, (reason) => {
    setMenuOpen(false);
    if (reason === "escape") menuButtonRef.current?.focus();
  });

  const isDark = theme === "dark";
  // El selector muestra y activa el idioma al que se cambiaría.
  const otherLanguage = language === "es" ? "en" : "es";

  return (
    <header
      className="sticky top-0 z-[1000] h-(--header-height) border-b border-border bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur-md"
      ref={headerRef}
    >
      <div className="mx-auto flex h-full max-w-site items-center gap-6 px-6 max-nav:gap-3 max-nav:px-5">
        <a
          href={`#${HERO_ID}`}
          className="inline-flex items-center gap-[0.65rem] font-heading font-bold tracking-[-0.01em] text-fg"
          aria-label={t.header.homeLabel(profile.name)}
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-sm border border-border bg-surface text-[0.8rem] text-accent"
            aria-hidden="true"
          >
            JS
          </span>
          <span className="max-mini:hidden">{profile.name}</span>
        </a>

        <nav
          id="main-nav"
          aria-label={t.header.navLabel}
          className={`ml-auto max-nav:absolute max-nav:top-(--header-height) max-nav:right-0 max-nav:left-0 max-nav:m-0 max-nav:border-b max-nav:border-border max-nav:bg-page max-nav:px-5 max-nav:pt-3 max-nav:pb-5 max-nav:shadow-card ${
            menuOpen ? "max-nav:block" : "max-nav:hidden"
          }`}
        >
          <ul className="flex gap-1 max-nav:flex-col">
            {SECTIONS.map(({ id, navLabel }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="relative block rounded-sm px-3 py-[0.45rem] text-[0.92rem] font-medium text-fg-muted transition-[color,background-color] duration-200 ease-[ease] hover:bg-surface hover:text-fg aria-[current=true]:text-fg aria-[current=true]:after:absolute aria-[current=true]:after:right-3 aria-[current=true]:after:bottom-[0.1rem] aria-[current=true]:after:left-3 aria-[current=true]:after:h-0.5 aria-[current=true]:after:rounded-[2px] aria-[current=true]:after:bg-accent aria-[current=true]:after:content-[''] max-nav:px-2 max-nav:py-[0.8rem] max-nav:text-[1rem] max-nav:aria-[current=true]:after:right-auto max-nav:aria-[current=true]:after:left-2 max-nav:aria-[current=true]:after:w-6"
                  aria-current={activeId === id ? "true" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {localize(navLabel)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 border-l border-border pl-3 max-nav:ml-auto max-nav:border-l-0 max-nav:pl-0">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-grid w-[38px] text-[1.1rem] ${ICON_BUTTON}`}
            aria-label={t.header.github}
          >
            <FaGithub aria-hidden="true" />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-grid w-[38px] text-[1.1rem] ${ICON_BUTTON}`}
            aria-label={t.header.linkedin}
          >
            <FaLinkedin aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-grid w-[38px] text-[1.1rem] ${ICON_BUTTON}`}
            aria-label={isDark ? t.header.themeToLight : t.header.themeToDark}
          >
            {isDark ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => setLanguage(otherLanguage)}
            className={`inline-grid w-auto min-w-[38px] px-2 font-code text-[0.8rem] font-semibold tracking-[0.04em] ${ICON_BUTTON}`}
            aria-label={t.header.switchLanguage[otherLanguage]}
            lang={otherLanguage}
          >
            {LANGUAGE_CODE[otherLanguage]}
          </button>
          <button
            type="button"
            ref={menuButtonRef}
            className={`hidden w-[38px] text-[1.1rem] max-nav:inline-grid ${ICON_BUTTON}`}
            aria-label={menuOpen ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
