# CODEX: Form Components Wabi-sabi Styling

## Priority: 🟡 MEDIUM

## Goal
Update Textarea, Select, Checkbox components with Wabi-sabi styling.

## Implementation Plan

### Update src/components/ui/textarea.tsx
```tsx
className="rounded-xl border-[#a4a3d0]/40 bg-[#e7e9e5]/50 
           focus-visible:ring-[#8460ea]/30 focus-visible:border-[#8460ea]/50"
```

### Update src/components/ui/select.tsx
Same pattern as input/textarea.

### Update src/components/ui/checkbox.tsx
```tsx
className="border-[#a4a3d0]/40 data-[state=checked]:bg-[#8460ea] 
           data-[state=checked]:border-[#8460ea]"
```

### Files to Modify
1. `src/components/ui/textarea.tsx`
2. `src/components/ui/select.tsx`
3. `src/components/ui/checkbox.tsx`

### Acceptance Criteria
- [ ] Textarea has lavender border, pearl background
- [ ] Select dropdown matches input styling
- [ ] Checkbox uses violet for checked state
- [ ] All focus states use violet ring

## Assignee: CODEX
