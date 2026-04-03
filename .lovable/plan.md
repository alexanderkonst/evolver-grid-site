

## Apply Glassmorphism to Game Shell

The game shell currently uses opaque dark blue gradients for its three panels (SpacesRail, SectionsPanel, content area) and a light gray outer background. The glassmorphism blueprint calls for translucent glass panels floating over a rich background — not flat panels on solid colors.

### Current State
- **SpacesRail** (Panel 1): Opaque `bg-gradient-to-b from-[#1e4374] via-[#1a2f4a] to-[#0e1f35]`
- **SectionsPanel** (Panel 2): Opaque `bg-gradient-to-b from-[#29549f]/95 via-[#1e4374]/90 to-[#1a2f4a]/95`
- **Content area** (Panel 3): Light gray `bg-gradient-to-br from-[#e7e9e5] via-[#dcdde2] to-[#e7e9e5]`
- **Outer shell**: Same light gray with faint bokeh radials
- **Glass CSS classes** already exist in `index.css` (`liquid-glass`, `liquid-glass-strong`)

### Plan

**Step 1 — Rich background layer in GameShellV2**

Replace the light gray shell background with a dark atmospheric background using the existing `gradient.jpg` (already used in the ZoG assessment layout) plus a dark overlay:

```
Fixed layer: gradient.jpg full-bleed + bg-[#0a0a1a]/60 overlay
```

This gives the glass panels something to blur against.

**Step 2 — SpacesRail → liquid-glass**

- Remove the opaque gradient background
- Apply `liquid-glass` class + `rounded-none` (it's edge-to-edge)
- Keep the dark border but switch to `border-white/10`
- All text stays white (already is) — adjust secondary text to `text-white/50` and `text-white/30`
- Active nav items: use `liquid-glass-strong` + `rounded-xl` instead of solid `bg-[#29549f]`
- Inactive items: `bg-white/5 hover:bg-white/10`
- Logo, user profile, settings — same white-on-glass treatment

**Step 3 — SectionsPanel → liquid-glass**

- Remove opaque gradient
- Apply `liquid-glass` class
- Border: `border-r border-white/10`
- Section items: active = `bg-white/15 text-white`, hover = `hover:bg-white/10`
- Sub-sections border: `border-white/10`
- Close button: `text-white/50 hover:text-white`

**Step 4 — Content area (Panel 3)**

- Make semi-transparent: `bg-white/5 backdrop-blur-sm` or keep transparent to let the background show through with a very subtle glass tint
- The content pages themselves already have their own backgrounds, so this panel mainly needs to not fight the glass aesthetic

**Step 5 — Mobile layout**

- Mobile header: apply `liquid-glass-strong` instead of opaque gradient
- Mobile navigation view: same glass treatment as desktop panels
- Mobile content back-bar: glass treatment

**Step 6 — Collapsed sidebar expand button**

- Currently solid `bg-[#29549f]` — switch to `liquid-glass` with `bg-white/5`

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/game/GameShellV2.tsx` | Dark background layer, glass content area, mobile header glass |
| `src/components/game/SpacesRail.tsx` | Replace opaque bg with `liquid-glass`, glass nav items |
| `src/components/game/SectionsPanel.tsx` | Replace opaque bg with `liquid-glass`, glass section items |

### What Won't Change
- The `liquid-glass` / `liquid-glass-strong` CSS in `index.css` — already correct
- Content pages inside the shell — they render their own backgrounds
- The `hideNavigation` onboarding view — keeps its current light style

