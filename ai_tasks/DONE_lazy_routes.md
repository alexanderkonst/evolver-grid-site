# Task: Lazy Load Routes

## Context
All routes load on initial bundle. Add code splitting with React.lazy().

## Files to Modify
- `src/App.tsx` — main router

## What to Build

1. Import lazy and Suspense:
```tsx
import { lazy, Suspense } from 'react';
```

2. Lazy load space pages:
```tsx
const ProfileSpace = lazy(() => import('./pages/spaces/ProfileSpace'));
const TransformationSpace = lazy(() => import('./pages/spaces/TransformationSpace'));
const MarketplaceSpace = lazy(() => import('./pages/spaces/MarketplaceSpace'));
const TeamsSpace = lazy(() => import('./pages/spaces/TeamsSpace'));
const EventsSpace = lazy(() => import('./pages/spaces/EventsSpace'));
const CoopSpace = lazy(() => import('./pages/spaces/CoopSpace'));
```

3. Wrap routes in Suspense with fallback:
```tsx
<Suspense fallback={<PageLoader />}>
  <Routes>
    ...
  </Routes>
</Suspense>
```

4. Create simple PageLoader component:
```tsx
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-slate-900">
    <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
  </div>
);
```

## Success Criteria
- [ ] Space pages lazy loaded
- [ ] Suspense fallback shows during load
- [ ] Initial bundle size reduced
- [ ] Build passes
