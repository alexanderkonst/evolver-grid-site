# Task: Add Spark CTA to Landing Hero

## Priority: High
## Complexity: Low

## Description
Add "Try in 60 seconds" link on the hero slide of the landing page, linking to `/spark`.

## File to Modify
- `src/pages/LandingPage.tsx`

## Implementation

Find the hero slide (slide index 0, `headlineHero: true`) and add below the "things" section:

```tsx
{currentSlide === 0 && (
  <button 
    onClick={() => navigate("/spark")}
    className="mt-6 text-sm text-[#29549f]/80 hover:text-[#29549f] transition-colors underline underline-offset-4"
  >
    Try in 60 seconds →
  </button>
)}
```

## Placement
After the three "things" (Discover, Map, Connect) and before navigation dots.

## Styling
- Subtle, not competing with main CTA
- Matches the pastel/wabi-sabi aesthetic
- Underline for link affordance

## Acceptance Criteria
- [ ] "Try in 60 seconds →" visible on hero slide
- [ ] Clicking navigates to /spark
- [ ] Styled subtly, not overwhelming
- [ ] Only shows on hero slide (index 0)
