# CODEX: Update Progress component with Wabi-sabi styling

## Objective
Update the Progress component to use Wabi-sabi colors instead of default.

## File to modify
`src/components/ui/progress.tsx`

## Changes required
- Track background: `bg-[#a4a3d0]/20` (instead of bg-secondary)
- Progress bar: `bg-gradient-to-r from-[#8460ea] to-[#a4a3d0]`
- Optional: add subtle animation to the progress bar

## Acceptance criteria
- [ ] Progress bar shows violet gradient
- [ ] Track is light lavender
- [ ] Build passes with no errors
