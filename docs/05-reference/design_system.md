# Design System — Game of Life

> **Philosophy:** Minimal, professional, SaaS-like. Black/white with strategic color accents.

---

## Colors

### Core Palette

| Token | Value | Usage |
|-------|-------|-------|
| `bg-white` | `#ffffff` | Main content background |
| `bg-slate-50` | `#f8fafc` | Secondary backgrounds, cards |
| `bg-slate-900` | `#0f172a` | Sidebar, dark elements |
| `text-slate-900` | `#0f172a` | Primary text |
| `text-slate-600` | `#475569` | Secondary text |
| `text-slate-500` | `#64748b` | Muted text, descriptions |
| `text-slate-400` | `#94a3b8` | Placeholder text |

### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `bg-blue-500` | `#3b82f6` | Primary actions, selections |
| `text-blue-600` | `#2563eb` | Links, interactive elements |
| `bg-emerald-500` | `#10b981` | Success, completed states |
| `bg-amber-500` | `#f59e0b` | Warnings, attention |

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `border-slate-200` | `#e2e8f0` | Card borders, dividers |
| `border-slate-800` | `#1e293b` | Dark mode borders |

---

## Typography

### Font Family
- **Primary:** System font stack (Inter, Roboto, or system sans-serif)
- **Monospace:** For code, IDs

### Font Sizes

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Labels, badges, meta |
| `text-sm` | 14px | Body text, descriptions |
| `text-base` | 16px | Standard paragraphs |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Section titles |
| `text-2xl` | 24px | Page headings |
| `text-3xl` | 30px | Hero/main titles |

### Text Transforms

| Class | Usage |
|-------|-------|
| `uppercase tracking-wide` | Page titles (H1), hero headings |
| `uppercase tracking-wider text-xs` | Labels, meta captions (e.g., "MY ARCHETYPE") |
| (none) | Body text, subtitles, descriptions |

### Subtitle Contrast

> **Anti-pattern:** Never use `text-[#a4a3d0]` or `text-slate-400` on pearl/light backgrounds — unreadable.

| Context | Correct Color |
|---------|---------------|
| Subtitle on light/pearl bg | `text-[#2c3150]/70` (Charcoal Indigo @ 70%) |
| Subtitle on dark bg | `text-white/80` |
| Muted text on white bg | `text-slate-600` (not `text-slate-400`) |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Labels, subheadings |
| `font-bold` | 700 | Headings, CTAs |

---

## Spacing

### Base Unit: 4px

| Class | Value | Usage |
|-------|-------|-------|
| `p-2` | 8px | Tight padding (chips, badges) |
| `p-3` | 12px | Button padding |
| `p-4` | 16px | Card padding (compact) |
| `p-5` | 20px | Card padding (standard) |
| `p-6` | 24px | Section padding |
| `p-8` | 32px | Large section padding |

### Gap/Margin

| Class | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | Tight groupings |
| `gap-3` | 12px | Button groups |
| `gap-4` | 16px | Card grids |
| `gap-6` | 24px | Section spacing |

---

## Components

### Cards

```css
/* Standard Card */
.card {
  @apply rounded-xl border border-slate-200 bg-white p-5;
}

/* Selection Card (active) */
.card-selected {
  @apply rounded-xl bg-blue-500 text-white p-3;
}

/* Coming Soon Card */
.card-disabled {
  @apply rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 opacity-60;
}
```

### Buttons

```css
/* Primary */
.btn-primary {
  @apply bg-slate-900 text-white hover:bg-slate-800;
}

/* Secondary */
.btn-secondary {
  @apply border border-slate-200 bg-white text-slate-700 hover:bg-slate-50;
}

/* Ghost */
.btn-ghost {
  @apply text-slate-600 hover:text-slate-900 hover:bg-slate-100;
}
```

### Corner Radius

| Class | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Buttons, chips |
| `rounded-xl` | 12px | Cards, panels |
| `rounded-2xl` | 16px | Large cards |
| `rounded-3xl` | 24px | Hero sections |
| `rounded-full` | 50% | Avatars, badges |

---

## Mobile-First Breakpoints

| Prefix | Min Width | Usage |
|--------|-----------|-------|
| (none) | 0px | Mobile default |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |

### Mobile Patterns

```css
/* Grid: Stack on mobile, side-by-side on larger */
.responsive-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

/* Padding: Tighter on mobile */
.responsive-padding {
  @apply p-4 sm:p-6 lg:p-8;
}

/* Text: Smaller on mobile */
.responsive-heading {
  @apply text-xl sm:text-2xl lg:text-3xl;
}
```

---

## Sidebar (GameShell)

| Element | Desktop | Mobile |
|---------|---------|--------|
| Width | 256px fixed | 256px overlay |
| Visibility | Always visible | Hidden (hamburger) |
| Background | `bg-slate-900` | Same |
| Text | `text-slate-400` inactive, `text-white` active | Same |

---

## Z-Index Scale

| Class | Value | Usage |
|-------|-------|-------|
| `z-10` | 10 | Sticky headers |
| `z-30` | 30 | Mobile overlay |
| `z-40` | 40 | Sidebar |
| `z-50` | 50 | Modal/dialog backdrops |

---

## Do's and Don'ts

✅ **Do:**
- Use `slate` palette for utility/navigation elements
- Use `rounded-xl` for cards
- Stack layouts on mobile
- Keep touch targets ≥44px
- **Use gradients for hero moments** (see brandbook.md)
- **Use glassmorphism for premium cards**
- **Add micro-animations to interactive elements**

❌ **Don't:**
- Use pure black (`#000`)
- Make buttons smaller than 44px height on mobile
- Use gradients for utility elements (navigation, forms)
- Add decorative animations that don't guide attention

---

## Premium Tokens (Hero Moments)

For hero/transformational moments, apply brandbook aesthetics:

```css
/* Use these for Welcome, Results, Celebrations */
--gradient-transformation: linear-gradient(135deg, #8460ea 0%, #a4a3d0 25%, #a7cbd4 50%, #cec9b0 75%, #cea4ae 100%);
--glass-bg: rgba(255, 255, 255, 0.85);
--glass-blur: blur(20px);
--glass-border: 1px solid rgba(255, 255, 255, 0.3);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

See `brandbook.md` for full palette and guidelines.

