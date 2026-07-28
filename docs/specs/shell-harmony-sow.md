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

### WP5 — Physical plane joinery

#### Design thesis

The shell should read as three precision-made planes held together by quiet,
credible joinery. The reference is Japanese cabinetry crossed with a premium
camera body: exact seams, recessed pivots, satin metal, and controlled movement.
The hardware explains how the planes relate and move; it is never ornament added
afterward.

#### Recommended direction

Use **recessed architectural pivots** between Pane 1 and Pane 2, plus a subtler
**concealed linear rail** between Pane 2 and Pane 3.

- Pane 1 ↔ Pane 2: two small recessed pivot points at approximately 24% and 76%
  of the usable shell height. They imply that Pane 2 is physically articulated
  from the lapis spine.
- Pane 2 ↔ Pane 3: a near-invisible vertical datum with a slim connector visible
  mainly during opening and closing. It should feel like a concealed drawer
  slide, not another decorative hinge.
- At rest, the joins nearly disappear into the shell. During movement, reflected
  light briefly reveals how the mechanism works.

#### Visual construction

- **Metal:** aged satin brass, never polished yellow gold.
  - base: `#A98535`
  - warm highlight: `#D6BE78`
  - recessed edge: `#5A4219`
- **Occlusion:** a 1–2px warm-black shadow gap using approximately
  `rgba(2, 7, 20, 0.55)`.
- **Pivot size:** 5–7px visible core inside a 12–16px recessed well.
- **Connector:** 1px metal line with no more than 2–3px perceived depth.
- **Finish:** very low specularity, with one restrained highlight. No glow
  except the reflected light produced while the planes move.

#### Interaction choreography

- Rest: hardware at 18–24% visual prominence.
- Hover or keyboard focus on the adjacent pane control: 38–46%.
- Pane transition: connector rises briefly to 55–62%, with a 180–240ms
  directional specular sweep synchronized to the existing pane animation.
- Settled state: hardware returns to its quiet resting prominence within 120ms.
- `prefers-reduced-motion`: no sweep; the join changes opacity once and remains
  spatially stable.
- Hardware remains decorative and receives no pointer events. Existing pane
  controls retain their full accessible hit areas and labels.

#### Responsive treatment

- Desktop expanded shell: full two-pivot and concealed-rail system.
- Desktop compact state: retain the shadow gap and one quiet central datum;
  suppress secondary connector detail.
- Tablet: simplify to one recessed pivot per seam.
- Mobile: show only the material seam and occlusion shadow. Literal hardware
  would consume scarce space and become visual noise.

#### Implementation shape

- Build the mechanism as a reusable decorative `PlaneJoint` layer in
  `GameShellV2.tsx`, or an equivalent isolated component colocated with the
  shell.
- Use CSS gradients and inline SVG geometry. No new raster image is required.
- Derive visual state from the existing `railMinimized` and
  `sectionsPanelOpen` states; do not create a parallel state machine.
- Keep the layer `aria-hidden="true"` and `pointer-events: none`.
- Ship first only for the canonical Lapis/Aurora shell. Other skins receive the
  existing neutral seam until explicitly art-directed.

#### Guardrails

- No exposed screws, gears, chains, rivets, clasps, leather, sparks, runes, or
  ornamental brackets.
- No thick beveled chrome, steampunk bronze, fantasy-door hinges, or game-like
  inventory framing.
- No sound effects or perpetual animation.
- No hardware element may compete with the active space, current journey step,
  or Pane 3 content.

#### Design variants to prototype

1. **Japanese Cabinetry — recommended:** two quiet inset pins and a dark shadow
   joint; warmest and least technological.
2. **Precision Camera:** one slim machined spine with tiny indexed details;
   sharper and more contemporary, but easier to over-design.
3. **Architectural Brass:** delicate recessed plates at the two pivot points;
   physically clearest, but risks becoming decorative.

Prototype all three at identical scale, then use Variant 1 with only the
controlled motion language of Variant 2.

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
- [ ] Plane transitions remain visually smooth at 60fps on a representative
      laptop viewport.
- [ ] Joinery causes no layout shift and does not change pane widths.
- [ ] Hardware is legible at 1440×900 without being a focal point.
- [ ] At 390×844, no literal hardware crowds the compact navigation.
- [ ] A three-second first-impression check reads as “crafted interface,” not
      “fantasy game,” “steampunk,” or “decorative UI.”
- [ ] The mechanism visually clarifies which planes are connected and which
      plane is moving.

## Explicit non-scope

- Pane 3 redesign.
- Funnel copy changes.
- Completion data-model changes.
- Route, entitlement, or onboarding-gate changes.
- Reworking white-label aesthetics beyond compatibility.
- Full 3D, WebGL, sound design, or physics simulation.
- Physical joinery art direction for partner/white-label skins.
