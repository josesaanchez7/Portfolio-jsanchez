// Genera src/data/testCount.generated.json con el número de tests de la suite (Vitest).
//
//   pnpm test:count
//
// Lo ejecuta `pnpm build` antes de compilar: el contador del pie de página y la descripción del proyecto de pruebas
// salen de aquí, así que son siempre ciertos. Si algún test falla, el script termina con error y la compilación se
// detiene (no se publica una web con la suite en rojo).
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "src", "data", "testCount.generated.json");

const workDir = mkdtempSync(join(tmpdir(), "test-count-"));
const reportFile = join(workDir, "report.json");

try {
  // Se lanza el binario de Vitest con el mismo Node que ejecuta este script (sin shell: funciona igual en Windows).
  const vitest = join(root, "node_modules", "vitest", "vitest.mjs");
  const run = spawnSync(
    process.execPath,
    [vitest, "run", "--reporter=default", "--reporter=json", `--outputFile.json=${reportFile}`],
    { cwd: root, stdio: "inherit" },
  );

  const report = JSON.parse(readFileSync(reportFile, "utf8"));
  if (run.status !== 0 || !report.success) {
    console.error("Hay tests que fallan: no se actualiza el contador.");
    process.exit(1);
  }

  writeFileSync(output, `${JSON.stringify({ total: report.numTotalTests, files: report.testResults.length }, null, 2)}\n`);
  console.log(`testCount.generated.json: ${report.numTotalTests} tests`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
