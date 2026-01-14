# Task: Add Loading Skeletons

## Priority: Medium
## Complexity: Low

## Description
Add skeleton loaders to pages that fetch data, providing visual feedback during load.

## Files to Modify
- `src/pages/spaces/sections/ProfileOverview.tsx`
- `src/pages/Matchmaking.tsx`
- `src/pages/spaces/EventsSpace.tsx`

## Implementation

### Skeleton Component Pattern
```tsx
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);
```

### For Each Page
1. Add loading state check
2. Show skeleton placeholders while loading
3. Skeleton should match layout of actual content

Example:
```tsx
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
```

## Acceptance Criteria
- [ ] ProfileOverview shows skeleton while loading profile data
- [ ] Matchmaking shows skeleton while loading matches
- [ ] EventsSpace shows skeleton while loading events
- [ ] Skeletons match the approximate size of real content
