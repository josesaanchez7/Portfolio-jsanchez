# Portfolio de Jose Sánchez

Portfolio personal construido con React 19, TypeScript, Vite y Tailwind CSS v4. Todos los estilos son
utilidades de Tailwind (no hay hojas CSS por componente).

Requisitos: Node ≥ 22.13 y [pnpm](https://pnpm.io) (la versión está fijada en `packageManager`;
con Corepack basta `corepack enable`).

## Scripts

```bash
pnpm install        # instalar dependencias
pnpm dev            # servidor de desarrollo
pnpm build          # comprobación de tipos + build de producción
pnpm preview        # servir el build localmente
pnpm lint           # ESLint (con reglas que usan información de tipos)
pnpm test           # tests (Vitest + Testing Library)
pnpm test:watch     # tests en modo watch
```

## Despliegue en Vercel

El proyecto está listo para Vercel: importa el repositorio y Vercel detecta Vite y pnpm
(por `pnpm-lock.yaml`). [`vercel.json`](vercel.json) fija los comandos, cachea `/assets` de forma
inmutable (los archivos llevan hash) y añade cabeceras de seguridad básicas. No hay variables de
entorno ni rutas de servidor.

## Estilos

Todo el estilo es Tailwind v4 (preflight incluido); la configuración vive en
[`src/styles/global.css`](src/styles/global.css):

- **Tokens de color:** variables CSS (`--bg`, `--surface`, `--accent`…) con tema claro/oscuro en `:root`.
  `@theme inline` las expone como utilidades que siguen el tema activo: `bg-page`, `bg-surface`,
  `text-fg`, `text-fg-muted`, `text-accent`, `border-border`, `border-border-strong`, `shadow-card`…
- **Tipografías:** `font-sans` (Inter), `font-heading` (Space Grotesk), `font-code` (JetBrains Mono) y
  `font-boot` (Geist Mono, pantalla de carga).
- **Radios y ancho:** `rounded-sm|md|lg` (8/12/16 px) y `max-w-site` (1040 px).
- **Puntos de corte con nombre:** `max-nav:` (≤ 820 px), `max-tablet:` (≤ 768), `max-tight:` (≤ 640),
  `max-phone:` (≤ 600) y `max-mini:` (≤ 420). Tailwind aplica `max-*` con «ancho < valor», por eso en
  `@theme` cada uno vale N + 1.
- **Base:** los estilos de elementos (tipografía de los títulos, foco visible, `scroll-behavior`) están en
  `@layer base`, de modo que cualquier utilidad puede sustituirlos.
- **Modo debug** (`<html data-debug="true">`): variantes `in-data-[debug=true]:` en
  [`src/lib/debugSection.ts`](src/lib/debugSection.ts).
- Los estados se expresan con atributos de datos y ARIA (`data-exiting`, `data-pending`,
  `aria-[current=true]`, `aria-pressed`), que también usan los tests.

## Estructura

```text
src/
├── components/
│   ├── layout/   Header, Footer, Section (estructura de página)
│   └── ui/       Button (piezas reutilizables sin lógica de negocio)
├── features/     una carpeta por sección: hero, projects, experience, stack, about, contact, boot (pantalla de carga)
├── hooks/        lógica de efectos reutilizable y testeable (menú, portapapeles, sección activa)
├── theme/        proveedor de tema claro/oscuro y su hook
├── i18n/         idioma activo (es/en): proveedor, hook, <RichText> y diccionarios de interfaz
├── data/         contenido estático tipado (perfil, proyectos, experiencia, stack, secciones)
├── types/        modelos de dominio del contenido
├── lib/          funciones puras (tema, idioma, formato) y utilidades de estilo
├── styles/       global.css: Tailwind, tokens de diseño y base
└── test/         configuración de tests
```

Dirección de dependencias: `features` → `components`, `hooks`, `data`, `theme` → `lib`, `types`.
Los componentes de `components/` no importan de `features/`.

