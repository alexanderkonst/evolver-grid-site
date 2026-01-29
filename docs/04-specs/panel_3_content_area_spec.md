# Panel 3: Content Area Design Spec

> **The lightest panel** — where transformation happens. Pearl/White base with wabi-sabi aesthetic.

---

## Design Philosophy

| Principle | Application |
|-----------|-------------|
| **Lightest in hierarchy** | Pearl (`#e7e9e5`) background, provides contrast to dark navigation |
| **Clarity over decoration** | White space → breathing room → focus |
| **Signal, not noise** | Every element carries meaning |
| **Transformation visible** | Gradients show Point A → Point B |

---

## Color Tokens (Panel 3 Only)

```css
/* Backgrounds */
--panel3-bg: #f0f4ff;                    /* Soft blue-white gradient start */
--panel3-bg-alt: #e8f0fe;                /* Mid-tone */
--panel3-bg-end: #f5f7fa;               /* Near-white end */

/* Surfaces (cards, containers) */
--card-bg: rgba(255, 255, 255, 0.85);    /* Glass effect */
--card-bg-solid: #ffffff;                /* Solid white */
--card-border: rgba(164, 163, 208, 0.2); /* Lavender tint */

/* Text */
--text-primary: #2c3150;                 /* Charcoal Indigo */
--text-secondary: rgba(44, 49, 80, 0.7); /* 70% charcoal */
--text-muted: rgba(44, 49, 80, 0.5);     /* 50% charcoal */

/* Accents */
--accent-primary: #8460ea;               /* Electric Violet - CTAs, highlights */
--accent-secondary: #6894d0;             /* Cornflower - links, secondary */
--accent-success: #b1c9b6;               /* Sage - completion, growth */
```

---

## Typography Rules

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page title (H1) | `font-display` (Cormorant Garamond) | 28-32px | 500 | `--text-primary` |
| Section header (H2) | `font-display` | 20-24px | 500 | `--text-primary` |
| Subsection (H3) | `font-sans` (DM Sans) | 16-18px | 600 | `--text-primary` |
| Body text | `font-sans` | 14-16px | 400 | `--text-secondary` |
| Muted/captions | `font-sans` | 12-14px | 400 | `--text-muted` |

### ❌ Never Use
- Pure `#000000` or `black`
- System default fonts
- Weights < 400 for body text

---

## Card Patterns

### Standard Content Card
```tsx
<PremiumCard variant="glass" className="p-6">
  <h2 className="font-display text-xl text-[#2c3150] mb-2">Title</h2>
  <p className="text-[#2c3150]/70">Description</p>
</PremiumCard>
```

### Action Card (Clickable)
```tsx
<PremiumCard 
  variant="glass" 
  className="p-6 cursor-pointer card-interactive"
>
  {/* Content */}
</PremiumCard>
```

### Hero Card (Results/Reveals)
```tsx
<PremiumCard 
  variant="glass-strong" 
  className="p-8 alive-card"
>
  <HeroIcon icon={Sparkles} size="lg" variant="gradient" />
  <h1 className="font-display text-2xl aurora-text">Revelation</h1>
</PremiumCard>
```

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Inline elements, icon gaps |
| `space-sm` | 8px | Tight grouping |
| `space-md` | 16px | Default padding, margins |
| `space-lg` | 24px | Section separators |
| `space-xl` | 32px | Major section breaks |
| `space-2xl` | 48px | Page-level breathing room |

### Card Padding
- **Small cards:** `p-4` (16px)
- **Standard cards:** `p-6` (24px)  
- **Hero cards:** `p-8` (32px)

---

## Component Examples

### Page Header Pattern
```tsx
<div className="mb-8">
  <div className="flex items-center gap-3 mb-2">
    <HeroIcon icon={UserIcon} size="md" variant="soft" />
    <h1 className="font-display text-2xl text-[#2c3150]">
      Zone of Genius
    </h1>
  </div>
  <p className="text-[#2c3150]/70">
    Your unique gifts and how the world experiences them.
  </p>
</div>
```

### Progress/XP Bar
```tsx
<div className="w-full h-2 rounded-full bg-[#a4a3d0]/20">
  <div 
    className="h-full rounded-full bg-gradient-to-r from-[#8460ea] to-[#6894d0]"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Action Button (Primary)
```tsx
<PremiumButton size="lg">
  Continue
</PremiumButton>
```

### Secondary Button
```tsx
<button className="px-4 py-2 text-[#8460ea] hover:bg-[#8460ea]/10 rounded-lg transition-colors">
  Learn More
</button>
```

---

## Emotional Flow States

| State | Treatment |
|-------|-----------|
| **Welcome/Entry** | Warm greeting, clear next step, `breathing-card` |
| **Assessment/Input** | Minimal UI, focus on task, calm palette |
| **Processing/Loading** | `PremiumLoader`, encouraging message |
| **Result/Reveal** | `alive-card`, celebration moment, `aurora-text` |
| **Daily Return** | Progress visible, clear "My Next Move" |

---

## Do's and Don'ts

### ✅ Do
- Use `PremiumCard` for all content containers
- Apply `font-display` to important headings
- Use `--text-primary` (`#2c3150`) for readable text
- Include breathing room (whitespace)
- Use gradients for transformation moments

### ❌ Don't
- Use pure black (`#000`) text
- Use bare `bg-white` without glassmorphism
- Add decorative elements without meaning
- Crowd the interface
- Use amber/orange (not in brandbook)

---

## CSS Classes Summary

| Class | Purpose |
|-------|---------|
| `PremiumCard` | Glassmorphic container |
| `PremiumButton` | Primary CTA with gradient |
| `HeroIcon` | Gradient icon treatment |
| `breathing-card` | Subtle alive animation |
| `alive-card` | Breathing + glow |
| `aurora-text` | Animated gradient text |
| `card-interactive` | Hover lift effect |
| `font-display` | Cormorant Garamond headings |
| `text-gradient-premium` | Static gradient text |

---

*Aligned with: brandbook.md, ui_playbook.md, design_system.md*
