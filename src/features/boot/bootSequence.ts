import type { LocalizedText } from "../../lib/language";

export const PROMPT = "jose@portfolio ~ $";

/** Color de una línea de salida completa. Sin `tone`, usa el color de texto normal. */
export type BootTone = "dim" | "ok" | "warn";

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
  { type: "out", text: "Running 5 tests using 1 worker", tone: "dim" },
  {
    type: "out",
    text: {
      es: "  <ok>✓</ok> perfil › es QA Tester en Torcal",
      en: "  <ok>✓</ok> profile › is a QA Tester at Torcal",
    },
  },
  {
    type: "out",
    text: {
      es: "  <ok>✓</ok> qa › automatiza con Playwright + Node",
      en: "  <ok>✓</ok> qa › automates with Playwright + Node",
    },
  },
  {
    type: "out",
    text: {
      es: "  <ok>✓</ok> qa › prueba APIs con Postman",
      en: "  <ok>✓</ok> qa › tests APIs with Postman",
    },
  },
  {
    type: "out",
    text: {
      es: "  <ok>✓</ok> qa › reporta bugs claros en Jira",
      en: "  <ok>✓</ok> qa › reports clear bugs in Jira",
    },
  },
  {
    type: "out",
    text: {
      es: "  <ok>✓</ok> dev › desarrolla con React + TypeScript",
      en: "  <ok>✓</ok> dev › builds with React + TypeScript",
    },
  },
  { type: "out", text: "  <ok>5 passed</ok> <dim>(1.9s)</dim>" },
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
