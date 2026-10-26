// Genera src/data/techLogos.generated.ts a partir de los logos oficiales de cada tecnología.
//
//   pnpm icons
//
// Fuentes (dependencias de desarrollo; el sitio NO depende de ninguna CDN en tiempo de ejecución):
//   · simple-icons (CC0-1.0): https://github.com/simple-icons/simple-icons  → viewBox 24 × 24, color de marca oficial.
//   · devicon (MIT): https://github.com/devicons/devicon → para lo que simple-icons no incluye (Playwright; Java, porque
//     simple-icons solo trae OpenJDK). Se usan las variantes «plain» (un solo trazado, sin colores propios).
//
// Cada SVG se optimiza con SVGO, se queda solo con el trazado (el color lo pone la web con currentColor) y se comprueba
// que pesa menos de 2 KB. Además se calcula el tamaño con el que se dibuja en su baldosa: el logo se ajusta a una caja fija
// según el rectángulo que ocupa de verdad, para que todos tengan un peso visual parecido.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { svgPathBbox } from "svg-path-bbox";
import * as simpleIcons from "simple-icons";
import { optimize } from "svgo";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const MAX_BYTES = 2048;
// Caja (px) en la que se ajusta el rectángulo real del logo: alto máximo de 36 px y ancho máximo de 44 px.
const FIT = { width: 44, height: 36 };
const MAX_SVG_PX = 56;

/** Tecnologías, con el nombre que usa `src/data/stack.ts`. */
const TECHS = [
  { name: "Astro", simple: "siAstro" },
  { name: "JavaScript", simple: "siJavascript" },
  { name: "TypeScript", simple: "siTypescript" },
  { name: "HTML", simple: "siHtml5" },
  { name: "CSS", simple: "siCss" },
  { name: "Tailwind CSS", simple: "siTailwindcss" },
  { name: "PHP", simple: "siPhp" },
  // simple-icons solo tiene OpenJDK; el logo de Java es el de devicon.
  { name: "Java", devicon: { id: "java", file: "java-plain.svg" } },
  { name: "Python", simple: "siPython" },
  { name: "Node.js", simple: "siNodedotjs" },
  // Playwright no está en simple-icons.
  { name: "Playwright", devicon: { id: "playwright", file: "playwright-plain.svg" } },
  { name: "Postman", simple: "siPostman" },
  { name: "Jira", simple: "siJira" },
  { name: "Git", simple: "siGit" },
  { name: "GitHub", simple: "siGithub" },
  { name: "Vite", simple: "siVite" },
  { name: "ESLint", simple: "siEslint" },
];

const pkgVersion = (name) => JSON.parse(readFileSync(join(root, "node_modules", name, "package.json"), "utf8")).version;
const versions = { "simple-icons": pkgVersion("simple-icons"), devicon: pkgVersion("devicon") };
const deviconMeta = JSON.parse(readFileSync(join(root, "node_modules/devicon/devicon.json"), "utf8"));

/** SVG de entrada y color de marca oficial de una tecnología. */
const load = (tech) => {
  if (tech.simple) {
    const icon = simpleIcons[tech.simple];
    if (!icon) throw new Error(`${tech.name}: no existe ${tech.simple} en simple-icons`);
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${icon.path}"/></svg>`,
      brandColor: `#${icon.hex}`,
      source: `simple-icons@${versions["simple-icons"]} (CC0-1.0) · ${tech.simple}`,
    };
  }
  const { id, file } = tech.devicon;
  const meta = deviconMeta.find((entry) => entry.name === id);
  if (!meta?.color) throw new Error(`${tech.name}: devicon no tiene color para ${id}`);
  return {
    svg: readFileSync(join(root, "node_modules/devicon/icons", id, file), "utf8"),
    brandColor: meta.color.toUpperCase(),
    source: `devicon@${versions.devicon} (MIT) · ${id}/${file}`,
  };
};

const SVGO_CONFIG = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    "preset-default",
    "removeDimensions",
    "convertShapeToPath",
    "mergePaths",
    // El color lo pone la web (currentColor): fuera cualquier relleno propio.
    { name: "removeAttrs", params: { attrs: ["fill", "xmlns"] } },
  ],
};

const rows = [];
const shapes = {};
const problems = [];

