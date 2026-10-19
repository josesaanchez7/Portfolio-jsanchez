import { useState } from "react";
import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
import AboutSection from "./features/about/AboutSection";
import BootScreen from "./features/boot/BootScreen";
import ContactSection from "./features/contact/ContactSection";
import ExperienceSection from "./features/experience/ExperienceSection";
import HeroSection from "./features/hero/HeroSection";
import ProjectsSection from "./features/projects/ProjectsSection";
import StackSection from "./features/stack/StackSection";
import { useI18n } from "./i18n/useI18n";

const App = () => {
  const { t } = useI18n();
  const [booting, setBooting] = useState(true);

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
        <Footer />
      </div>
    </>
  );
};

export default App;
