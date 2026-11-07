# 003 — Give the image lightbox a matching exit (fade out like it fades in)

- **Status**: DONE (2026-11-07)
- **Commit**: 815deb1
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Interruptibility (asymmetric enter vs. exit)
- **Estimated scope**: 1 file (`src/components/ui/ImageLightbox.astro`): 1 class string + 1 handler line

## Problem

The lightbox `<dialog>` fades **in** (`starting:open:opacity-0` + `transition-opacity duration-200`) but closes
**instantly**: when `[open]` is removed the UA sets `display: none` and, with no discrete transition, there is
nothing to animate. Enter and exit are asymmetric in the wrong way (a fade in, then a pop out), and the full-screen
`backdrop-blur-xl` vanishes in a single frame.

```astro
<!-- src/components/ui/ImageLightbox.astro:19-23 — current -->
<dialog
  data-lightbox
  aria-label={t.projects.lightboxLabel()}
  class="m-0 size-full max-h-none max-w-none overflow-hidden bg-[rgba(4,6,12,0.96)] p-0 text-white opacity-100 backdrop-blur-xl backdrop:bg-transparent open:flex starting:open:opacity-0 transition-opacity duration-200"
>
```

```ts
// src/components/ui/ImageLightbox.astro:122-130 — current
    dialog.addEventListener("close", () => {
      html.removeAttribute("data-lightbox-active");
      // El carrusel de la tarjeta se queda en la última imagen vista y el foco vuelve a su botón.
      group?.dispatchEvent(new CustomEvent("carousel-goto", { detail: index }));
      const buttons = group ? [...group.querySelectorAll<HTMLElement>("[data-lightbox-open]")] : [];
      (buttons[index] ?? opener)?.focus({ preventScroll: true });
      group = opener = null;
      image.removeAttribute("src");
    });
```

Note the last line: `image.removeAttribute("src")` runs immediately on close. If the dialog fades out, the image would
vanish first and leave an empty dark panel fading — so that line must be deferred.

## Target

The dialog is `opacity: 0` whenever it is not open, `1` when open, with `opacity`, `display` and `overlay`
transitioned (discrete behaviour) so the closing dialog stays rendered and in the top layer for the 200 ms fade.
Same duration (200 ms, inside the 200–500 ms modal budget) and the repo's strong ease-out.

```astro
class="m-0 size-full max-h-none max-w-none overflow-hidden bg-[rgba(4,6,12,0.96)] p-0 text-white opacity-0 backdrop-blur-xl backdrop:bg-transparent open:flex open:opacity-100 starting:open:opacity-0 [&:not([open])]:pointer-events-none transition-[opacity,display,overlay] transition-discrete duration-200 ease-out"
```

```ts
    dialog.addEventListener("close", () => {
      html.removeAttribute("data-lightbox-active");
      group?.dispatchEvent(new CustomEvent("carousel-goto", { detail: index }));
      const buttons = group ? [...group.querySelectorAll<HTMLElement>("[data-lightbox-open]")] : [];
      (buttons[index] ?? opener)?.focus({ preventScroll: true });
      group = opener = null;
      // La imagen se vacía cuando acaba el fundido de salida (200 ms), salvo que se haya vuelto a abrir.
      window.setTimeout(() => {
        if (!dialog.open) image.removeAttribute("src");
      }, 200);
    });
```

Browser support for `transition-behavior: allow-discrete` / `overlay`: Chrome 117+, Safari 17.4+, Firefox 129+. Older
browsers simply keep today's instant close (graceful degradation) — no polyfill.

## Repo conventions to follow

- `starting:` variant already used on this element; keep it.
- `ease-out` utility resolves to the strong curve `cubic-bezier(0.23, 1, 0.32, 1)` (`global.css:59`).
- Scroll lock (`<html data-lightbox-active>`) is released immediately on close on purpose (page should be scrollable as soon as the user dismisses). Keep that.
- Comments in Spanish.

## Steps

1. Replace the `class` string of `<dialog data-lightbox>` (line 22) with the target string above. Verify Tailwind v4 generates `transition-discrete` (it sets `transition-behavior: allow-discrete`); if the utility is missing in this Tailwind version, use `[transition-behavior:allow-discrete]` instead.
2. In the `close` listener, replace `image.removeAttribute("src");` with the deferred version above.
3. Do not change `open()` — it calls `dialog.showModal()` and `close.focus()` as before.

## Boundaries

- Do NOT add an image-swap animation for prev/next here (separate idea, see README "missed opportunities").
- Do NOT change the console dialog (`ConsoleDialog.astro`): it is opened by a keyboard shortcut and must stay instant.
- Do NOT change `ProjectCarousel.astro`, markup or ids.
- If the class string differs from the "current" excerpt, STOP and report.

## Verification

- **Mechanical**: `pnpm check`, `pnpm test` (`ImageLightbox.test.ts` must pass), `pnpm lint`.
- **Feel check** (needs a real browser, Chrome 117+):
  - click a project screenshot: the lightbox fades in; press Esc / click the backdrop / click ×: it now fades out over ~200 ms instead of vanishing, the image stays visible during the fade (no empty dark panel);
  - open and close it ten times fast: it never gets stuck half-visible and never leaves `opacity: 0` blocking clicks on the page (`pointer-events-none` while closed);
  - after closing, Tab/focus returns to the thumbnail button as before;
  - DevTools → Animations at 10%: the fade-out uses the strong ease-out (fast start);
  - `prefers-reduced-motion: reduce`: closes instantly (global reduced-motion rule makes the transition ~0 ms).
- **Done when**: closing the lightbox fades for ~200 ms in Chrome, and the carousel/focus/scroll-lock behaviour is unchanged.
