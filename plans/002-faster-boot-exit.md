# 002 — Make the boot screen exit snappy (300 ms, strong ease-out)

- **Status**: DONE (2026-11-07)
- **Commit**: 815deb1
- **Severity**: MEDIUM
- **Category**: Easing & duration (+ interruptibility of a skip)
- **Estimated scope**: 2 files, 2 values

## Problem

The terminal-style boot screen can be skipped with a click, Enter, Escape or Space. Skipping calls `startExit()`,
which sets `data-exiting` and only removes the `inert` attribute from the page (`finish()`) after
`EXIT_DURATION_MS`. The exit uses a weak built-in `ease` and takes 500 ms, so a visitor who skips is still blocked
for half a second — the exact moment they are impatient — and the fade starts slowly because `ease` is weak.

```astro
<!-- src/components/boot/BootScreen.astro:22-23 — current -->
const ROOT =
  "fixed inset-0 z-[9999] hidden in-data-[boot]:flex cursor-pointer items-center justify-center overflow-hidden bg-boot-bg p-6 font-boot text-[15px] leading-[1.7] text-boot-text transition-[opacity,scale] duration-500 ease-[ease] [-webkit-tap-highlight-color:transparent] max-phone:text-[13px] data-exiting:pointer-events-none data-exiting:scale-[1.02] data-exiting:opacity-0";
```

```ts
// src/scripts/boot/bootTimeline.ts:9 — current
export const EXIT_DURATION_MS = 500;
```

(`BootScreen.astro:20-21` documents that the CSS duration must match `EXIT_DURATION_MS`.)

## Target

Exit is 300 ms and uses the repo's strong ease-out (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, which the
Tailwind `ease-out` utility resolves to because `global.css:59` overrides it). Scale-up to 1.02 and fade-out are
kept; they are the intended "dissolve toward you" effect.

```astro
transition-[opacity,scale] duration-300 ease-out
```

```ts
export const EXIT_DURATION_MS = 300;
```

## Repo conventions to follow

- `ease-out` utility = strong custom curve (see `Header.astro:36` `ease-out`, `SectionRail.astro:14` `ease-out`).
- The CSS duration and `EXIT_DURATION_MS` must stay equal (comment at `BootScreen.astro:20-21`); keep that comment accurate.

## Steps

1. In `src/components/boot/BootScreen.astro` line 23, inside the `ROOT` string, replace `duration-500 ease-[ease]` with `duration-300 ease-out`. Change nothing else in the string.
2. In `src/scripts/boot/bootTimeline.ts` line 9, change `500` to `300`.
3. Search for other places that assume 500 ms for the boot exit: `grep -rn "EXIT_DURATION_MS\|500" src/scripts/boot src/components/boot`. Only the two edits above should be needed; if a test pins 500, update that test to import `EXIT_DURATION_MS` instead of a literal.

## Boundaries

- Do NOT change the typing timeline, `endDelay`, or any boot copy.
- Do NOT change the skip button's own transition (`BootScreen.astro:80`, hover colour, `ease` is correct there).
- Do NOT change `scale-[1.02]`.
- If the line numbers drifted, STOP and report.

## Verification

- **Mechanical**: `pnpm check`, `pnpm test` (includes `bootTimeline.test.ts`), `pnpm lint`.
- **Feel check**: open the site in a new tab (boot shows once per session; clear `sessionStorage` key `boot-seen` to replay):
  - press Enter during the typing: the screen dissolves quickly and the page is clickable ~300 ms later, with no flash of the page before the dissolve ends;
  - let the boot finish on its own: the same exit plays;
  - DevTools → Animations at 10%: opacity starts dropping immediately (strong ease-out), no stall at the start.
  - `prefers-reduced-motion: reduce`: boot is not shown at all (unchanged).
- **Done when**: both values read 300 / `duration-300 ease-out` and skipping feels immediate.
