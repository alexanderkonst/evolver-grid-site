# Task: Back Button Consistency

## Priority: Medium
## Complexity: Low

## Description
Audit and unify back button behavior across all pages.

## Files to Audit
All files in:
- `src/pages/`
- `src/pages/spaces/`
- `src/modules/`

## Standards
1. **Position**: Top-left of content area
2. **Navigation**: Use `navigate(-1)` for generic back, or explicit path when needed
3. **Styling**: Ghost variant, left arrow icon, "Back" text

## Pattern
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => navigate(-1)}
  className="text-slate-600 hover:text-slate-900"
>
  <ArrowLeft className="w-4 h-4 mr-2" />
  Back
</Button>
```

## Special Cases
- Pages with clear parent → navigate to parent (e.g., `/game/profile/assets` → `/game/profile`)
- Modal-like pages → use `navigate(-1)`

## Acceptance Criteria
- [ ] All pages have back button in top-left
- [ ] Consistent styling across pages
- [ ] Navigation behavior is predictable
