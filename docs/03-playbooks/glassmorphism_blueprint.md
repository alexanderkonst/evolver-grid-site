# Glassmorphism Design Blueprint — Apple iOS 26 "Liquid Glass"

> Copy/paste instruction for any AI agent when you want the liquid glass aesthetic applied to a page.

*Updated Day 47 (2026-04-21) to match Apple iOS 26 Liquid Glass from the App Store / Control Center. Previous spec (v1, Day 44) carried near-invisible 0.01 opacity panels with 4px blur — ghost glass, not Apple glass. This spec is anatomically accurate.*

---

## What Apple's Liquid Glass actually is

Five ingredients stacked in one material:

1. **Heavy backdrop blur + saturate boost** (24–30 px blur, 180–200 % saturate) → the content behind becomes soft AND the colors pop more than the raw source.
2. **Visible white tint** (10–18 % opacity) → the panel reads as a frosted material, not an invisible ghost.
3. **Asymmetric edge lighting** → crisp bright 1 px specular highlight on the **top** edge, subtle dark 1 px rim on the **bottom** edge. This is what makes the glass feel like it's catching light from above.
4. **Layered drop shadow** → a near shadow (8 px blur, close to the element) plus a far shadow (32+ px blur, pushed down) makes the material *float* rather than sit flat on the background.
5. **High border radius** → pills (9999 px) for capsules, 16–28 px for cards. Flat corners feel like Windows Vista, not iOS 26.

Rainbow/saturated backgrounds through glass is a feature, not a bug. The saturate boost is what prevents the glass from washing colors out — it brings the life of the backdrop INTO the material.

---

## The CSS (canonical)

Paste into your global stylesheet (in this repo, `src/index.css`):

```css
@layer components {
  /* LIGHT GLASS — cards, sections, pills, chips. */
  .liquid-glass {
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 0.5px solid rgba(255, 255, 255, 0.22);
    box-shadow:
      inset 0 1px 0 0 rgba(255, 255, 255, 0.55),    /* top specular highlight */
      inset 0 -0.5px 0 0 rgba(0, 0, 0, 0.08),        /* bottom rim shadow */
      0 4px 16px -4px rgba(0, 0, 0, 0.12),           /* near drop */
      0 20px 48px -20px rgba(0, 0, 0, 0.22);         /* far drop (floats) */
    position: relative;
    overflow: hidden;
  }
  .liquid-glass::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    /* Asymmetric edge light: bright at top, darkening toward bottom. */
    background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.60) 0%,
      rgba(255, 255, 255, 0.15) 30%,
      rgba(255, 255, 255, 0.00) 50%,
      rgba(0, 0, 0, 0.06) 70%,
      rgba(0, 0, 0, 0.12) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  /* STRONG GLASS — CTAs, prominent panels, pricing cards. */
  .liquid-glass-strong {
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(30px) saturate(200%);
    -webkit-backdrop-filter: blur(30px) saturate(200%);
    border: 0.5px solid rgba(255, 255, 255, 0.30);
    box-shadow:
      inset 0 1px 0 0 rgba(255, 255, 255, 0.70),
      inset 0 -1px 0 0 rgba(0, 0, 0, 0.10),
      0 6px 24px -4px rgba(0, 0, 0, 0.18),
      0 32px 64px -24px rgba(0, 0, 0, 0.32);
    position: relative;
    overflow: hidden;
  }
  .liquid-glass-strong::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.75) 0%,
      rgba(255, 255, 255, 0.25) 25%,
      rgba(255, 255, 255, 0.00) 50%,
      rgba(0, 0, 0, 0.08) 75%,
      rgba(0, 0, 0, 0.16) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
}
```

---

## The background layer

For glass to be glass, it needs something **interesting** behind it. Use one of:

- **Looping video** (Mux HLS is what this repo uses — see `GameShellV2.tsx` `MuxVideoBackground`).
- **Large atmospheric image** (gradient.jpg fallback).
- **Dark gradient** (`bg-gradient-to-br from-[#0f172a] to-[#1e293b]`).

Apply a **subtle wash** on top to tune the overall feel:

