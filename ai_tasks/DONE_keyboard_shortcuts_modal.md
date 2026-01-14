# Task: Add Keyboard Shortcuts Modal

## Priority: Low
## Complexity: Medium

## Description
Create a keyboard shortcuts modal accessible via `?` key press.

## Files to Create/Modify
- Create: `src/components/KeyboardShortcuts.tsx`
- Modify: `src/components/game/GameShellV2.tsx` (add event listener)

## Implementation

### KeyboardShortcuts.tsx
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "←/→", description: "Navigate slides (landing)" },
  { key: "Escape", description: "Close modals" },
  { key: "?", description: "Show this help" },
];

export const KeyboardShortcuts = ({ open, onClose }: Props) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        {shortcuts.map(s => (
          <div key={s.key} className="flex justify-between">
            <kbd className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">{s.key}</kbd>
            <span className="text-slate-600">{s.description}</span>
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);
```

### GameShellV2.tsx
Add useEffect to listen for `?` key and toggle modal state.

## Acceptance Criteria
- [ ] Pressing `?` opens shortcuts modal
- [ ] Modal lists all available shortcuts
- [ ] Escape closes the modal
- [ ] Modal styled consistently with app
