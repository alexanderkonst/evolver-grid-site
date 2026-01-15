# CODEX: Scroll Position Fix

## Priority: 🟢 LOW

## Goal
Ensure all pages open at top, not middle or bottom.

## Implementation Plan

### Add useEffect hook to problematic pages
```tsx
useEffect(() => {
  window.scrollTo(0, 0);
}, []);
```

### Pages to Check
Look for pages that:
1. Have long content
2. Navigate from scrolled position
3. Use React Router

### Common Culprits
- `SkillTrees.tsx`
- `GrowthPathsPage.tsx`
- Module detail pages

### Alternative: Router-level fix
In App.tsx or router config:
```tsx
<ScrollRestoration />
// or custom ScrollToTop component
```

### Files to Potentially Modify
1. `src/App.tsx` - add ScrollToTop
2. `src/components/ScrollToTop.tsx` [NEW]
3. Individual page files as needed

### Acceptance Criteria
- [ ] All pages start at top when navigated to
- [ ] Back navigation preserves scroll (if desired)
- [ ] No jarring scroll jumps

## Assignee: CODEX
