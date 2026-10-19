import { useCallback, useState } from "react";
import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
import AboutSection from "./features/about/AboutSection";
import BootScreen from "./features/boot/BootScreen";
import ConsoleDialog from "./features/console/ConsoleDialog";
import { useConsoleShortcuts } from "./features/console/useConsoleShortcuts";
import ContactSection from "./features/contact/ContactSection";
import ExperienceSection from "./features/experience/ExperienceSection";
import HeroSection from "./features/hero/HeroSection";
import ProjectsSection from "./features/projects/ProjectsSection";
import StackSection from "./features/stack/StackSection";
import { useI18n } from "./i18n/useI18n";

const App = () => {
  const { t } = useI18n();
  const [booting, setBooting] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const openConsole = useCallback(() => setConsoleOpen(true), []);
  const closeConsole = useCallback(() => setConsoleOpen(false), []);
  const toggleConsole = useCallback(() => setConsoleOpen((open) => !open), []);

  // La consola no se puede abrir mientras se muestra la pantalla de carga.
  useConsoleShortcuts({ enabled: !booting, onToggle: toggleConsole, onOpen: openConsole });

  return (
    <>
      {booting && <BootScreen onFinish={() => setBooting(false)} />}
      {/* La web ya está montada detrás; inert evita tabular hacia ella mientras se ve la consola. */}
      <div inert={booting}>
        <a
          href="#main"
          className="absolute top-3 left-3 z-[2000] -translate-y-[200%] rounded-sm bg-accent px-4 py-[0.6rem] font-semibold text-accent-contrast focus:translate-y-0"
        >
          {t.skipToContent}
        </a>
        <Header />
        <main id="main">
          <HeroSection />
          <ProjectsSection />
          <ExperienceSection />
          <StackSection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer onOpenConsole={openConsole} />
      </div>
      <ConsoleDialog open={consoleOpen && !booting} onClose={closeConsole} />
    </>
  );
};

export default App;
