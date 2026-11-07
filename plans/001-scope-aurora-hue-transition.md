# 001 — Scope the aurora hue transition to `.ambient` instead of `:root`

- **Status**: TODO
- **Commit**: 815deb1 (working tree also has uncommitted edits to Header.astro, ProjectCarousel.astro, ambient.ts, global.css — none touch the lines below)
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file (`src/styles/global.css`), ~30 lines moved, 0 behavior change

## Problem

Each time the reader crosses into another section, `src/scripts/rail.ts` sets `<html data-section="…">`.
`global.css` then transitions three registered, **inheriting** custom properties on `:root` for 1500 ms:

```css
/* src/styles/global.css:240-261 — current */
@property --hue-a { syntax: "<number>"; inherits: true; initial-value: 264; }
@property --hue-b { syntax: "<number>"; inherits: true; initial-value: 246; }
@property --hue-c { syntax: "<number>"; inherits: true; initial-value: 266; }

:root {
  transition:
    --hue-a 1500ms var(--ease-in-out),
    --hue-b 1500ms var(--ease-in-out),
    --hue-c 1500ms var(--ease-in-out);
}
```

and `--orb-a/b/c` are derived from them on `:root`:

```css
/* src/styles/global.css:191-193 (dark) — current */
  --orb-a: oklch(0.4 0.2 var(--hue-a));
  --orb-b: oklch(0.5 0.12 var(--hue-b));
  --orb-c: oklch(0.3 0.17 var(--hue-c));
/* src/styles/global.css:228-230 (light) — current */
  --orb-a: oklch(0.78 0.12 var(--hue-a));
  --orb-b: oklch(0.85 0.1 var(--hue-b));
  --orb-c: oklch(0.82 0.08 var(--hue-c));
```

Only `.ambient` and its three `.ambient-orb` children (and the `.ambient` background) read `--orb-*` / `--hue-*`
(`global.css` ~lines 392, 401, 407, 413, 421). But because the animated property lives on the document root and
inherits, the browser has to re-resolve it for the **whole DOM** on every frame of the 1.5 s transition. That window
overlaps the smooth-scroll to an anchor, which is exactly when a dropped frame is most visible.

## Target

Same visuals, same 1500 ms, same `--ease-in-out`, same hue values per section — but the animated properties live on
`.ambient`, so only that element and its 4 children are affected.

```css
/* target — 1. remove the three --orb-a/b/c lines from BOTH `:root` blocks (dark ~191-193, light ~228-230).
   Keep --orb-opacity and --grid-line on :root (they do not depend on the hue). */

/* target — 2. delete the whole `:root { transition: --hue-a … }` block (~256-261). */

/* target — 3. add, right after the existing `.ambient { … }` rule: */
.ambient {
  --orb-a: oklch(0.4 0.2 var(--hue-a));
  --orb-b: oklch(0.5 0.12 var(--hue-b));
  --orb-c: oklch(0.3 0.17 var(--hue-c));
  transition:
    --hue-a 1500ms var(--ease-in-out),
    --hue-b 1500ms var(--ease-in-out),
    --hue-c 1500ms var(--ease-in-out);
}

:root[data-theme="light"] .ambient {
  --orb-a: oklch(0.78 0.12 var(--hue-a));
  --orb-b: oklch(0.85 0.1 var(--hue-b));
  --orb-c: oklch(0.82 0.08 var(--hue-c));
}

/* target — 4. change the five per-section selectors from `html[data-section="X"]` to `html[data-section="X"] .ambient`
   (values unchanged): */
html[data-section="Proyectos"] .ambient { --hue-a: 252; --hue-b: 248; --hue-c: 250; }
html[data-section="Experience"] .ambient { --hue-a: 238; --hue-b: 240; --hue-c: 236; }
html[data-section="Education"] .ambient { --hue-a: 260; --hue-b: 254; --hue-c: 262; }
html[data-section="SobreMi"] .ambient { --hue-a: 228; --hue-b: 238; --hue-c: 224; }
html[data-section="Contacto"] .ambient { --hue-a: 246; --hue-b: 234; --hue-c: 240; }
```

Keep the three `@property --hue-*` registrations exactly as they are (`inherits: true` is still needed so the orbs
inherit from `.ambient`).

## Repo conventions to follow

- Easing token: `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` already defined in `@theme` (`global.css:60`). Reuse it, do not retype a curve.
- Comments in this repo are in Spanish; update the comment above the `@property` block (~line 235-239) to say the hue lives on `.ambient` so the transition does not restyle the whole page.
- `src/data/techLogos.test.ts` reads `--surface` and `--accent` from the first `:root {` and `:root[data-theme="light"]` blocks. Do not reorder or rename those blocks.

## Steps

1. In `src/styles/global.css`, delete the three `--orb-a/b/c` declarations from the dark `:root` block (keep the comment line above them, `--orb-opacity: 0.3;` and `--grid-line`).
2. Same for the `:root[data-theme="light"]` block (keep `--orb-opacity: 0.34;` and `--grid-line`).
3. Delete the `:root { transition: … }` block that follows the three `@property` rules.
4. Add the `.ambient` custom-property + transition declarations and the `:root[data-theme="light"] .ambient` override shown above, placed immediately after the existing `.ambient { … }` rule.
5. Replace the five `html[data-section="…"] { … }` selectors with `html[data-section="…"] .ambient { … }`.
6. Update the explanatory comment above the `@property` rules (Spanish).

## Boundaries

- Do NOT change any hue number, duration or easing.
- Do NOT touch `src/scripts/rail.ts`, `Layout.astro` or any component.
- Do NOT add JavaScript, new dependencies or new tokens.
- Do NOT remove `--orb-opacity` / `--grid-line` from `:root`.
- If `.ambient` or the `--orb-*` lines are not where described, STOP and report.

## Verification

- **Mechanical**: `pnpm check` (0 errors), `pnpm test` (all pass), `pnpm lint`.
- **Feel check**: `pnpm dev`, open the page at ≥ 1024 px wide, and scroll slowly from Inicio to Contacto:
  - the background tint still drifts between blue shades over ~1.5 s at each section, in dark and in light theme;
  - toggling the theme still gives correct orb colours (light theme = pale washes);
  - DevTools → Performance, record a scroll from Inicio to Proyectos: the "Recalculate Style" events during the hue transition should list a handful of affected elements, not the whole document (compare against the same recording on the old CSS via `git stash`);
  - `prefers-reduced-motion: reduce` (Rendering panel): colour change is instant, nothing breaks.
  - Note: the three orb layers are still repainted while the hue animates; this plan removes the page-wide restyle, not that paint. Do not try to fix the paint here.
- **Done when**: `grep -n "^:root {" -A4 src/styles/global.css` shows no `transition:` on `:root`, and the hue still changes smoothly per section.
