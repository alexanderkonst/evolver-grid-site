# CODEX: Add Wabi-sabi styling to Switch component

## Objective
Update the Switch component to use Wabi-sabi color palette instead of default slate colors.

## File to modify
`src/components/ui/switch.tsx`

## Changes required
Replace the current styling with Wabi-sabi colors:
- Unchecked background: `bg-[#a4a3d0]/30` (instead of bg-input)
- Checked background: `bg-[#8460ea]` (instead of primary)
- Thumb: `bg-white`
- Focus ring: `focus-visible:ring-[#8460ea]/50`

## Acceptance criteria
- [ ] Switch looks consistent with other Wabi-sabi components
- [ ] Build passes with no errors
