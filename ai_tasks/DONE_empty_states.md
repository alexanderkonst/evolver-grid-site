# Task: Add Empty States

## Context
Lists that have no data show blank space. Need beautiful empty states.

## Files to Modify
- Event lists
- Connections list
- Assets list
- Any component that renders a list

## What to Build

1. Create reusable EmptyState component:
```tsx
// src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 mb-4 max-w-sm">{description}</p>
    {action && (
      <Button onClick={action.onClick}>{action.label}</Button>
    )}
  </div>
);
```

2. Add to lists:
- Events: "No events yet" + "Browse Events" button
- Connections: "No connections yet" + "Find People" button
- Assets: "No assets saved" + "Map Your Assets" button

## Success Criteria
- [ ] EmptyState component created
- [ ] All lists have empty states
- [ ] Empty states have relevant CTAs
- [ ] Build passes
