# CODEX: Toast Notifications Wabi-sabi Styling

## Priority: 🟢 LOW

## Goal
Update toast notifications with Wabi-sabi styling.

## Implementation Plan

### Update src/components/ui/toast.tsx or toaster
```tsx
// Success toast
className="bg-gradient-to-r from-[#e7e9e5] to-[#dcdde2] 
           border-[#a4a3d0]/30 text-[#2c3150]"

// Error toast  
className="bg-gradient-to-r from-red-50 to-red-100
           border-red-200 text-red-800"
```

### Files to Modify
1. `src/components/ui/toast.tsx`
2. `src/components/ui/toaster.tsx` (if exists)

### Acceptance Criteria
- [ ] Success toasts use pearl/mist gradient
- [ ] Error toasts remain red but softer
- [ ] Border uses lavender
- [ ] Icon accents in violet

## Assignee: CODEX
