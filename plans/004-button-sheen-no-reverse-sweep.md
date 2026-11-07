# 004 — Primary button sheen: sweep once on hover, reset instantly on leave

- **Status**: TODO
- **Commit**: 815deb1
- **Severity**: MEDIUM
- **Category**: Purpose & frequency / Interruptibility (asymmetric timing)
- **Estimated scope**: 1 file, 1 class string

## Problem

The primary button has a white highlight (`before:` pseudo-element) that sweeps left→right when the pointer enters.
It uses one symmetric transition for both directions, so when the pointer **leaves**, the highlight sweeps all the way
back right→left over 700 ms — a second, ghostly glint on a button the user is already moving away from. 700 ms is
also long for a hover effect on a control that appears many times (hero CTA and every project "Demo" button).

```astro
<!-- src/components/ui/Button.astro:31-32 — current (primary variant; ends of the string only matter) -->
  primary:
    "relative overflow-hidden border-transparent bg-accent px-5 text-accent-contrast shadow-[0_8px_24px_-10px_var(--accent)] hover:bg-accent-hover hover:text-accent-contrast hover:shadow-[0_10px_30px_-8px_var(--accent)] before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.4)_50%,transparent_70%)] before:transition-[translate] before:duration-700 before:ease-out before:content-[''] hover:before:translate-x-full motion-reduce:before:hidden",
```

## Target

Enter: the sweep plays once in 500 ms with the strong ease-out. Leave: no transition on the pseudo-element, so it
snaps back to its resting position (off to the left) invisibly — the highlight never replays backwards.
Implementation detail: the transition is declared only in the `:hover` state, so un-hovering uses `transition: none`.

Replace `before:transition-[translate] before:duration-700 before:ease-out` with
`before:transition-none hover:before:transition-[translate] hover:before:duration-500 hover:before:ease-out`
and keep everything else in the string byte-for-byte:

```
"relative overflow-hidden border-transparent bg-accent px-5 text-accent-contrast shadow-[0_8px_24px_-10px_var(--accent)] hover:bg-accent-hover hover:text-accent-contrast hover:shadow-[0_10px_30px_-8px_var(--accent)] before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.4)_50%,transparent_70%)] before:transition-none hover:before:transition-[translate] hover:before:duration-500 hover:before:ease-out before:content-[''] hover:before:translate-x-full motion-reduce:before:hidden"
```

## Repo conventions to follow

- Tailwind v4 gates `hover:` behind `@media (hover: hover)`, so touch devices never see the sweep — keep using the `hover:` variant (do not write a raw `:hover` rule).
- `ease-out` utility = strong curve (`global.css:59`).
- Button press feedback (`active:scale-[0.97]`, `BASE` in the same file, line 22-24) is correct; do not touch it.

## Steps

1. In `src/components/ui/Button.astro`, edit only the `primary` entry of `VARIANT` as shown above.
2. Leave `secondary`, `ghost` and `BASE` untouched.

## Boundaries

- Do NOT remove the sheen entirely (it is part of the established look).
- Do NOT touch `Button.test.ts` expectations unless a class assertion fails; if one does, update it to the new class names.
- Do NOT add JavaScript.

## Verification

- **Mechanical**: `pnpm check`, `pnpm test` (`Button.test.ts`), `pnpm lint`.
- **Feel check** (mouse, not touch):
  - hover the hero "Ver proyectos" button: one clean left→right sweep (~0.5 s);
  - move the pointer away: no backwards sweep, the button just returns to rest;
  - flick the pointer in and out five times fast: no flicker or half-sweeps left behind;
  - DevTools → Animations at 10% confirms only the entering direction animates.
  - `prefers-reduced-motion: reduce`: no sheen at all (`motion-reduce:before:hidden`, unchanged).
- **Done when**: leaving the button never replays the highlight.
