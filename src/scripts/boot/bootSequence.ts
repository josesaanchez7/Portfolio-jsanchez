import { TEST_RUN_LINES, type TestRunTone } from "../../data/testRun";
import type { LocalizedText } from "../../lib/language";

export const PROMPT = "jose@portfolio ~ $";

/** Color de una línea de salida completa. Sin `tone`, usa el color de texto normal. */
export type BootTone = TestRunTone;

interface CommandStep {
  type: "cmd";
  text: string;
}

interface OutputStep {
  type: "out";
  /**
   * Texto plano o traducido. Admite <ok>…</ok>, <dim>…</dim> y <warn>…</warn>
   * para colorear solo una parte de la línea.
   */
  text: string | LocalizedText;
  tone?: BootTone;
}

export type BootStep = CommandStep | OutputStep;

/** Guion de la consola: edita aquí los textos. */
export const BOOT_SEQUENCE: readonly BootStep[] = [
  { type: "cmd", text: "git clone github.com/josesaanchez7/portfolio" },
  { type: "out", text: "Cloning into 'portfolio'... done.", tone: "dim" },

  { type: "cmd", text: "npm install" },
  { type: "out", text: "added 214 packages in 1.2s", tone: "dim" },

  { type: "cmd", text: "npx playwright test jose.spec.ts" },
  ...TEST_RUN_LINES.map((line): BootStep => ({ type: "out", ...line })),
  {
    type: "out",
    text: {
      es: "  ⚠ 5 bugs detectados en producción. Encuéntralos tú.",
      en: "  ⚠ 5 bugs detected in production. Find them yourself.",
    },
    tone: "warn",
  },

  { type: "cmd", text: "npm run dev" },
  {
    type: "out",
    text: { es: "  ➜ Portfolio listo. Bienvenido.", en: "  ➜ Portfolio ready. Welcome." },
  },
];