for (const tech of TECHS) {
  const { svg, brandColor, source } = load(tech);
  const { data } = optimize(svg, SVGO_CONFIG);

  const viewBox = /viewBox="([^"]+)"/.exec(data)?.[1];
  const paths = [...data.matchAll(/<path\b[^>]*?\sd="([^"]+)"[^>]*>/g)].map((match) => match[1]);
  const extra = data.replace(/<\/?svg\b[^>]*>/g, "").replace(/<path\b[^>]*>/g, "").trim();
  if (!viewBox || paths.length === 0) problems.push(`${tech.name}: sin viewBox o sin trazado tras SVGO`);
  if (extra) problems.push(`${tech.name}: quedan elementos que no son trazados: ${extra.slice(0, 60)}`);
  if (/fill-rule|clip-rule|transform=/.test(data)) problems.push(`${tech.name}: usa fill-rule/clip-rule/transform; hay que resolverlo`);

  // Rectángulo real que ocupa el logo dentro de su viewBox.
  const [vbX = 0, vbY = 0, vbW = 24, vbH = 24] = (viewBox ?? "0 0 24 24").split(/\s+/).map(Number);
  const boxes = paths.map((d) => svgPathBbox(d));
  const bbox = [
    Math.min(...boxes.map((box) => box[0])),
    Math.min(...boxes.map((box) => box[1])),
    Math.max(...boxes.map((box) => box[2])),
    Math.max(...boxes.map((box) => box[3])),
  ];
  const glyphW = bbox[2] - bbox[0];
  const glyphH = bbox[3] - bbox[1];
  const scale = Math.min(FIT.width / glyphW, FIT.height / glyphH, MAX_SVG_PX / Math.max(vbW, vbH));
  const width = Number((vbW * scale).toFixed(1));
  const height = Number((vbH * scale).toFixed(1));

  const bytes = Buffer.byteLength(`<svg viewBox="${viewBox}">${paths.map((d) => `<path d="${d}"/>`).join("")}</svg>`);
  if (bytes > MAX_BYTES) problems.push(`${tech.name}: pesa ${bytes} bytes (máximo ${MAX_BYTES})`);

  shapes[tech.name] = { viewBox, paths, brandColor, source, width, height, bytes };
  rows.push({ name: tech.name, source: source.split(" · ")[0], brand: brandColor, bytes, size: `${width}×${height}`, glyph: `${glyphW.toFixed(1)}×${glyphH.toFixed(1)}` });
}

console.table(rows);
if (problems.length > 0) {
  console.error("\nProblemas:\n" + problems.map((problem) => `  - ${problem}`).join("\n"));
  process.exit(1);
}

const out = `// GENERADO por scripts/generate-tech-logos.mjs (pnpm icons). No lo edites a mano: vuelve a generarlo.
//
// Logos oficiales de cada tecnología, ya optimizados con SVGO (solo el trazado: el color lo pone la web con currentColor).
//   · simple-icons ${versions["simple-icons"]} (CC0-1.0): la mayoría. Su color de marca es el hex oficial.
//   · devicon ${versions.devicon} (MIT): Playwright y Java, que no están (o no son el logo correcto) en simple-icons.
// \`source\` anota de dónde sale cada uno. \`width\` y \`height\` son los px con los que se dibuja el <svg> para que el logo
// quede dentro de una caja de ${FIT.width} × ${FIT.height} px; \`bytes\` es lo que pesa el SVG optimizado (todos < 2 KB).

export interface TechLogoShape {
  /** viewBox original del logo (se respeta). */
  viewBox: string;
  /** Trazados del logo (un solo color). */
  paths: readonly string[];
  /** Color de marca oficial, en hexadecimal. */
  brandColor: string;
  /** Librería y archivo de los que sale el logo. */
  source: string;
  /** Tamaño en px del <svg> dentro de la baldosa (ajusta el peso visual de los logos anchos o estrechos). */
  width: number;
  height: number;
  /** Peso del SVG optimizado. */
  bytes: number;
}

export const techLogoShapes = ${JSON.stringify(shapes, null, 2)} as const satisfies Record<string, TechLogoShape>;
`;
writeFileSync(join(root, "src/data/techLogos.generated.ts"), out);
console.log(`\nEscrito src/data/techLogos.generated.ts (${Object.keys(shapes).length} logos, todos < ${MAX_BYTES} bytes).`);
