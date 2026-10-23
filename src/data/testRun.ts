import type { LocalizedText } from "../lib/language.ts";

export type TestRunTone = "dim" | "ok" | "warn";

export interface TestRunLine {
  /**
   * Texto plano o traducido. Admite <ok>…</ok>, <dim>…</dim> y <warn>…</warn>
   * para colorear solo una parte de la línea.
   */
  text: string | LocalizedText;
  /** Color de la línea completa. Sin `tone`, usa el color de texto normal. */
  tone?: TestRunTone;
}

/**
 * Salida de `npx playwright test`. La usan la pantalla de carga y el comando `run tests`
 * de la consola, para que ambas muestren siempre lo mismo.
 */
export const TEST_RUN_LINES: readonly TestRunLine[] = [
  { text: "Running 5 tests using 1 worker", tone: "dim" },
  {
    text: {
      es: "  <ok>✓</ok> perfil › es QA Tester en Torcal",
      en: "  <ok>✓</ok> profile › is a QA Tester at Torcal",
    },
  },
  {
    text: {
      es: "  <ok>✓</ok> qa › automatiza con Playwright + Node",
      en: "  <ok>✓</ok> qa › automates with Playwright + Node",
    },
  },
  {
    text: {
      es: "  <ok>✓</ok> qa › prueba APIs con Postman",
      en: "  <ok>✓</ok> qa › tests APIs with Postman",
    },
  },
  {
    text: {
      es: "  <ok>✓</ok> qa › reporta bugs claros en Jira",
      en: "  <ok>✓</ok> qa › reports clear bugs in Jira",
    },
  },
  {
    text: {
      es: "  <ok>✓</ok> dev › desarrolla con Astro + TypeScript",
      en: "  <ok>✓</ok> dev › builds with React + TypeScript",
    },
  },
  { text: "  <ok>5 passed</ok> <dim>(1.9s)</dim>" },
];
