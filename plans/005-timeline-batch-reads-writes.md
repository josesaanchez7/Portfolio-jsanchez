# 005 — Experience timeline: read all layout first, then write (no per-node reflow on scroll)

- **Status**: TODO
- **Commit**: 815deb1
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file (`src/components/ui/Timeline.astro`, the `<script>` block), ~20 lines, no behavior change

## Problem

While the Experience list is near the viewport, every scroll frame runs `update()`. Inside the per-node loop it
alternates a **layout read** (`getBoundingClientRect`) with **DOM writes** (`toggleAttribute`, `setAttribute`), after
having already written `--fill` on the list. Each read after a write forces the browser to recalculate style/layout
synchronously, once per node per frame (layout thrashing). It also re-runs `querySelectorAll` inside the loop on every
frame, although the DOM never changes.

```ts
// src/components/ui/Timeline.astro:36-49 — current
      const update = () => {
        frame = 0;
        const mark = window.innerHeight * READING_LINE;
        const rect = list.getBoundingClientRect();
        const fill = Math.min(1, Math.max(0, (mark - rect.top) / rect.height));
        list.style.setProperty("--fill", String(fill));
        for (const node of nodes) {
          const lit = node.getBoundingClientRect().top <= mark;
          node.toggleAttribute("data-lit", lit);
          for (const target of node.querySelectorAll("[data-track]")) target.toggleAttribute("data-lit", lit);
          // El contenido entra una sola vez: al volver arriba no se desmonta.
          if (lit) for (const target of node.querySelectorAll("[data-reveal]")) target.setAttribute("data-seen", "");
        }
      };
```

## Target

Identical behavior, but: (1) all rects are read first, (2) all writes happen after, (3) the `data-track` /
`data-reveal` element lists are resolved once at setup.

```ts
      // Se resuelven una sola vez: el DOM de la lista no cambia.
      const tracks = nodes.map((node) => [...node.querySelectorAll("[data-track]")]);
      const reveals = nodes.map((node) => [...node.querySelectorAll("[data-reveal]")]);

      // La franja de lectura está a un 65 % de la altura de la ventana: el nodo se enciende al cruzarla.
      // Primero se leen todas las posiciones y después se escribe: así el navegador calcula el diseño una sola vez.
      const update = () => {
        frame = 0;
        const mark = window.innerHeight * READING_LINE;
        const rect = list.getBoundingClientRect();
        const tops = nodes.map((node) => node.getBoundingClientRect().top);
        const fill = Math.min(1, Math.max(0, (mark - rect.top) / rect.height));
        list.style.setProperty("--fill", String(fill));
        nodes.forEach((node, index) => {
          const lit = (tops[index] ?? Infinity) <= mark;
          node.toggleAttribute("data-lit", lit);
          for (const target of tracks[index] ?? []) target.toggleAttribute("data-lit", lit);
          // El contenido entra una sola vez: al volver arriba no se desmonta.
          if (lit) for (const target of reveals[index] ?? []) target.setAttribute("data-seen", "");
        });
      };
```

## Repo conventions to follow

- The code already coalesces scroll into one `requestAnimationFrame` (`schedule`, lines 50-52) and only listens while the list is near the viewport (IntersectionObserver, lines 58-64). Keep both exactly as they are.
- Comments in Spanish. TypeScript is strict (`noUncheckedIndexedAccess` style handling like the `?? ` fallbacks above).
- Exemplar of "read then write" with cached measurements in this repo: the header's `ResizeObserver`-measured `maxScroll` in `src/components/layout/Header.astro` (script block, `measure`).

## Steps

1. In `src/components/ui/Timeline.astro`, inside the `for (const list of lists)` loop, add the `tracks` and `reveals` constants right after `const nodes = …`.
2. Replace the body of `update` with the target version above.
3. Leave `schedule`, the observer, the listeners and the `--fill`/`data-ready` initialisation untouched.

## Boundaries

- Do NOT change `READING_LINE`, the `--fill` semantics, or which attributes get toggled.
- Do NOT change markup or classes (the CSS in `ExperienceEntry.astro` / `CareerPath.astro` depends on `data-lit`, `data-seen`, `data-ready`).
- Do NOT replace the scroll listener with `animation-timeline: scroll()` (out of scope).
- If the code differs from the "current" excerpt, STOP and report.

## Verification

- **Mechanical**: `pnpm check`, `pnpm test` (`Timeline.test.ts`, `ExperienceEntry.test.ts`), `pnpm lint`.
- **Feel check**:
  - scroll the Experience section slowly: the vertical line fills, each company/role node lights when it crosses ~65 % of the viewport height, the cards slide in once and never disappear on scroll-up (same as before);
  - DevTools → Performance, record 3 s of scrolling through Experience: there should be no "Forced reflow" warnings attributed to `update` in `Timeline.astro` (compare with `git stash`);
  - `prefers-reduced-motion: reduce`: script is skipped entirely, everything shows already lit (unchanged).
- **Done when**: the Performance trace shows no forced reflow inside `update`, and the visual behavior is identical.
