# Task: Add Empty State Illustrations

## Priority: Medium
## Complexity: Low

## Description
Add friendly SVG illustrations for empty states throughout the app.

## Files to Modify
- `src/pages/Matchmaking.tsx` — "No matches yet"
- `src/pages/spaces/EventsSpace.tsx` — "No events"
- `src/pages/spaces/sections/ProfileAssetsSection.tsx` — "No assets"

## Implementation

### Pattern
```tsx
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 mb-4 text-slate-300">
      <Icon className="w-full h-full" />
    </div>
    <h3 className="text-lg font-medium text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-500 max-w-sm">{description}</p>
  </div>
);
```

### Use Cases
- **Matchmaking**: Users icon, "No matches yet", "Complete your Zone of Genius to find your people"
- **Events**: Calendar icon, "No events", "Check back soon or create your own"
- **Assets**: Package icon, "No assets mapped", "Start mapping your resources"

## Acceptance Criteria
- [ ] Each empty state has consistent styling
- [ ] Icons are from lucide-react
- [ ] Descriptions include helpful next action
- [ ] Centered and visually balanced
