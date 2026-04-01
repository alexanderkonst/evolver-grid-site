# Glassmorphism Design Blueprint — Copy/Paste Instruction for Any AI Agent

> Give this instruction to any AI agent when you want the liquid glass aesthetic applied to a page.

---

## Instruction

Apply a **liquid glass morphism** aesthetic to this page. The design should feel like translucent glass panels floating over a rich background — not flat cards on white. Here's the exact recipe:

### Background Layer
Use a **full-bleed background** — either a looping video, a large atmospheric image, or a dark gradient (`bg-black` or `bg-gradient-to-b from-[#0f172a] to-[#1e293b]`). Add a **dark overlay** on top of it (`bg-black/45` or `bg-black/50`) to ensure text readability. All content floats above this layer with `position: relative; z-index: 10`.

### Glass Classes (CSS)
Define two tiers of glass in your CSS:

```css
/* Light glass — for cards, sections, pills */
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Strong glass — for CTAs, pricing panels, hero buttons */
.liquid-glass-strong {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.05),
              inset 0 1px 1px rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}
.liquid-glass-strong::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.2) 80%, rgba(255,255,255,0.5) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

### Usage Pattern
- **All text is white** on dark backgrounds. Hierarchy: `text-white` (headlines), `text-white/80` (body), `text-white/50` (secondary), `text-white/20` (hints)
- **Cards and sections**: Apply `liquid-glass` class + `rounded-xl` or `rounded-2xl` for soft corners
- **CTA buttons**: Apply `liquid-glass-strong` class + `rounded-full` or `rounded-xl`, add `ring-1 ring-white/20` and `shadow-[0_0_30px_rgba(255,255,255,0.1)]` for emphasis
- **Typography**: Use a clean sans-serif (Poppins) with a complementary serif (Source Serif 4) for body paragraphs. Headlines use serif-style weight differentiation — key phrases in full `text-white`, setup phrases in `text-white/60`
- **Hover states**: `hover:scale-[1.02]` for panels, `hover:scale-105` for buttons, `active:scale-95` for click feedback
- **Icon circles**: Small `w-6 h-6 rounded-full bg-white/10` circles containing icons for visual anchoring
- **Text glow on key headlines**: `text-shadow: 0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.1)`

### What Makes It Work
The `::before` pseudo-element creates a **luminous edge gradient** — a soft light-to-transparent border that makes the glass feel dimensional, not flat. The difference between `.liquid-glass` (4px blur, subtle) and `.liquid-glass-strong` (50px blur, heavy) creates depth hierarchy. The `inset box-shadow` adds an internal light rim. Together, these create the feeling of polished glass catching light.
