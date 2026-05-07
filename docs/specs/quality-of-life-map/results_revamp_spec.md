# Quality of Life Map — Results Revamp Spec

*Day 64 · May 7, 2026 · Sasha approved*
*Status: design + implementation plan*

---

## Why this revamp

The QoL module shipped in an earlier brand era. After Day 63's data-integrity ship (idempotent inserts, retake fresh-flag, schema fix removing `overall_score`), the **functional floor** is sound. The **visual + UX layer** still reads as a different product than the platform's cornerstone landing register.

Sasha's punch list from the Day 64 production-preview screenshots:

1. The Results page is barely legible (gold-on-cream + violet accents — not landing register)
2. Show ALL 8 domain results, not just lowest-3 / highest-3 split
3. Remove the **Priorities** page — unnecessary complication
4. Remove the **Growth Recipe** page — doesn't make sense in the simplified flow
5. Restore PDF download capability (currently failing)
6. Rethink the entire Results UI — keep it simple

Plus three additions to the proposal:
7. **ME-space integration** — Results becomes a return-able subpage under ME, alongside Top Talent
8. **Multi-snapshot tracking via downloaded PDFs** — each retake creates a new `qol_snapshots` row; the user downloads PDFs over time as their personal historical record
9. **Liquid-glass register** per `docs/03-playbooks/glassmorphism_blueprint.md` (Apple iOS 26 Liquid Glass) — matching landing/playbook surfaces

---

## Result page — new structure

Single page with two cards + action row, on `liquid-glass` light surface (per glassmorphism playbook):

```
┌─ GameShellV2 (pane 1 + pane 2 with QoL chip + content pane 3) ─┐
│                                                                  │
│  ┌──── Hero (.liquid-glass card) ─────────────────────┐         │
│  │   YOUR QUALITY OF LIFE  (eyebrow)                   │         │
│  │   2.0 / 10  (Cormorant 700 + halo)                  │         │
│  │   Now you know where to focus your growth.          │         │
│  │   [Radar chart — gold]                              │         │
│  └─────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌──── 8 Life Areas (.liquid-glass card) ─────────────┐         │
│  │   8 LIFE AREAS                                       │         │
│  │                                                       │         │
│  │   💪  Health                              1          │         │
│  │   😊  Happiness                           1          │         │
│  │   🌱  Growth                              1          │         │
│  │   💰  Wealth                              2          │         │
│  │   ❤️  Love & Relationships                3          │         │
│  │   🏠  Home                                3          │         │
│  │   🌍  Impact                              4          │         │
│  │   🤝  Social Ties                         5          │         │
│  └───────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌──── Action row ──────────────────────────────────┐           │
│  │   [↻ Retake]   [⬇ Download PDF]   [⌁ Share]      │           │
│  └──────────────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

Sort order: ascending (lowest first = where to grow). Reading top-to-bottom mirrors the natural narrative of the page subtitle ("focus your growth").

No special highlighting / "Growth" / "Strength" tags per row — let the numbers speak.

---

## Visual register — per `glassmorphism_blueprint.md`

### Cards
Use the `.liquid-glass` CSS class (already defined in `src/index.css` lines 25–60):

- `background: rgba(255, 255, 255, 0.10)` — 10% white tint
- `backdrop-filter: blur(24px) saturate(180%)` — frosted material with vivid backdrop colors
- Asymmetric edge lighting via `::before` (top bright, bottom dark)
- Layered drop shadow (near + far) — material floats
- `rounded-3xl` (24px+ border radius)

### Page background wash
Apply `bg-white/[0.18]` wash on the page container above the cinematic GameShellV2 background. This is the canonical "light look" from the playbook (lines 107–109).

### Typography (light glass + dark text — playbook lines 119–125)
- **Hero headline** (overall score): Cormorant Garamond 700, color `#0a1628` (dark navy), text-shadow halo cocktail:
  ```
  textShadow: "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)"
  ```
- **Eyebrow**: Cormorant Garamond 600, tracked-uppercase, color `#0a1628`, lighter weight
- **Body subhead**: Source Serif 4 italic, color `rgba(26,30,58,0.78)`
- **Domain row labels**: Source Serif 4 medium, color `rgba(26,30,58,0.85)`
- **Numeric scores**: DM Sans 600, color `#b8860b` (deep gold), `font-variant-numeric: tabular-nums`
- **UI/buttons**: DM Sans medium

