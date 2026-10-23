# Portfolio de José Sánchez

Portfolio personal construido con [Astro](https://astro.build) 7, TypeScript y Tailwind CSS v4. Todo son
componentes `.astro` (HTML + CSS + JavaScript de servidor en el frontmatter); no hay React ni ningún otro
framework de UI. La web se genera como HTML estático y la interactividad (menú, tema, idioma, pantalla de
carga, consola…) es JavaScript vanilla en etiquetas `<script>` dentro de los propios componentes.
Todos los estilos son utilidades de Tailwind (no hay hojas CSS por componente).

Requisitos: Node 24 (LTS; fijado con `engines` en `package.json` para que Vercel no cambie de versión mayor por su cuenta) y [pnpm](https://pnpm.io) (la versión está fijada en `packageManager`;
con Corepack basta `corepack enable`)

## Scripts

```bash
pnpm install        # instalar dependencias
pnpm dev            # servidor de desarrollo
pnpm build          # comprobación de tipos (astro check) + build de producción en dist/
pnpm preview        # servir el build localmente
pnpm check          # solo la comprobación de tipos de .astro y .ts
pnpm lint           # ESLint (con reglas que usan información de tipos)
pnpm test           # tests (Vitest)
pnpm test:watch     # tests en modo watch
```

## Despliegue en Vercel

El proyecto está listo para Vercel: importa el repositorio y Vercel detecta Astro y pnpm
(por `pnpm-lock.yaml`). Es un sitio estático, así que no hace falta adaptador. [`vercel.json`](vercel.json) fija
los comandos, cachea `/_astro` de forma inmutable (los archivos llevan hash) y añade cabeceras de seguridad
básicas. No hay variables de entorno obligatorias ni rutas de servidor.

## Estilos

Todo el estilo es Tailwind v4 (preflight incluido), cargado con su plugin de Vite desde
[`astro.config.mjs`](astro.config.mjs); la configuración vive en [`src/styles/global.css`](src/styles/global.css),
que importa [`Layout.astro`](src/layouts/Layout.astro):

- **Tokens de color:** variables CSS (`--bg`, `--surface`, `--accent`…) con tema claro/oscuro en `:root`.
  `@theme inline` las expone como utilidades que siguen el tema activo: `bg-page`, `bg-surface`,
  `text-fg`, `text-fg-muted`, `text-accent`, `border-border`, `border-border-strong`, `shadow-card`…
- **Tipografías** (alojadas en local con Fontsource, sin peticiones a Google Fonts): `font-sans` (Inter),
  `font-heading` (Space Grotesk), `font-code` (JetBrains Mono) y `font-boot` (Geist Mono, pantalla de carga).
  Las tres de la primera pantalla se precargan desde `Layout.astro`.
- **Radios y ancho:** `rounded-sm|md|lg` (8/12/16 px) y `max-w-site` (1040 px).
- **Puntos de corte con nombre:** `max-nav:` (≤ 820 px), `max-tablet:` (≤ 768), `max-tight:` (≤ 640),
  `max-phone:` (≤ 600) y `max-mini:` (≤ 420). Tailwind aplica `max-*` con «ancho < valor», por eso en
  `@theme` cada uno vale N + 1.
- **Base:** los estilos de elementos (tipografía de los títulos, foco visible, `scroll-behavior`) están en
  `@layer base`, de modo que cualquier utilidad puede sustituirlos.
- **Modo debug** (`<html data-debug="true">`): variantes `in-data-[debug=true]:` en
  [`src/lib/debugSection.ts`](src/lib/debugSection.ts).
- Los estados se expresan con atributos de datos y ARIA (`data-exiting`, `data-pending`, `data-open`,
  `aria-[current=true]`, `aria-pressed`) que tanto el CSS como los scripts leen y escriben.
- **Iconos:** SVG propios en [`src/components/ui/icons.ts`](src/components/ui/icons.ts) (Font Awesome 5 Free,
  CC BY 4.0), pintados con `<Icon name="…" />`. No hay librería de iconos.

## SEO y compartir en redes

- **Dos URL, una por idioma:** `/` (español) y `/en/` (inglés). Las genera una sola página,
  [`src/pages/[...lang]/index.astro`](src/pages/[...lang]/index.astro), con título, descripción y etiquetas
  ya en el HTML de cada idioma (no solo vía JavaScript).
- [`Layout.astro`](src/layouts/Layout.astro) pinta el `<head>` a partir de [`src/lib/seo.ts`](src/lib/seo.ts)
  (`buildSeoTags`) y de los textos de `src/i18n`: Open Graph, tarjeta de Twitter, `canonical` y `hreflang`.
  [`sitemap.xml.ts`](src/pages/sitemap.xml.ts) y [`robots.txt.ts`](src/pages/robots.txt.ts) generan
  `sitemap.xml` y `robots.txt`.
- **`SITE_URL`:** Open Graph, canonical, hreflang y sitemap necesitan la URL pública (la opción `site` de Astro,
  que `astro.config.mjs` rellena con `resolveSiteUrl`). En Vercel se toma de `VERCEL_PROJECT_PRODUCTION_URL`;
  con dominio propio, define `SITE_URL=https://tu-dominio` en las variables de entorno del proyecto. Sin URL
  el build avisa y omite esas piezas (y no se crean `sitemap.xml` ni `robots.txt`).
- **Imágenes para compartir:** `public/og-es.jpg` y `public/og-en.jpg` (1200 × 630, ~80 KB). Si cambias
  el nombre, la foto o el stack, hay que regenerarlas.

## Estructura

```text
astro.config.mjs    Astro: URL pública, idiomas (i18n), trailingSlash y plugin de Tailwind
src/
├── pages/          rutas: [...lang]/index.astro (/ y /en/), sitemap.xml.ts y robots.txt.ts
├── layouts/        Layout.astro: <html>, <head> (SEO, fuentes, script anti-parpadeo) y <body>
├── components/
│   ├── layout/     Header, Footer, Section (estructura de página)
│   ├── sections/   una por sección: Hero, Projects (+ Card y CaseStudy), Experience (+ Entry), Stack, About, Contact
│   ├── boot/       BootScreen: pantalla de carga con aspecto de terminal
│   ├── console/    ConsoleDialog: consola interactiva
│   └── ui/         piezas reutilizables: Button, Icon (+ icons.ts), RichText
├── scripts/        lógica de navegador sin marcado: guion y tiempos de la carga, comandos y sesión de la consola, debug
├── i18n/           getI18n (idioma de la página), parseTags y diccionarios de interfaz (messages/)
├── data/           contenido estático tipado (perfil, proyectos, experiencia, stack, secciones)
├── types/          modelos de dominio del contenido
├── lib/            funciones puras (tema, idioma, formato, SEO) y utilidades de estilo
├── styles/         global.css: Tailwind, tokens de diseño y base
├── assets/         imágenes y CV que procesa Astro (con hash en el build)
└── test/           utilidades de los tests (renderComponent) y el test de la página
```

Dirección de dependencias: `pages` → `layouts`, `components` → `scripts`, `i18n`, `data` → `lib`, `types`.
Las páginas son lo único que mira el router: en `src/pages` solo puede haber rutas (cualquier archivo ahí
se publica), por eso el test de la página vive en `src/test`.

## Interactividad (JavaScript en el cliente)

No hay islas ni hidratación: cada componente con comportamiento lleva su `<script>` (TypeScript) al final del
archivo `.astro`, que Astro empaqueta y carga como módulo. Los scripts enlazan con el marcado mediante
atributos `data-*` (`data-header`, `data-theme-toggle`, `data-console-open`…) y comparten estado a través del
DOM (`<html data-theme | data-debug | data-boot | data-console-open>`).

- **Tema:** el script inline del `<head>` aplica el tema guardado antes del primer pintado; el botón de la cabecera
  lo alterna (los dos iconos están en el HTML y los muestra el CSS según `data-theme`).
- **Menú móvil, sección activa, copiar correo, casos de estudio:** scripts de su componente.
- **Lo que no puede importar módulos** (el script del `<head>`) duplica a propósito un poco de lógica de
  `src/lib/theme.ts` y `src/lib/language.ts`: mantener en sincronía.

## Idiomas (español / inglés)

- **Contenido** (proyectos, experiencia, stack, secciones…): en `src/data`, cada texto es `{ es: "…", en: "…" }`.
  El tipo `LocalizedText` obliga a rellenar ambos idiomas.
- **Textos de interfaz** (botones, etiquetas, avisos): diccionarios tipados en
  [`src/i18n/messages/`](src/i18n/messages). `es.ts` y `en.ts` deben cumplir la interfaz `Messages`,
  así que no se puede olvidar una clave. Los textos con variables son funciones; `<b>…</b>` se
  resuelve con `<RichText>` (nunca HTML crudo).
- **Idioma de una página:** sale de la URL (`/en/` → inglés). Cada componente lo obtiene en su frontmatter con
  `getI18n(Astro.currentLocale)`, que devuelve `t` (textos de interfaz) y `localize` (contenido).
- **Cambiar de idioma** es ir a la otra URL (`/` ↔ `/en/`): el botón de la cabecera es un enlace normal. Su script
  guarda la elección en `localStorage`, conserva la búsqueda y el ancla (`#Proyectos`), mantiene el scroll y evita
  repetir la pantalla de carga.
- **Primera visita a `/`:** un script inline del `<head>` redirige a `/en/` si el usuario eligió inglés antes o, si
  nunca eligió, si su navegador prefiere inglés. En cualquier otro caso se queda en español.
- **Añadir un idioma:** añadirlo a `LANGUAGES` en [`src/lib/language.ts`](src/lib/language.ts) y el compilador
  señala cada texto que falta; la página y el sitemap lo recogen solos.
- Los nombres de tecnologías y de marcas (React, GitHub…) no se traducen.

## Pantalla de carga (consola)

[`components/boot/BootScreen.astro`](src/components/boot/BootScreen.astro). Al abrir la web se muestra una
terminal simulada que se desvanece y deja ver el portfolio, que ya está montado detrás.

- **Guion:** [`bootSequence.ts`](src/scripts/boot/bootSequence.ts), un array tipado de pasos
  `{ type: "cmd" | "out", text, tone? }`. Las líneas de salida admiten texto traducido (`{ es, en }`) y
  `<ok>…</ok>`, `<dim>…</dim>`, `<warn>…</warn>` para colorear solo una parte.
- **Cómo funciona:** el HTML ya contiene todo el guion (oculto, con `data-pending`, para reservar su espacio);
  el script lo va revelando según la línea de tiempo.
- **Tiempos:** constantes en [`bootTimeline.ts`](src/scripts/boot/bootTimeline.ts) (18 ms por carácter,
  120 ms entre salidas, 220 ms entre comandos, 700 ms de cursor final, 0,5 s de fundido).
- **Saltar:** clic en cualquier parte, Enter, Escape o espacio, o el botón «Saltar».
- Solo se muestra si el script del `<head>` activa `<html data-boot>`: no lo hace con `prefers-reduced-motion: reduce`
  ni justo después de cambiar de idioma. Mientras se ve, el scroll está bloqueado y la web de detrás es `inert`.

## Consola interactiva

[`components/console/ConsoleDialog.astro`](src/components/console/ConsoleDialog.astro). Una terminal simulada para conocerme escribiendo comandos.

- **Abrir:** `Ctrl + K` / `Cmd + K` (también la cierra), la tecla `` ` `` (no si se está escribiendo en un
  campo; en el teclado español es la tecla muerta a la derecha de la P) y el botón `>_ Ctrl+K` del footer.
  No se abre durante la pantalla de carga.
- **Cerrar:** `Esc`, el botón ×, un clic fuera, `Ctrl + K` otra vez o el comando `exit`. Al cerrar, el foco
  vuelve al elemento que la abrió.
- **Comandos:** `help`, `whoami`, `skills`, `proyectos` / `projects`, `run tests` (también `npm test` y
  `npx playwright test`), `contacto` / `contact`, `cv`, `debug`, `404`, `clear`, `exit` y el oculto
  `sudo contratar`. No distinguen mayúsculas y ignoran espacios sobrantes.
- **Historial:** flechas arriba y abajo; se conserva mientras la página esté abierta (al cambiar de idioma
  se empieza de cero, porque es otra página).
- **Añadir un comando:** un único sitio, [`commands.ts`](src/scripts/console/commands.ts) (`COMMANDS`). Cada
  comando es una función pura que devuelve datos (líneas con tono/enlace y, si hace falta, *efectos* como
  `close`, `openCv`, `toggleDebug`). El estado (historial, salida escalonada) está en
  [`session.ts`](src/scripts/console/session.ts), que no toca el DOM, y la parte visual en el `<script>` de
  `ConsoleDialog.astro`, que pinta todo como texto plano. Los textos traducibles van en `src/i18n/messages`.
- **Datos:** `proyectos` lee `src/data/projects.ts` (campo `status`) y `run tests` usa las mismas líneas que
  la pantalla de carga (`src/data/testRun.ts`).
- **404:** el comando está preparado, pero mientras no exista la página (`canShowNotFound` en el script de
  `ConsoleDialog.astro`) solo avisa de que no está disponible.

## Pie de página (barra de estado)

[`components/layout/Footer.astro`](src/components/layout/Footer.astro): el footer imita la barra de estado de VS Code.
Los datos (rama, errores, veces probada, ubicación, disponibilidad) están en
[`src/data/statusBar.ts`](src/data/statusBar.ts); `testRuns` es un dato de ejemplo marcado con `TODO`.
El año del copyright se calcula al construir la web.

- **Debug:** activa el modo debug (`<html data-debug="true">`, estilos en
  [`src/lib/debugSection.ts`](src/lib/debugSection.ts)): cada sección muestra un borde discontinuo y su ancla.
  El comando `debug` de la consola cambia el mismo estado.
- **404:** botón preparado. Queda inactivo (`aria-disabled`) hasta que exista la página 404.
- En móvil se ocultan los elementos secundarios y respeta las zonas seguras (`env(safe-area-inset-*)`).

## Tests

Vitest, con dos tipos de prueba:

- **Lógica pura** (jsdom): contenido, idioma, tema, SEO, `parseTags`, línea de tiempo de la carga, comandos y
  sesión de la consola.
- **Componentes `.astro`** (Node): se renderizan con la
  [Container API](https://docs.astro.build/en/reference/container-reference/) de Astro
  ([`src/test/render.ts`](src/test/render.ts)) y se consultan con Testing Library. Esos archivos empiezan por
  `// @vitest-environment node`. Es HTML estático: los `<script>` no se ejecutan, así que el comportamiento del
  navegador (menú, tema, pantalla de carga, atajos de la consola…) no está cubierto por los tests.

## Dónde editar el contenido

El contenido vive en [`src/data/`](src/data). Los campos opcionales que quedan vacíos no se muestran
y los `TODO` marcan la información pendiente de completar.

- **Proyectos** ([`projects.ts`](src/data/projects.ts)): añade `image`, `code`, `demo` (URLs `https://…`)
  y, opcionalmente, `caseStudy` (problema, solución, decisiones, resultados) para mostrar "Ver detalle".
- **Secciones** ([`sections.ts`](src/data/sections.ts)): ids, títulos y orden. De aquí salen la
  navegación y la numeración (01, 02…) de las secciones.
