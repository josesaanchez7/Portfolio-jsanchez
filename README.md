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
- **Puntos de corte con nombre:** `max-menu:` (≤ 960 px, menú móvil a pantalla completa), `max-nav:` (≤ 820 px, diseños a una columna), `max-tablet:` (≤ 768), `max-tight:` (≤ 640),
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
├── pages/          rutas: [...lang]/index.astro (/ y /en/), 404.astro, sitemap.xml.ts y robots.txt.ts
├── layouts/        Layout.astro: <html>, <head> (SEO, fuentes, script anti-parpadeo) y <body>
├── components/
│   ├── layout/     Header, Footer, Section (estructura de página)
│   ├── sections/   una por sección: Hero, Projects (+ Card y Carousel), Experience y Education (+ Entry), Stack (+ TechMarquee), About, Contact
│   ├── boot/       BootScreen: pantalla de carga con aspecto de terminal
│   ├── palette/    CommandPalette: paleta de comandos (Ctrl/⌘ + K)
│   ├── console/    ConsoleDialog: consola interactiva
│   └── ui/         piezas reutilizables: Button, Icon (+ icons.ts), RichText, Timeline, Toast
├── scripts/        lógica de navegador sin marcado: guion y tiempos de la carga, comandos y sesión de la consola, búsqueda de la paleta, debug
├── i18n/           getI18n (idioma de la página), parseTags y diccionarios de interfaz (messages/)
├── data/           contenido estático tipado (perfil, proyectos, experiencia, stack, métricas, secciones)
├── types/          modelos de dominio del contenido
├── lib/            funciones puras (tema, idioma, formato, SEO) y utilidades de estilo
├── styles/         global.css: Tailwind, tokens de diseño y base
├── assets/         imágenes y CV que procesa Astro (con hash en el build)
└── test/           utilidades de los tests (renderComponent) y los tests de las páginas
```

Dirección de dependencias: `pages` → `layouts`, `components` → `scripts`, `i18n`, `data` → `lib`, `types`.
Las páginas son lo único que mira el router: en `src/pages` solo puede haber rutas (cualquier archivo ahí
se publica), por eso los tests de las páginas viven en `src/test`.

## Interactividad (JavaScript en el cliente)

No hay islas ni hidratación: cada componente con comportamiento lleva su `<script>` (TypeScript) al final del
archivo `.astro`, que Astro empaqueta y carga como módulo. Los scripts enlazan con el marcado mediante
atributos `data-*` (`data-header`, `data-theme-toggle`, `data-console-open`…) y comparten estado a través del
DOM (`<html data-theme | data-debug | data-boot | data-console-active | data-palette-active | data-menu-active>`).

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
  guarda la elección en `localStorage`, conserva la búsqueda y el ancla (`#Proyectos`) y mantiene el scroll.
- **Primera visita a `/`:** un script inline del `<head>` redirige a `/en/` si el usuario eligió inglés antes o, si
  nunca eligió, si su navegador prefiere inglés. En cualquier otro caso se queda en español.
- **Añadir un idioma:** añadirlo a `LANGUAGES` en [`src/lib/language.ts`](src/lib/language.ts) y el compilador
  señala cada texto que falta; la página y el sitemap lo recogen solos.
- Los nombres de tecnologías y de marcas (React, GitHub…) no se traducen.

## Página 404

[`src/pages/404.astro`](src/pages/404.astro) genera `dist/404.html`, que Vercel sirve (con estado 404) para
cualquier ruta que no exista. Como el servidor no sabe a qué URL iba el visitante, es una sola página con
los dos idiomas en el HTML y un script inline que deja visible el que toca: el de la URL (`/en/…`), si no el
que eligió con el selector y, si nunca eligió, el del navegador. Lleva `noindex`, no tiene pantalla de carga
(`<Layout home>` solo la activa en la home) y muestra la ruta pedida con aspecto de terminal. Los textos
están en `notFound` de `src/i18n/messages`.

## Navbar

[`components/layout/Header.astro`](src/components/layout/Header.astro): una cápsula flotante y centrada («isla»), con fondo
translúcido y `backdrop-blur`. La cabecera es `sticky` con alto 0 (no ocupa sitio) y la cápsula se ajusta a su contenido.
El `<script>` del componente pone atributos en `<header>` que el CSS (variantes `group-data-*:`) convierte en estilo:

- **`data-scrolled`** (al bajar de 16 px): la cápsula se encoge (56 → 48 px) y gana opacidad.
- **Indicador deslizante:** una píldora que se mueve bajo el enlace señalado (ratón o teclado) y, si no hay ninguno, bajo
  el de la sección activa (scroll-spy con `IntersectionObserver`). Es decorativo (`aria-hidden`).
- **Barra de progreso de lectura:** 2 px en el borde inferior, con el color de acento. El script escribe `--progress`
  (0–1) en `<header>`; el recorrido total se mide en un `ResizeObserver`, no en cada fotograma.
