# Landing Page CTA Restructure

## Status: PENDING

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
Codex
