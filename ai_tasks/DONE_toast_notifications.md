# Task: Add Toast Notifications

## Context
Currently many actions log to console instead of showing user feedback. Need proper toast notifications.

## Files to Read
- `src/components/ui/` — check if toast component exists (shadcn/ui)
- Files that use console.log for user actions

## What to Build

1. If toast doesn't exist, add shadcn toast:
```bash
npx shadcn-ui@latest add toast
```

2. Create a toast utility hook if needed:
```tsx
// src/hooks/useToast.ts
import { toast } from "@/components/ui/use-toast";

export const showSuccess = (message: string) => {
  toast({ title: "Success", description: message });
};

export const showError = (message: string) => {
  toast({ title: "Error", description: message, variant: "destructive" });
};
```

3. Replace console.log with toasts in:
- Save actions (ZoG, QoL, Assets)
- RSVP actions
- Connection requests
- Form submissions

## Success Criteria
- [ ] Toast component available
- [ ] User actions show success/error toasts
- [ ] No console.log for user-facing actions
- [ ] Build passes