- **Siempre a la vista en escritorio.** En móvil, `data-hidden` la oculta al bajar y la muestra al subir (no ocurre con
  el menú o un diálogo abiertos, al navegar con teclado ni con `prefers-reduced-motion`).
- **Móvil (≤ 960 px, `max-menu:`):** el `<nav>` pasa a ser un menú a pantalla completa con los enlaces entrando
  escalonados (`--i` por elemento); dentro van GitHub y LinkedIn. Mientras está abierto, el resto de la página es
  `inert` y no hace scroll; se cierra con Escape, tocando cualquier hueco o al elegir una sección.
- Los atributos de estado de `<html>` (`data-menu-active`, `data-palette-active`, `data-console-active`) bloquean el
  scroll de fondo (regla al final de `global.css`); no se llaman como los botones que abren cada cosa para que los
  selectores no se confundan.

## Paleta de comandos

[`components/palette/CommandPalette.astro`](src/components/palette/CommandPalette.astro). **`Ctrl + K` / `⌘ + K`** (también el
botón de la lupa de la cabecera) abre un buscador para ir a una sección o ejecutar una acción: tema, idioma, copiar el correo
(con un aviso), descargar el CV, abrir la consola, activar el modo debug y abrir GitHub o LinkedIn.

- **Teclado:** escribe para filtrar (sin tildes ni mayúsculas, por palabras sueltas y por palabras clave), `↑`/`↓` mueven la
  selección, `Enter` ejecuta, `Esc` o `Ctrl/⌘ + K` cierran. También se puede usar el ratón.
- **Accesibilidad:** patrón combobox + listbox; el foco se queda en el campo y `aria-activedescendant` apunta a la opción.
  Al cerrar, el foco vuelve a donde estaba. No se abre durante la pantalla de carga ni encima de otro diálogo.
- **Cómo funciona:** todas las opciones ya vienen en el HTML (con su texto de búsqueda normalizado); el script solo filtra con
  [`scripts/palette.ts`](src/scripts/palette.ts) y ejecuta la elegida reutilizando los controles que existen (botón de tema,
  enlace de idioma, botón de la consola…), así que cada uno conserva su estado.
- **Añadir un comando:** un elemento en `commands` del frontmatter (y su función en `commands` del `<script>` si es una
  acción nueva). Los textos van en `palette` de `src/i18n/messages`.

## Secciones: efectos

- **Proyectos (bento):** en pantallas anchas la tarjeta destacada ocupa 4 de 6 columnas (título y texto más grandes) y
  el resto 2; en las demás, una columna. Lo es la primera o la que lleve `featured: true`. Las capturas de cada proyecto se ven como un **carrusel**
  ([`ProjectCarousel.astro`](src/components/sections/ProjectCarousel.astro)) cuando hay dos o más: una pista con `scroll-snap`
  que ya se desliza con el dedo, la rueda o las flechas del teclado sin JavaScript, más flechas (siempre visibles en pantallas
  táctiles; en las demás, al pasar el ratón o enfocar) y puntos que activa el script. Es circular, no avanza solo, cada imagen
  lleva su texto alternativo y sigue el patrón de carrusel de ARIA (región «carrusel», diapositivas «n de N»). Al pulsar una imagen (o Enter/Espacio en ella) se abre **en grande**
  ([`ui/ImageLightbox.astro`](src/components/ui/ImageLightbox.astro), un único `<dialog>` modal para toda la web): recorre las imágenes
  del proyecto con las flechas, el teclado (←, →, Inicio, Fin) o deslizando, muestra la descripción como pie de foto y se cierra
  con Esc, el botón ✕ o un clic en el fondo. Al cerrar, el carrusel se queda en la última imagen vista y el foco vuelve a su botón.
  También se amplía un proyecto con una sola imagen. Las tarjetas
  tienen **spotlight**:
  el borde y un brillo suave siguen al ratón ([`lib/spotlight.ts`](src/lib/spotlight.ts) + [`scripts/spotlight.ts`](src/scripts/spotlight.ts),
  también en las tarjetas del Stack). Con `video` (mp4/webm, sin audio, en `public/`) la tarjeta reproduce una vista previa al
  pasar el ratón o entrar con el teclado (la `image` hace de póster); no se reproduce con «reducir movimiento» ni con ahorro de
  datos, y si el vídeo falla se queda la imagen. `demo` y `code` muestran sus botones solo si existen.
- **Experiencia y Educación:** una línea de tiempo ([`ui/Timeline.astro`](src/components/ui/Timeline.astro)). La línea de acento se
  «dibuja» según el scroll (`--fill`) y cada hito se enciende (`data-lit`) al cruzar la franja de lectura (65 % de la altura de la
  ventana). Sin JavaScript o con «reducir movimiento» se ve ya todo dibujado y encendido.
