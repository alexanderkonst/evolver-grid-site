## What I found

The top horizontal strip is real and reproducible on `/ignite` at the current 1088px preview width. It is not a browser chrome issue and not a console/runtime crash.

The likely cause is layout ownership conflict:

```text
GameShellV2 desktop main
  adds top padding / shell wash for normal routes
  wraps page in .page-transition-enter
    IgniteSession
      owns its own absolute HLS background + dark wash
```

There is already an attempted `/ignite` special-case, but it only fully handles the mobile content path. On desktop, `/ignite` is still treated as a normal non-page-owned route in key places, so shell-level chrome/wash can peek above the page-owned background as a redundant bar.

## Debugging strategy

1. Inspect the exact element stack at the strip
   - Use browser tooling at `/ignite` to identify what is painted at `y=0..25`.
   - Confirm whether the visible strip is coming from shell `<main>` padding/wash, shell background video, `#ignite-page`, or the page transition wrapper.

2. Fix ownership, not symptoms
   - Treat `/ignite` as a page-owned immersive route in `GameShellV2` for pane 3 background/padding decisions.
   - Do not change SpacesRail or SectionsPanel visual behavior unless testing shows that `pageOwnsBackground` would unintentionally restyle them.
   - Prefer a narrowly named flag, e.g. `pane3OwnsBackground`, instead of forcing `/ignite` into the AI OS-specific `pageOwnsBackground` path.

3. Make the Ignite page fill pane 3 from pixel 0
   - Ensure desktop `<main>` does not add `pt-4` for `/ignite`.
   - Ensure the pane-3 wash is skipped for `/ignite`.
   - Ensure `#ignite-page` and its absolute video/wash begin at the top of the content column.

4. Regression test the notorious cases
   - `/ignite` desktop: no top strip, content starts flush inside pane 3.
   - `/ignite` mobile: previous mobile strip fix remains intact.
   - `/game/journey` or `/`: shell still has expected pane behavior.
   - `/ai-os`: no regression to the special app-shell behavior.

## Files to change after approval

- `src/components/game/GameShellV2.tsx`
  - Refactor the current `/ignite` special-case into a pane-3 background ownership flag used consistently by desktop and mobile.
  - Keep navigation/rail semantics unchanged.

Potentially only if browser inspection proves it necessary:

- `src/pages/IgniteSession.tsx`
  - Tighten the root wrapper/background fill so its absolute background reliably covers the full pane from the first pixel.

## Definition of done

| # | Evidence | Status |
|---|---|---|
| 1 | `/ignite` screenshot at 1088px shows no redundant top horizontal strip | Pending implementation |
| 2 | Browser element stack confirms pane 3 is painted by Ignite background from top edge | Pending implementation |
| 3 | `/ignite` mobile still has no cream/top shell strip | Pending implementation |
| 4 | `/ai-os` and `/` shell behavior unchanged visually | Pending implementation |