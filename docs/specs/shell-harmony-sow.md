# Shell Harmony — Pane 1 + Pane 2

## Scope

Refine the expanded desktop shell so Pane 1 establishes identity and place,
Pane 2 contains the user's path through time, and Pane 3 remains the focus of
attention. The work applies to the canonical Aurora/Lapis experience while
preserving white-label skin overrides and compact/mobile behavior.

This is a reduction pass, not a visual reset. The celestial glyphs, lapis and
gold material language, spaciousness, Cormorant editorial voice, and illuminated
left-edge marker remain part of the product's identity.

## Consolidated design principles

1. **Pane 1 = place. Pane 2 = time. Pane 3 = attention.**
2. **Temporal minimalism:** show what is complete, what is present, and one
   meaningful next step. Distant future steps stay concealed until relevant.
3. **One signal per state:** selected = recessed surface + gold edge; completed
   = check + quiet type; locked = muted type; optional = subordinate child row.
4. **One light source:** illumination originates at the selected space and
   continues into the present step. Other elements receive ambient light only.
5. **One material family:** Pane 1 and Pane 2 read as different depths of the
   same lapis object, not navy beside gray glass.
6. **Mineral, not glass:** restrained grain and internal tone; minimal blur,
   almost no cast shadow, no collection of unrelated halos.
7. **Sacred language is scarce:** serif roman names meaning; italic is reserved
   for invitations; sans-serif carries status, price, and metadata.

## Work packages

### WP1 — Pane 1 composition

- Retain the wordmark size but tighten its vertical theatre.
- Preserve the brand / spaces / utilities / music score and gold hairlines.
- Remove the full active-chip ring and large halo.
- Retain a recessed blue active surface and the gold left-edge marker.
- Keep utility and music controls on the same icon axis as the spaces.
- Use a restrained lapis depth gradient rather than a flat navy fill.

### WP2 — Pane 2 material and hierarchy

- Replace smoky gray with a mineral navy gradient in the Pane 1 color family.
- Reduce corner radii from soft mobile pills to architectural chambers.
- Make the present step the only substantial illuminated chamber.
- Render completed steps as compact rows with a check and quiet strike.
- Render one next step as a low-contrast chamber.
- Conceal more distant future steps; reveal them as progress advances.
- Keep the paid Top Talent power-up nested beneath Step 1.
- Remove independent row halos; the present step alone carries directional
  illumination.

### WP3 — Interaction and accessibility

- Preserve direct-route orientation: an actively visited step is always visible.
- Preserve locked-step hints for the visible next step.
- Keep focus-visible states at WCAG-visible contrast.
- Remove concealed future steps from the tab order; the next available action
  remains named and keyboard-accessible.
- Respect reduced-motion settings and avoid adding new perpetual animation.
- Preserve current completion, routing, entitlement, and skin logic.

### WP4 — Verification

- Type-check and production-build.
- Verify default desktop at 1440px and compact/mobile at 390px.
- Verify `/`, mission, assets, QoL, auth, AI OS, and one white-label skin.
- Verify completed/current/next progression states and direct deep links.
- Verify keyboard focus, screen-reader names, and locked-step hints.

## Definitions of Done

### Visual

- [ ] Pane 1 and Pane 2 visibly belong to one lapis material family.
- [ ] Exactly one space and one journey step carry high-emphasis treatment.
- [ ] No active item combines a full ring, large halo, and gold marker.
- [ ] In JOURNEY, the visible hierarchy is completed history → present → one next
      step, with the power-up subordinate to Step 1.
- [ ] Distant future steps do not form a gray wall.
- [ ] Completed steps remain legible and unmistakably complete.
- [ ] Pane 1 retains intentional negative space.
- [ ] Utility and music glyphs share the spaces' left alignment axis.

### Functional

- [ ] Existing destinations and click behavior are unchanged.
- [ ] Directly visited journey routes remain visible even when outside the
      normal progressive window.
- [ ] Current completion and lock calculations are unchanged.
- [ ] White-label skins remain functional.
- [ ] Compact/mobile rails preserve their existing accessible hit regions and
      introduce no horizontal overflow.

### Quality

- [ ] `tsc` passes.
- [ ] Production build passes.
- [ ] No new console errors on the tested routes.
- [ ] Keyboard focus remains visible.
- [ ] Reduced-motion behavior is not regressed.

## Explicit non-scope

- Pane 3 redesign.
- Funnel copy changes.
- Completion data-model changes.
- Route, entitlement, or onboarding-gate changes.
- Reworking white-label aesthetics beyond compatibility.
