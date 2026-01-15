# CODEX: Add Wabi-sabi styling to Badge component

## Objective
Add a `wabi` variant to the Badge component using the Wabi-sabi color palette.

## File to modify
`src/components/ui/badge.tsx`

## Changes required
Add new variant to badgeVariants:
```tsx
wabi: "border-[#a4a3d0]/30 bg-gradient-to-r from-[#8460ea]/10 to-[#a4a3d0]/10 text-[#8460ea]",
```

## Acceptance criteria
- [ ] New `wabi` variant works: `<Badge variant="wabi">Text</Badge>`
- [ ] Build passes with no errors
