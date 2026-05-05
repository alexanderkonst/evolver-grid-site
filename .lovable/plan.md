## Root cause (confirmed)

`RevelatoryHero` (the card behind the Save button) renders two decorative overlays:

```tsx
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,...)]" />
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,...)]" />
```

html2canvas 1.4.1 has a known bug parsing `radial-gradient(ellipse at <pos>, …)` without an explicit size keyword: under certain layouts (including the forced `width: 480px` we apply to the cloned card in `CardActions.onclone`) it computes a zero / NaN radius and calls `CanvasGradient.addColorStop(NaN, …)`, which throws the exact error in the screenshot. The Day 61 scrubber already strips `filter`, `backdrop-filter`, `animation`, `transition`, but does not touch `background-image`, so these gradients still reach the broken code path.

## Fix

Single, minimal change in **`src/components/sharing/CardActions.tsx`** inside the existing `onclone` callback: extend the injected `<style>` tag to neutralize problematic gradient backgrounds on decorative overlays in the cloned subtree only (live UI untouched).

Add a rule that targets absolutely-positioned `inset-0` decorative layers inside the captured card and removes their `background-image`. The gradient overlays are purely cosmetic — losing them in the captured PNG is acceptable (they add ~5% subtle highlight only); the underlying `from-white/70 via-[#fdf6e3]/80 to-white/60` linear gradient (which html2canvas handles fine) remains and provides the warm parchment tone.

Concretely, append to the existing scrubber stylesheet:

```css
/* Day 62: html2canvas v1.4.1 chokes on radial-gradient(ellipse at <pos>, …)
   with no explicit size keyword — produces NaN in addColorStop and aborts
   Save. Strip background-image on absolute-positioned decorative overlays
   in the cloned tree only. Live page untouched. */
[data-capture-token] [class*="bg-[radial-gradient"],
[data-capture-token] [class*="bg-[linear-gradient"] {
    background-image: none !important;
}
```

(The selector keys off the `data-capture-token` attribute already set on the live element during capture, so it scopes strictly to the captured subtree.)

## Verification

1. Reload `/zone-of-genius`, complete the quiz to the reveal screen.
2. Click **SAVE** on the result card.
3. Expected: PNG downloads to `~/Downloads`, "Saved to Downloads" toast appears, no destructive error toast.
4. Open the PNG: card content (logo, archetype, three talents, brand line, QR) is intact; only the very subtle white radial highlights at top/bottom-right of the card are absent.
5. Re-test the same flow on the AI lane reveal (`/zone-of-genius` AI path) — same RevelatoryHero, should also now save cleanly.

## Out of scope

- No changes to `RevelatoryHero.tsx` itself (live visuals preserved exactly).
- No changes to the PDF flow in `Step4GenerateSnapshot.tsx` (already isolated and working).
- No html2canvas upgrade (1.4.1 is the latest stable; the bug exists in all releases).