## Idiomas (español / inglés)

- **Contenido** (proyectos, experiencia, stack, secciones…): en `src/data`, cada texto es `{ es: "…", en: "…" }`.
  El tipo `LocalizedText` obliga a rellenar ambos idiomas.
- **Textos de interfaz** (botones, etiquetas, avisos): diccionarios tipados en
  [`src/i18n/messages/`](src/i18n/messages). `es.ts` y `en.ts` deben cumplir la interfaz `Messages`,
  así que no se puede olvidar una clave. Los textos con variables son funciones; `<b>…</b>` se
  resuelve con `<RichText>` (nunca HTML crudo).
- **Idioma inicial:** el que el usuario eligió con el botón de la cabecera (se guarda en
  `localStorage`) o, si nunca eligió, el del navegador; si no es es/en, español.
- Al cambiar de idioma se actualizan `<html lang>`, el título y la meta descripción.
- **Añadir un idioma:** añadirlo a `LANGUAGES` en [`src/lib/language.ts`](src/lib/language.ts) y el compilador
  señala cada texto que falta.
- Los nombres de tecnologías y de marcas (React, GitHub…) no se traducen.

## Pantalla de carga (consola)

[`src/features/boot/`](src/features/boot). Al abrir la web se muestra una terminal simulada que se
desvanece y deja ver el portfolio, que ya está montado detrás.

- **Guion:** [`bootSequence.ts`](src/features/boot/bootSequence.ts), un array tipado de pasos
  `{ type: "cmd" | "out", text, tone? }`. Las líneas de salida admiten texto traducido (`{ es, en }`) y
  `<ok>…</ok>`, `<dim>…</dim>`, `<warn>…</warn>` para colorear solo una parte.
- **Tiempos:** constantes en [`bootTimeline.ts`](src/features/boot/bootTimeline.ts) (18 ms por carácter,
  120 ms entre salidas, 220 ms entre comandos, 700 ms de cursor final, 0,5 s de fundido).
- **Saltar:** clic en cualquier parte, Enter, Escape o espacio, o el botón «Saltar».
- Con `prefers-reduced-motion: reduce` no se muestra. Mientras se ve, el scroll está bloqueado y la
  web de detrás es `inert`.
- `<BootScreen oncePerSession />` la muestra solo la primera vez por pestaña (`sessionStorage`).

## Pie de página (barra de estado)

[`components/layout/Footer`](src/components/layout/Footer): el footer imita la barra de estado de VS Code.
Los datos (rama, errores, veces probada, ubicación, disponibilidad) están en
[`src/data/statusBar.ts`](src/data/statusBar.ts); `testRuns` es un dato de ejemplo marcado con `TODO`.

- **Debug:** activa el modo debug (`<html data-debug="true">`, estilos en
  [`src/lib/debugSection.ts`](src/lib/debugSection.ts)): cada sección muestra un borde discontinuo y su ancla.
- **404 y Ctrl+K:** botones preparados. Quedan inactivos (`aria-disabled`) hasta que se pasen
  `onShow404` / `onOpenConsole` a `<Footer />` en `App.tsx`; esas funciones aún no existen.
- En móvil se ocultan los elementos secundarios y respeta las zonas seguras (`env(safe-area-inset-*)`).

## Dónde editar el contenido

El contenido vive en [`src/data/`](src/data). Los campos opcionales que quedan vacíos no se muestran
y los `TODO` marcan la información pendiente de completar.

- **Proyectos** ([`projects.ts`](src/data/projects.ts)): añade `image`, `code`, `demo` (URLs `https://…`)
  y, opcionalmente, `caseStudy` (problema, solución, decisiones, resultados) para mostrar "Ver detalle".
- **Secciones** ([`sections.ts`](src/data/sections.ts)): ids, títulos y orden. De aquí salen la
  navegación y la numeración (01, 02…) de las secciones.