- **Light look** (what Day 47 uses): `bg-white/[0.18]` wash → Panel 3 reads as daylight, dark text is readable.
- **Dark look**: `bg-[#0a0a1a]/[0.45]` wash → Panel 3 reads as evening, white text is readable.

Content floats above this layer with `position: relative; z-index: 10`.

---

## Typography

**Pick ONE direction per page** — dark text on light glass, OR light text on dark glass. Don't mix.

### Light glass + dark text (recommended for the journey shell)

- Headlines: `color: #0a1628` (dark navy)
- Body: `color: rgba(26,30,58,0.78)`
- Muted: `color: rgba(26,30,58,0.6)`
- Soft white halo for legibility on varied video backdrop:
  `textShadow: "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)"`

### Dark glass + light text (use for "moody" moments — ZoG ritual loading legacy, night surfaces)

- Headlines: `text-white` or `text-white/95`
- Body: `text-white/80`
- Muted: `text-white/50`
- Optional colored glow: `textShadow: "0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(132,96,234,0.1)"`

### Serif for prose, sans for UI

- Hero prose: **Cormorant Garamond** semibold
- Body prose: **Source Serif 4** light
- UI / buttons / meta: **DM Sans** medium

### Neon gradient highlights on key phrases

When you want a word to POP without it looking washed-out:

```jsx
<span
  className="bg-clip-text text-transparent"
  style={{
    // Lightness 20–32% — DARK saturated ink. Anything 40%+ reads as pastel.
    backgroundImage:
      "linear-gradient(135deg, hsl(285, 90%, 30%) 0%, hsl(265, 95%, 24%) 50%, hsl(245, 90%, 28%) 100%)",
    // Drop-shadow handles the neon aura (in matching hue).
    filter:
      "drop-shadow(0 0 14px hsl(275 100% 55% / 0.55)) drop-shadow(0 0 3px hsl(260 100% 50% / 0.6))",
    // CRITICAL: override inherited text-shadow — prevents the "white core" bug
    // where the parent's white halo bleeds into the transparent-color gradient span.
    textShadow: "none",
  }}
>
  Top Talent
</span>
```

**The "white core" bug:** If the parent `<h1>` has a white text-shadow and the child span has `color: transparent` + `background-clip: text`, the parent's text-shadow renders *behind* the gradient-clipped glyphs and bleeds through letter interiors — making letters look white-centered. Fix: always set `textShadow: "none"` on the gradient span.

**Lightness matters:** 40–50% gradients = washed pastel rainbow ("too rainbowy"). Drop to 20–32 % for saturated ink. The neon feel comes from the `filter: drop-shadow` glow, not from the letter fill.

---

## Usage patterns

### Cards / panels / sections
```jsx
<article className="liquid-glass rounded-3xl p-6 sm:p-10">…</article>
```

### Pills / chips
```jsx
<button className="liquid-glass inline-flex items-center gap-2 py-1.5 px-3 rounded-full">…</button>
```

### CTA buttons
```jsx
<a className="liquid-glass-strong w-full flex items-center justify-between p-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300">…</a>
```

### Hover feedback
- Panels: `hover:scale-[1.02]`
- Buttons: `hover:scale-105`
- Click: `active:scale-95`

### Icon anchors inside glass
Small tinted-color circles:
```jsx
<div className="p-3 rounded-full shrink-0"
  style={{ backgroundColor: "rgba(132,96,234,0.15)" }}>
  <Bot className="w-5 h-5" style={{ color: "#5b21b6" }} />
</div>
```

---

## What makes it work

- **Heavy blur + saturate** is what separates Apple Liquid Glass from generic blurred panels. The saturate boost is non-negotiable — it's what makes the colors behind the glass feel *alive* rather than dampened.
- **Asymmetric edge lighting** (via the `::before` gradient) is what sells the 3D physicality. Uniform edges feel flat; asymmetry feels lit-from-above.
- **Two drop shadows** (near + far) is what makes the material float. A single shadow feels "printed on." Near shadow anchors, far shadow elevates.
- **Pick one direction** — light-or-dark text — per page. Mixing reads as unfinished.
- **Gradient darkness matters more than hue.** A 95% saturated pink at 60% lightness looks the same as a 95% saturated blue at 60% lightness — both wash out. Drop to 25–30% lightness and both become inks.