- **Stack:** encima de las tarjetas hay dos filas de tecnologías que se desplazan en sentidos opuestos y se pausan con el ratón
  ([`TechMarquee.astro`](src/components/sections/TechMarquee.astro)). Es decorativo (`aria-hidden`: las tarjetas ya listan lo mismo)
  y con «reducir movimiento» queda una sola copia en varias líneas.
- **Sobre mí:** contadores animados que cuentan al entrar en pantalla. El HTML trae el valor final (y un `sr-only` para los lectores
  de pantalla); el script solo anima. Ver «Dónde editar el contenido» para las cifras.
- **Contacto:** indicador «Disponible para nuevas oportunidades» con un punto verde que late (sale si `statusBar.available` es
  true) y un aviso animado («✓ Correo copiado») al copiar el correo. El aviso es [`ui/Toast.astro`](src/components/ui/Toast.astro) +
  `showToast()` de [`scripts/toast.ts`](src/scripts/toast.ts), compartido con la paleta de comandos.

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
- **Una vez por sesión:** solo se muestra si el script del `<head>` activa `<html data-boot>`. Lo hace la primera vez
  que se abre la home en una pestaña (guarda `boot-seen` en `sessionStorage`), y no con
  `prefers-reduced-motion: reduce`. Recargar, cambiar de idioma o volver desde la 404 no la repiten; para verla de
  nuevo, abre la web en otra pestaña o borra esa clave. Mientras se ve, el scroll está bloqueado y la web de detrás es `inert`.

## Consola interactiva

[`components/console/ConsoleDialog.astro`](src/components/console/ConsoleDialog.astro). Una terminal simulada para conocerme escribiendo comandos.

- **Abrir:** la tecla `` ` `` (no si se está escribiendo en un campo; en el teclado español es la tecla muerta a la
  derecha de la P), el botón `>_ Consola` del footer o el comando «Abrir consola» de la paleta (`Ctrl/⌘ + K`, que ya no
  abre la consola directamente). No se abre durante la pantalla de carga ni encima de otro diálogo.
- **Cerrar:** `Esc`, el botón ×, un clic fuera o el comando `exit`. Al cerrar, el foco
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
- **404:** navega a una ruta que no existe a propósito (`notFoundPath` en [`seo.ts`](src/lib/seo.ts):
  `/esta-pagina-no-existe/` o `/en/this-page-does-not-exist/`), así que la responde la página 404 real.

## Pie de página (barra de estado)

[`components/layout/Footer.astro`](src/components/layout/Footer.astro): el footer imita la barra de estado de VS Code.
Los datos (rama, errores, veces probada, ubicación, disponibilidad) están en
[`src/data/statusBar.ts`](src/data/statusBar.ts); `testRuns` es un dato de ejemplo marcado con `TODO`.
El año del copyright se calcula al construir la web.

- **Debug:** activa el modo debug (`<html data-debug="true">`, estilos en
  [`src/lib/debugSection.ts`](src/lib/debugSection.ts)): cada sección muestra un borde discontinuo y su ancla.
  El comando `debug` de la consola cambia el mismo estado.
- **404:** enlace a esa misma ruta inexistente, para ver la página de error de verdad.
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

- **Métricas** ([`metrics.ts`](src/data/metrics.ts)): las dos primeras se calculan solas (años desde tu primer puesto, que sube
  cada año al construir, y número de tecnologías del stack). Para añadir las tuyas (bugs reportados, tests automatizados, años
  programando…) rellena `personal` con cifras reales, aunque sean aproximadas: `{ value: 150, prefix: "+", label: { es, en } }`.
- **Proyectos** ([`projects.ts`](src/data/projects.ts)): el orden del archivo es el de la web y el primero es el destacado
  (intercámbialos para destacar otro). Las capturas van en `public/img/projects/` (webp, proporción 16:10) y se indican como
  `images: [{ src: "/img/projects/nombre.webp", alt: { es, en } }, …]` (con una sola, `image: "…"` basta; con dos o más sale el
  carrusel). Añade `images`, `video`, `code`, `demo` (URLs `https://…`).
- **Experiencia y educación** ([`experience.ts`](src/data/experience.ts)): cada entrada lleva `start` y, si ya
  terminó, `end` (`"AAAA-MM"`, o `"AAAA"` si no se sabe el mes). Con ellas se ordena sola, de la más reciente a
  la más antigua (lo que sigue en curso, sin `end`, va primero), así que da igual en qué punto del archivo
  la añadas. El texto que se ve es `period`. Los puestos (`kind: "work"`) salen en Experiencia; los estudios y
  certificaciones, en Educación.
- **Sobre mí:** el relato de la izquierda (origen, recorrido y lo que aportas) son los tres textos `about` de
  [`src/i18n/messages`](src/i18n/messages); la tarjeta de la derecha, `aboutFacts` en
  [`profile.ts`](src/data/profile.ts) (la ubicación sale de `statusBar.ts`).
- **Secciones** ([`sections.ts`](src/data/sections.ts)): ids, títulos y orden. De aquí salen la
  navegación y la numeración (01, 02…) de las secciones.
