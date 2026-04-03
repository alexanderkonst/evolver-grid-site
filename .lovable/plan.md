
## Three-Tier Glassmorphism for Game Shell

### Design Concept
Three panels with increasing glass transparency, all floating over the shared `gradient.jpg` background:

| Panel | Role | Glass Treatment |
|-------|------|----------------|
| **Panel 1 (SpacesRail)** | Deepest, most opaque | `liquid-glass` + `bg-black/30` — darkest tint, subtle blur |
| **Panel 2 (SectionsPanel)** | Mid-depth | `liquid-glass` + `bg-white/5` — lighter than P1, more see-through |
| **Panel 3 (Content)** | Lightest, most transparent | `bg-white/10 backdrop-blur-xl` — frosted glass, content readable but background visible |

### Panel 3 Content Area Changes
- Remove `bg-white/90` (currently opaque white, kills the effect)
- Replace with `bg-white/10 backdrop-blur-xl` — frosted glass that lets the gradient show through
- Text shifts to white-on-dark: headings `text-white`, body `text-white/80`, secondary `text-white/50`

### Content Elements on Panel 3 (Product Builder page as example)
- Cards/sections: apply `liquid-glass-strong` + `rounded-2xl`
- CTA buttons: already purple, keep but add `shadow-[0_0_30px_rgba(139,92,246,0.3)]` glow
- Checkmarks/badges: keep green, they pop on dark glass
- Text inside cards: `text-white`, `text-white/80`

### Files to Edit
1. **GameShellV2.tsx** — Panel 3 background: `bg-white/90` → `bg-white/10 backdrop-blur-xl`
2. **SpacesRail.tsx** — Add `bg-black/30` to deepen the glass
3. **Product Builder page** — Apply glass classes to cards and content elements
4. **Any other content pages** that render inside Panel 3 would need similar treatment over time

### Harmony Rule
P1 darkest → P2 medium → P3 lightest creates a left-to-right depth gradient, all unified by the same background image bleeding through at different intensities.
