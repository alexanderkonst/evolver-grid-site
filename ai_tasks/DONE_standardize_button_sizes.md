# Task: Standardize Button Sizes

## Priority: Medium
## Complexity: Low

## Description
Unify all buttons in Panel 3 components to consistent sizing and styling.

## Standard Button Specs
- Height: `h-12`
- Border radius: `rounded-xl`
- Padding: `px-6`
- Font: `font-semibold`

## Files to Audit
- All files in `src/pages/spaces/sections/`
- All files in `src/modules/`

## Implementation
Find all `<Button>` components and `<button>` elements in Panel 3 content areas.

Replace inconsistent sizing with:
```tsx
<Button className="h-12 rounded-xl px-6 font-semibold">
  Button Text
</Button>
```

## Exceptions
- Small inline buttons (like "Edit") can remain smaller
- Navigation buttons in headers can keep their current size

## Acceptance Criteria
- [ ] All primary action buttons are h-12
- [ ] All buttons use rounded-xl
- [ ] Consistent padding across buttons
- [ ] No mixed button sizes in same view