### Accent palette
- Primary accent: deep gold `#b8860b` (radar fill, score numbers, focus tag if used)
- Eyebrows: dark navy `#0a1628` for legibility on light glass
- Muted text: `rgba(26,30,58,0.6)`

### Radar chart
- Stroke + fill: `#b8860b` at 32% opacity fill, full opacity stroke
- PolarGrid stroke: `rgba(184, 134, 11, 0.22)` (gold at low alpha)
- Tick labels: `rgba(11,42,90,0.7)` navy

### CTAs (action row)
- **Download PDF**: editorial gold pattern (skin-cta-* tokens — dark navy bg + gold halo + Cormorant tracked-uppercase + ✦ icon). Same pattern as `/ubb` GenericArtifactScreen primary CTA.
- **Retake**: secondary treatment — `liquid-glass` capsule with smaller weight
- **Share**: same as Retake — secondary

---

## Save / track-over-time

**Append-only `qol_snapshots`** (already in place):

- Each retake with different answers creates a new `qol_snapshots` row
- Idempotency check (Day 63): same answers as last save → no-op
- Retake fresh-flag (`?fresh=true`): ensures retake genuinely starts fresh

**PDF as comparison mechanism** (Sasha's call):

- User downloads a PDF after each meaningful retake
- PDF filename includes ISO date stamp: `quality-of-life-2026-05-07.pdf`
- User accumulates PDFs over time as their personal record
- No in-app "history view" or "compare snapshots" feature — keep simple
- The DB rows accumulate (visible to admin queries / future telemetry) but the user surface stays terminal

**Future enhancement (NOT this ship):** in-app history view showing radar chart over time, snapshots side-by-side, "growth over 6 months" view. Hold until users ask for it.

---

## Schema

**No migration needed.** Existing `qol_snapshots` schema is sufficient:
- 8 stage columns (1-10 SMALLINT)
- `xp_awarded` BOOLEAN
- standard `id` / `profile_id` / `created_at`

Day 64 code-side fix already shipped: removed the malformed `overall_score: overallAverage` from the INSERT (column doesn't exist in schema; was causing Postgres error 42703).

The `qol_priorities` array column on `game_profiles` becomes unused (priorities page removed). Leave the column — zero migration cost; future use possible.

---

## Routes

### Removed
- `/quality-of-life-map/priorities` → 404 (or redirect to `/quality-of-life-map/results`)
- `/quality-of-life-map/growth-recipe` → same

### Kept
- `/quality-of-life-map/assessment` — entry to take/retake (unchanged)
- `/quality-of-life-map/results` — post-assessment results page (revamped)

### Added
- `/game/me/quality-of-life` — ME-space subpage rendering Results component. Returnable surface for users to revisit their latest snapshot anytime from the ME space pane 2.

### Embedded routes (unchanged)
- `/game/learn/qol-assessment` — `TransformationQolAssessment` wrapper (still active)
- `/game/learn/qol-results` — `TransformationQolResults` wrapper (still active)

---

## ME-space integration

Add a SECOND top-level section to the ME space's pane 2 (alongside "My Top Talent"):

```typescript
{
    id: "qol-results",
    label: "My Quality of Life",
    path: "/game/me/quality-of-life",
    // No subsections — single landing surface
}
```

In `SectionsPanel.tsx` `grow` (ME) section, append after the existing `top-talent` block.

Click → user sees their latest QoL snapshot rendered via the same Results component.

---

## Files affected

| File | Change |
|---|---|
| `src/pages/QualityOfLifeMapResults.tsx` | Major rewrite: liquid-glass cards, single 8-domain list (replacing Growth/Strengths split), simplified action row, removed See-My-Profile, dark-navy text + halo cocktail per playbook |
| `src/pages/QualityOfLifePriorities.tsx` | Mark dead-code at top of file (route removed; component preserved for revert) |
| `src/pages/QualityOfLifeGrowthRecipe.tsx` | Same |
| `src/pages/QualityOfLifeMapAssessment.tsx` | Last-domain navigate target unchanged (still goes to `/quality-of-life-map/results`); no dependency on priorities |
| `src/App.tsx` | Remove `/quality-of-life-map/priorities` + `/quality-of-life-map/growth-recipe` routes; add `/game/me/quality-of-life` route |
| `src/components/game/SectionsPanel.tsx` | Add "My Quality of Life" entry to `grow` (ME) space sections |
| `src/components/game/GameShellV2.tsx` | Add `/game/me/quality-of-life` to journeyPaths or me-paths as appropriate (probably ME paths since it's a /game/me subpage) |
| `src/lib/onboardingRouting.ts` | Mark `buildQolPrioritiesPath`, `buildQolGrowthRecipePath`, `shouldUnlockAfterQol` as dead-code (preserve for revert) |

Estimated scope: ~200-300 lines net change. ~45 min focused work + verification.

---

## PDF download — fix approach

Current failure (after Day 64 hero conversion to inline-styled cream surface): html2canvas can't resolve `var(--skin-card-bg)` etc. CSS variables in the cloned tree.

**Fix:** in the existing `onclone` callback (which already strips backdrop-filter / filter / animations), also resolve CSS variables to computed values. Walk the cloned tree, for each element call `getComputedStyle` on the LIVE original to get resolved values, then set them as inline styles on the clone.

Pseudocode:
```typescript
onclone: (clonedDoc, clonedElement) => {
  // Existing: strip backdrop-filter / filter / animations on cloned tree
  // ...
  
  // New: resolve CSS vars to computed values on the snapshot subtree
  const liveRef = snapshotRef.current;
  if (liveRef) {
    const resolveVars = (live: Element, clone: Element) => {
      const computed = window.getComputedStyle(live);
      ['background', 'backgroundColor', 'color', 'borderColor', 'boxShadow'].forEach(prop => {
        (clone as HTMLElement).style.setProperty(prop, computed.getPropertyValue(prop));
      });
      // Recurse children
      for (let i = 0; i < live.children.length; i++) {
        if (clone.children[i]) resolveVars(live.children[i], clone.children[i]);
      }
    };
    resolveVars(liveRef, clonedElement);
  }
}
```

If this approach proves brittle (deeply nested CSS var inheritance, edge cases), fallback: render a separate `<QolSnapshot />` component (display: none until capture) using only explicit hex/rgba — bypass the var() issue entirely.

---

## Verification protocol

After ship, Sasha should:

1. **Refresh `/game/journey`** — chip 8 still locked (don't unlock yet — needs visual verification first)
2. **Direct URL `/quality-of-life-map/results`** (after taking assessment) — verify:
   - Cards render with liquid-glass treatment (frosted, blurred backdrop, asymmetric edge highlights)
   - All 8 domain rows visible, sorted ascending
   - Cormorant + dark-navy text + halo (legible against cinematic backdrop)
   - Radar chart in gold (no violet)
   - Download PDF button works → saves PDF with timestamp
   - Retake button works → assessment reloads with fresh state
3. **Open ME space** (click ME chip in pane 1) → confirm "My Quality of Life" appears in pane 2 sub-nav alongside "My Top Talent"
4. **Click "My Quality of Life"** → land on `/game/me/quality-of-life` → see Results page
5. **Try old routes**: `/quality-of-life-map/priorities` and `/quality-of-life-map/growth-recipe` → confirm 404 or redirect (whichever we ship)

Once all 5 pass visually, flip the chip in `SectionsPanel.tsx` `journey-qol-assess` from `locked: true` → `locked: false`. That's the unlock.

---

## Lessons applied from prior decisions

- **Append-only invariant** (D-2026-05-06-01) — Results.tsx idempotency check + INSERT pattern preserved
- **`successFired` two-phase save** (D-2026-05-05-08) — preserved from Day 63
- **Schema-correct INSERT** (Day 64 morning fix) — `overall_score` removed, INSERT now matches actual `qol_snapshots` schema
- **Visual coherence with landing** — liquid-glass + Cormorant + skin tokens + halo-deep cocktail per `ui_playbook.md` Part VIII (Master Legibility) and `glassmorphism_blueprint.md` (Apple iOS 26)

---

*Spec authored Day 64 (Sasha 2026-05-07). Implementation lands in the same session. Companion entries in `session_log.md` Day 64 + (post-ship) `decision_log.md` if any new architectural patterns surface.*
