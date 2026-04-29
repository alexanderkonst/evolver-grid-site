## Problem

On `/ai-os` desktop, when the page lands the user cannot scroll the hero with mouse wheel or trackpad — only the "Start here" button moves the page. The "Start here" button works because it programmatically calls `scrollTo()` on `.ai-os-desktop-content-scroll`. Natural wheel scrolling fails because the cursor is hovering over the hero background, which is intercepting wheel events.

## Root Cause

The hero stack in `src/modules/ai-os/AiOsPage.tsx` renders these layers as siblings of `<main>`:

- `<video class="fixed inset-0 w-screen h-screen ...">` (line 2371) — desktop HLS background
- `<img class="fixed inset-0 w-screen h-screen ...">` (line 2706) — mobile/low-power poster
- `<div class="fixed inset-0 z-[1]" ...>` (line 2710) — gradient overlay
- `<div class="vignette-overlay z-[1]" />` (line 2711)

None of these have `pointer-events-none`. Because they use `position: fixed`, they escape the `.ai-os-desktop-content-scroll` ancestor. When the wheel fires on top of them, the browser walks up THEIR ancestor chain looking for a scrollable element — and finds none (the document itself is `overflow: hidden` per the app-shell). So the wheel event is dropped.

The starry overlay already has `pointer-events-none` (StarryBackground.tsx:77), which is why it doesn't block. The cursor-glow div also has it. The video, poster img, gradient, and vignette do not.

## Fix

Add `pointer-events-none` to all four decorative fixed background layers. They are all `aria-hidden="true"` decorations — they were never meant to receive pointer input. With pointer events disabled, wheel events fall through to `<main>` (z-10, inside the scroll container) and scroll behaves naturally.

### Files to change

`src/modules/ai-os/AiOsPage.tsx`

1. Line 2371 — `<video>` className: prepend `pointer-events-none`
2. Line 2706 — `<img>` className: prepend `pointer-events-none`
3. Line 2710 — gradient `<div>` className: prepend `pointer-events-none`
4. Line 2711 — `<div className="vignette-overlay z-[1]" />`: add `pointer-events-none`

Also verify `.vignette-overlay` and `.noise-overlay` rules in `src/index.css` don't re-enable pointer events; if they do, scope `pointer-events: none` on the elements via Tailwind class (which wins via utility specificity / inline order).

## Verification

After the change:
- Land on `/ai-os` desktop, immediately wheel/trackpad-scroll over the hero — pane 3 scrolls smoothly down to the next section
- "Start here" button continues to scroll to the next anchor as before
- Panes 1 and 2 remain visible at all scroll depths (no regression on the prior app-shell fix)
- Mobile `/ai-os` continues to scroll inside `.mobile-content-scroll` as before
- No visual change to the hero — overlays are decorative and unaffected by removing pointer interception

## Out of scope

No layout, color, or animation changes. No changes to GameShellV2 or the app-shell architecture established last round. This is a single targeted fix to four className strings.
