# Panel 3 Action Buttons Standardization

## Problem
Action buttons on Panel 3 pages are inconsistently placed. Need to standardize for both desktop and mobile.

## Standard Pattern

### Desktop (lg+)
- Primary action button: Top-right of header area
- Secondary actions: Below primary, or as ghost buttons
- Sticky footer: Optional for critical actions

### Mobile
- Primary action: Sticky bottom bar (safe area padding)
- Secondary actions: Below content or in header as icon buttons

## Implementation

### Create Component: `src/components/game/Panel3Actions.tsx`

```tsx
interface Panel3ActionsProps {
    primaryLabel: string;
    primaryAction: () => void;
    primaryIcon?: React.ReactNode;
    secondaryLabel?: string;
    secondaryAction?: () => void;
    variant?: 'default' | 'sticky';
}

// Desktop: inline buttons in header area
// Mobile: sticky bottom bar with safe-area-inset-bottom
```

### Files to Update
Search for pages using Panel 3 content and update:

1. `src/pages/spaces/sections/ProfileAssetsSection.tsx` - Add "Find Matches" button
2. `src/pages/spaces/sections/ProfileMissionSection.tsx` - Standardize layout
3. `src/pages/spaces/sections/ProfileOverview.tsx` - Already clean
4. `src/pages/spaces/transformation/*.tsx` - All transformation pages

### Pattern for Each Page

```tsx
<div className="relative">
    {/* Header with actions */}
    <div className="flex items-start justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-bold">Page Title</h1>
            <p className="text-slate-600">Description</p>
        </div>
        {/* Desktop actions */}
        <div className="hidden sm:flex gap-2">
            <Button variant="outline">Secondary</Button>
            <Button>Primary Action</Button>
        </div>
    </div>
    
    {/* Content */}
    ...
    
    {/* Mobile sticky footer */}
    <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t p-4 pb-safe-4">
        <Button className="w-full">Primary Action</Button>
    </div>
</div>
```

## Verification
- [ ] All Panel 3 pages follow the pattern
- [ ] Mobile sticky footer has safe-area padding
- [ ] Desktop buttons are consistently top-right
- [ ] No duplicate buttons visible
