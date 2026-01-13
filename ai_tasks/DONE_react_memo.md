# Task: Add React.memo to Heavy Components

## Context
Some components re-render unnecessarily. Add React.memo for performance.

## Files to Modify
Look for components that:
- Render lists of items
- Have expensive render logic
- Are children of frequently-updating parents

## What to Build

1. Identify heavy components:
- EventCard
- ProfileCard / MatchCard
- Asset items
- Navigation components (SpacesRail, SectionsPanel)

2. Wrap with React.memo:
```tsx
const EventCard = React.memo(({ event }: EventCardProps) => {
  // existing code
});
```

3. For components with object props, add custom comparison:
```tsx
const EventCard = React.memo(
  ({ event }: EventCardProps) => { ... },
  (prevProps, nextProps) => prevProps.event.id === nextProps.event.id
);
```

4. Use useCallback for handlers passed to memoized children

## Success Criteria
- [ ] Heavy components identified
- [ ] React.memo applied
- [ ] No unnecessary re-renders
- [ ] Build passes
