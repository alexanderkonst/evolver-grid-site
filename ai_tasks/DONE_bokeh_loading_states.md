# CODEX: Loading States with Bokeh Shimmer

## Priority: 🟢 LOW

## Goal
Create loading skeleton with bokeh shimmer effect for Wabi-sabi aesthetic.

## Implementation Plan

### Create BokehSkeleton Component
```tsx
// src/components/ui/bokeh-skeleton.tsx
const BokehSkeleton = ({ className }) => (
  <div className={cn(
    "animate-pulse bg-gradient-to-r from-[#e7e9e5] via-[#dcdde2] to-[#e7e9e5]",
    "rounded-xl",
    className
  )}>
    <div className="absolute inset-0 bg-[radial-gradient(...)] animate-bokeh" />
  </div>
);
```

### Add CSS Animation
```css
@keyframes bokeh {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
```

### Use in Loading States
Replace existing skeletons with BokehSkeleton.

### Files to Create/Modify
1. `src/components/ui/bokeh-skeleton.tsx` [NEW]
2. `src/index.css` - add animation
3. Replace Skeleton usage across app

### Acceptance Criteria
- [ ] BokehSkeleton component created
- [ ] Subtle shimmer animation
- [ ] Used in key loading states

## Assignee: CODEX
