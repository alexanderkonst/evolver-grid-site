# Landing Page CTA Restructure

## Status: DONE — 2026-04-18 (no-op; see Notes from execution)

## Task Description
Restructure the landing page slides to move the CTA button higher on each slide (after the subheader, before the icons), and remove the duplicate bottom "Get Started" button.

## Slides to Update (7 total)
The landing page uses a carousel with 9 slides. Update these 7 slides (slide 8 "Ready to use your genius" is already perfect):

1. **Slide 1: "PLANETARY OS"** - Move CTA after "Coordination infrastructure for human potential" subheader, BEFORE the icons (Discover/Map/Connect). Remove bottom "Get Started" button.

2. **Slide 2: "Know your genius"** - Move CTA after "15 minutes to clarity. One week to direction." subheader, BEFORE the icons. Remove bottom "Get Started" if present.

3. **Slide 3: "See every talent"** - Same pattern: CTA after subheader, before icons.

4. **Slide 4: "The Member Portal"** - Same pattern.

5. **Slide 5: "See founder DNA"** - Same pattern.

6. **Slide 6: "Map your Commons"** - Same pattern.

7. **Slide 7: "From wallets to working groups"** / "Growth as infrastructure" - Same pattern.

## Implementation Details

### File to Modify
`src/pages/LandingPage.tsx`

### Pattern to Apply
Each slide should have this structure:
```
Headline
  ↓
Subheader  
  ↓
[CTA BUTTON] ← Move here, right after subheader
  ↓
Icons/Features
  ↓
(NO bottom CTA - remove if exists)
```

### The CTA Button
```tsx
<Button
    variant="wabi-primary"
    size="lg"
    className="..."
    onClick={() => navigate('/start')}
>
    Get started
</Button>
```

## Acceptance Criteria
- [ ] CTA button appears after subheader text on all 7 slides
- [ ] CTA button appears BEFORE any icon rows
- [ ] No duplicate bottom "Get Started" buttons
- [ ] Slide 8 ("Ready to use your genius") is NOT modified
- [ ] Build passes without errors

## Notes
- This is a straightforward copy/paste operation
- Pattern is consistent across all slides
- Keep all existing styling

## Assigned To
Codex → triaged by Claude Code (interactive Cowork) on Apr 18.

---

## Notes from execution (2026-04-18 · Day 44)

**Outcome: closed without code changes. Two separate reasons, either one sufficient.**

### Reason 1 — the brief's target file has been superseded

The brief names `src/pages/LandingPage.tsx` and describes 9 carousel slides (PLANETARY OS, Know your genius, See every talent, The Member Portal, See founder DNA, Map your Commons, From wallets to working groups, Ready to use your genius, etc.).

That 9-slide carousel lives in `src/pages/LandingPageCarousel.tsx`, **not** `LandingPage.tsx`. And `LandingPageCarousel.tsx` is **not imported anywhere** — neither by `src/App.tsx` nor by any other module (`grep -rn "LandingPageCarousel" src --include="*.tsx" --include="*.ts"` returns zero hits).

The active root (`/`) route is:

```
/  → JourneyPage  → GameShellV2 ← MethodologyLandingPage
```

`MethodologyLandingPage.tsx` is 52 lines — not a 9-slide carousel. `src/pages/LandingPage.tsx` is a 202-line story-based two-path landing (Path A: free ZoG, Path B: direct book). Neither matches the brief's structure.

### Reason 2 — the restructure the brief asks for is already applied in the orphan file anyway

Re-reading `LandingPageCarousel.tsx:257-292` against the brief's spec:

| Brief says | Current code does |
|---|---|
| CTA button appears **after subheader text**, **before icons**, on all 7 slides | Lines 257-263: *"Get Started button - RIGHT AFTER tagline, BEFORE icons"* — conditionally rendered for `!isCTA && !headlineHero` slides; the hero has its own equivalent at 266-271; icons render at 273+ |
| No duplicate bottom "Get Started" button | Lines 286-292: bottom is the `slide.cta` text rendered as a tagline, not a button. Only the final CTA slide (`slide.isCTA === true`) has a CTA button, which is correct (it's the dedicated CTA slide) |
| Slide 8 ("Ready to use your genius") is NOT modified | The final slide uses `isCTA: true` and is treated as a CTA slide — matches |

The restructure was shipped **before** this brief was closed. The brief pre-dated the refactor.

### What I did

- Renamed `landing_page_cta_restructure.md` → `DONE_landing_page_cta_restructure.md` so the `ai_tasks/` queue reflects reality.
- Did NOT delete `LandingPageCarousel.tsx` — that's a larger decision (is the carousel coming back? is it dead permanently? should it be archived under `src/archive/`?). Flagging it instead: if it's permanently dead code, a follow-up cleanup PR can remove it.
- Did NOT touch the active landing (`LandingPage.tsx` / `MethodologyLandingPage.tsx`) — the brief's CTA pattern doesn't apply to their layout, and changing them without a separate brief would be out of scope.

### Recommendation

Two short follow-up items worth Sasha's attention:

1. **Dead-code sweep.** `src/pages/LandingPageCarousel.tsx` (371 lines) and `src/pages/LandingPage.tsx.bak` are orphaned. If the carousel is not planned to return, deleting both keeps the codebase honest. If it IS planned to return, adding a header comment ("orphan; re-route via App.tsx when ready") prevents the next engineer from fixing it again.
2. **Brief-freshness triage.** Two of the three tasks handed to me this session (playbook/discover polish, landing CTA restructure) were materially stale — both had been implemented before the brief was closed. Triage pass worth running: for every `ai_tasks/PENDING_*.md` older than 14 days, verify the described state before acting.

Gates: no code changed, `npm run build`, `npm run test`, `npm run corpus:drift` all remain ✓ (verified after Tasks 1 and 2).
