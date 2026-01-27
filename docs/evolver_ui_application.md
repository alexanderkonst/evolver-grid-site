# Evolver Platform — UI Application
## UI Playbook Applied to Entire Project

> *"Every screen speaks the same language."*

---

## Document Purpose

This document applies the UI Playbook to the ENTIRE Evolver platform, establishing:
- Global visual rules (used everywhere)
- Project-wide components
- Platform conventions

**Hierarchy:**
```
UI Playbook (theory)
    ↓
Evolver UI Application (this file — platform-wide)
    ↓
Module-specific UI (onboarding, game, etc.)
    ↓
Screen-specific UI (individual pages)
```

---

# Part I: Global Visual Rules

## Color System (From Brandbook)

### Primary Palette

| Token | Name | HEX | Usage |
|-------|------|-----|-------|
| `--color-primary` | Electric Violet | `#8460ea` | CTAs, highlights, emphasis |
| `--color-primary-dark` | Deep Indigo | `#2c3150` | Text on light, contrast |
| `--color-primary-light` | Lavender | `#a4a3d0` | Backgrounds, subtle accents |

### Neutrals

| Token | Name | HEX | Usage |
|-------|------|-----|-------|
| `--color-bg-dark` | Deep Navy | `#1e4374` | Dark mode background |
| `--color-bg-light` | Pearl | `#e7e9e5` | Light mode background |
| `--color-text-dark` | Charcoal | `#2c3150` | Text on light bg |
| `--color-text-light` | Pearl | `#e7e9e5` | Text on dark bg |

### Semantic Colors

| Token | Color | Usage |
|-------|-------|-------|
| `--color-success` | Pale Sage `#b1c9b6` | Success states |
| `--color-warning` | Champagne `#cec9b0` | Warning states |
| `--color-error` | Blush Pink `#cea4ae` | Error states |

---

## Typography

### Font Stack

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Cal Sans', 'Inter', sans-serif;  /* For archetypes, hero text */
--font-mono: 'JetBrains Mono', monospace;  /* For quotes, sacred text */
```

### Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-h1` | 2.5rem (40px) | 700 | Page titles |
| `--text-h2` | 1.875rem (30px) | 600 | Section headers |
| `--text-h3` | 1.5rem (24px) | 600 | Card headers |
| `--text-body` | 1rem (16px) | 400 | Body text |
| `--text-small` | 0.875rem (14px) | 400 | Captions, helper text |
| `--text-xs` | 0.75rem (12px) | 400 | Labels, badges |

---

## Spacing

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight internal spacing |
| `--space-2` | 8px | Compact spacing |
| `--space-3` | 12px | Standard internal |
| `--space-4` | 16px | Default spacing |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large gaps |
| `--space-12` | 48px | Section breaks |
| `--space-16` | 64px | Page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Inputs, small elements |
| `--radius-md` | 8px | Cards, buttons |
| `--radius-lg` | 12px | Modals, panels |
| `--radius-xl` | 16px | Hero cards |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-glow` | `0 0 20px var(--color-primary)` | Hero elements |

---

# Part II: Global Components

## Buttons

### Primary Button
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all 150ms;
}
.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}
```

### Button Variants
| Variant | Usage |
|---------|-------|
| `btn-primary` | Main CTAs |
| `btn-secondary` | Secondary actions |
| `btn-ghost` | Tertiary, navigation |
| `btn-danger` | Destructive actions |

---

## Cards

### Standard Card
```css
.card {
  background: var(--color-bg-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}
```

### Card Variants
| Variant | Usage |
|---------|-------|
| `card-default` | Standard content |
| `card-interactive` | Clickable cards (hover state) |
| `card-hero` | Featured content (glow effect) |
| `card-ghost` | Minimal, transparent bg |

---

## Form Elements

### Inputs
```css
.input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-primary-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-body);
}
.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(132, 96, 234, 0.1);
}
```

---

# Part III: Layout Patterns

## Responsive Breakpoints

| Token | Value | Description |
|-------|-------|-------------|
| `--bp-mobile` | 0-767px | Single column |
| `--bp-tablet` | 768-1023px | Two panels |
| `--bp-desktop` | 1024px+ | Full layout |

## Discord-Style Shell

```
Mobile:   [Panel 1 or 2 or 3]  ← swipe/toggle
Tablet:   [Panel 1] [Panel 2]
Desktop:  [Panel 1] [Panel 2] [Panel 3]
```

---

## Container Widths

| Context | Max Width |
|---------|-----------|
| Full bleed | 100% |
| Wide content | 1280px |
| Standard content | 1024px |
| Narrow content | 768px |
| Reading content | 640px |

---

# Part IV: Emotional Flow by Context

From Brandbook + UI Playbook Pillar 5:

| Screen Type | Mode | Colors | Energy |
|-------------|------|--------|--------|
| **Onboarding** | Light | Warm pastels | Welcoming, exciting |
| **Assessment** | Neutral | Calm, minimal | Focused, introspective |
| **Reveal/Celebration** | Either | Full gradient + glow | Celebration, validation |
| **Daily Loop** | Either | Branded, consistent | Motivated, clear |
| **Deep Work** | Dark | Minimal palette | Immersive, focused |
| **Business/Incubator** | Light | Clean, professional | Action, clarity |
| **Marketplace** | Light | Trust colors | Commercial, trustworthy |

---

# Part V: Motion Guidelines

## Animation Tokens

| Token | Duration | Easing |
|-------|----------|--------|
| `--anim-fast` | 100ms | ease-out |
| `--anim-normal` | 200ms | ease-in-out |
| `--anim-slow` | 300ms | ease-in-out |

## Standard Transitions

| Element | Animation |
|---------|-----------|
| Button hover | scale(1.02), 150ms |
| Button click | scale(0.98), 100ms |
| Page transition | fade + slide, 200ms |
| Modal open | fade in + scale, 200ms |
| Toast appear | slide in, 300ms |
| Success state | subtle pulse, 400ms |

---

# Part VI: Implementation Checklist

Before building any screen:

- [ ] Colors from this palette only (no magic hex values)
- [ ] Typography from defined scale
- [ ] Spacing uses tokens (no arbitrary values)
- [ ] Components use standard variants
- [ ] Responsive behavior defined
- [ ] Emotional flow matches context
- [ ] Motion follows guidelines

---

# Part VII: Related Documents

| Document | Purpose |
|----------|---------|
| [ui_playbook.md](./ui_playbook.md) | Theory + methodology |
| [brandbook.md](./brandbook.md) | Visual identity + palettes |
| [design_system.md](./design_system.md) | Technical implementation |

---

*Global rules. Local execution. One language.*
