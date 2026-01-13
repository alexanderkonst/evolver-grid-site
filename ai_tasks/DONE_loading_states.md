# Task: Add Loading States (Skeleton Loaders)

## Context
Many components load data asynchronously but don't show loading states, causing layout shifts and poor UX.

## Files to Modify
- `src/pages/spaces/ProfileSpace.tsx`
- `src/pages/spaces/TransformationSpace.tsx`
- `src/pages/ZoneOfGenius*.tsx` files
- `src/pages/QualityOfLife*.tsx` files

## What to Build

1. Create a reusable `SkeletonCard` component:
```tsx
// src/components/ui/SkeletonCard.tsx
const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-slate-700/50 rounded-xl", className)} />
);
```

2. Add loading states to data-fetching components:
```tsx
if (isLoading) {
  return <SkeletonCard className="h-32 w-full" />;
}
```

3. Use skeleton loaders for:
- Profile cards
- ZoG display sections
- QoL domain cards
- Event cards
- Connection cards

## Success Criteria
- [ ] SkeletonCard component created
- [ ] All major data-fetching components show skeleton while loading
- [ ] No layout shift when data loads
- [ ] Build passes
