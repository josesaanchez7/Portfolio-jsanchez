# Animation plans

Audit of the portfolio's motion, stamped at commit `815deb1`. Each plan is self-contained: hand it to any agent.
Verdict: the motion is already mostly right (strong custom easings, `transform`/`opacity` only, reduced motion
handled globally, reveal delays kept off hover). These are the remaining leverage points.

| # | Title | Severity | Category | Status |
| --- | --- | --- | --- | --- |
| 001 | [Scope the aurora hue transition to `.ambient`](001-scope-aurora-hue-transition.md) | MEDIUM | Performance | OBSOLETE (aurora removed in the monochrome redesign) |
| 002 | [Make the boot screen exit snappy](002-faster-boot-exit.md) | MEDIUM | Easing & duration | DONE (2026-11-07) |
| 003 | [Give the lightbox a matching exit](003-lightbox-exit-animation.md) | MEDIUM | Physicality / interruptibility | DONE (2026-11-07) |
| 004 | [Button sheen: no reverse sweep](004-button-sheen-no-reverse-sweep.md) | MEDIUM | Purpose / asymmetric timing | OBSOLETE (sheen removed in the monochrome redesign) |
| 005 | [Timeline: batch reads before writes](005-timeline-batch-reads-writes.md) | MEDIUM | Performance | DONE (2026-11-07) |

> 2026-11-07: the monochrome/minimal redesign removed the aurora, cursor glow, hero tilt/orbit, button sheen, spotlight and card lift. Plans 001 and 004 no longer apply; the "hover-lift cards" LOW item is also moot. 002, 003 and 005 are unaffected.

## Recommended order

1. **002** and **004** first: one-line changes, immediately perceptible, zero risk.
2. **005**: mechanical, behavior-identical.
3. **003**: needs a real browser feel-check (discrete transitions).
4. **001**: CSS reshuffle; verify with a Performance recording, not by eye.

## Dependencies

None between plans. They touch different files (001 → `global.css`, 002 → `BootScreen.astro` + `bootTimeline.ts`,
003 → `ImageLightbox.astro`, 004 → `Button.astro`, 005 → `Timeline.astro`), so they can run in parallel.
Note: the working tree has uncommitted edits to `Header.astro`, `ProjectCarousel.astro`, `ambient.ts` and `global.css`
(from the previous design pass). Plan 001 edits `global.css`; re-check line numbers against the file, not the stamp.

## Found but not planned (LOW)

- **Hover-lift cards are inconsistent**: `ProjectCard.astro:21`, `StudyCard.astro:17` (250 ms), `AboutSection.astro:24` (200 ms), `EducationPipeline.astro:77` (200 ms, 2 px instead of 3 px) all use `duration-*` with `ease-[ease]` for a *movement*; movement should use the strong `ease-out`. `ProjectCard` and `StudyCard` also lack `motion-reduce:hover:translate-y-0`, which `AboutSection` has. Fix: one shared constant (like `SPOTLIGHT` in `src/lib/spotlight.ts`), 200 ms, `ease-out`, with the reduced-motion guard.
- **Toast uses the default curve**: `Toast.astro:11` has `transition-[opacity,translate] duration-200` with no easing, so it gets Tailwind's `cubic-bezier(0.4,0,0.2,1)`; an entrance wants `ease-out`.
- **Stagger above the 30–80 ms band**: `ExperienceEntry.astro:21` uses `calc(var(--i)*90ms+250ms)`; `ProjectsSection.astro:30` uses `index * 90ms` (the rest of the site uses 70 ms).

## Missed opportunities (additive, not corrective)

1. **Lightbox image swap** (prev/next, arrow keys) replaces `image.src` with no transition. A 150 ms opacity crossfade would stop the teleport. Open-from-thumbnail (grow from the clicked screenshot) is the spatial version.
2. **ES ↔ EN switch** is a full navigation: content snaps. `@view-transition { navigation: auto; }` in `global.css` gives a free cross-document crossfade in Chrome/Safari; unsupported browsers keep today's behavior. Check the boot-screen/`sessionStorage` interplay before shipping.
3. **Case-study / console dialogs**: do NOT animate the console (`ConsoleDialog.astro`): it is a keyboard-summoned command palette (Ctrl/⌘ K), which should stay instant.

## Reviewed and left alone (by design)

Hover colour transitions with `ease`; the reveal system's wrapper trick that keeps stagger delays off card hover;
`tick-lock` resetting instantly on mouse-out (documented); per-minute clock digit animation; marquee `linear`;
cursor-glow/tilt inertia; hero float/orbit loops; boot screen shown once per session; the console having no animation.
