---
description: UI implementation standards and component patterns
---

# UI Skills

Use this skill when implementing UI components or reviewing code for visual consistency.

## Aesthetic Standard

**Wabi-sabi + Apple Industrial**: Imperfect beauty with premium precision.

## Color Tokens

- Primary: `#8460ea` (violet)
- Secondary: `#29549f` (deep blue)
- Text: `#2c3150` (dark slate)
- Muted: `#a4a3d0` (soft lavender)
- Background gradients: `from-[#c8b7d8] via-[#d4d1e8] to-[#e7e9f5]`

## Typography

- Headlines: `font-['Fraunces',serif]`
- Body: `font-['Inter',sans-serif]`

## Component Patterns

### Buttons

```tsx
// Primary (Magic Button)
<Button variant="wabi-primary" className="shadow-[0_0_20px_rgba(132,96,234,0.4)]">
  Discover My Genius
</Button>

// Ghost
<Button variant="wabi-ghost">Share</Button>
```

### Cards

```tsx
<div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
  {content}
</div>
```

### Gradient Headers

```tsx
<div className="text-center py-6 bg-gradient-to-br from-[#c8b7d8] via-[#d4d1e8] to-[#e7e9f5] rounded-2xl">
  <h1 className="text-2xl font-['Fraunces',serif] font-bold text-[#2c3150]">
    {title}
  </h1>
</div>
```

## Accessibility

- All buttons need unique IDs
- Use semantic HTML (`<nav>`, `<main>`, `<section>`)
- Ensure 4.5:1 contrast ratio
- No `outline-none` without focus alternative

## Source Document

Full specification: `docs/ui_skills.md`
