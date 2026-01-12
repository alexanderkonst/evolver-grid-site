---
priority: medium
agent: claude-cli
estimated_time: 2h
---

# Add aria-labels to Icon-Only Buttons

## Context

Per UI Skills guidelines (`docs/ui_skills.md`):
> MUST add an `aria-label` to icon-only buttons

Currently only 15 instances of aria-label found, but many more icon-only buttons exist.

## Task

Find all buttons that:
1. Contain only an icon (no visible text)
2. Are missing `aria-label`

Add descriptive `aria-label` that explains what the button does.

## How to Find

Look for patterns like:
```tsx
<Button size="icon">
  <SomeIcon />
</Button>

<button onClick={...}>
  <X className="..." />
</button>
```

## Examples of Good Labels

```tsx
<Button size="icon" aria-label="Close dialog">
  <X />
</Button>

<button onClick={toggleSidebar} aria-label="Toggle sidebar">
  <Menu />
</button>

<Button size="icon" aria-label="Delete item">
  <Trash2 />
</Button>
```

## Files to Check

- All components using Lucide icons
- `src/components/game/*.tsx`
- `src/components/ui/*.tsx`
- `src/modules/**/*.tsx`
- Any modal/dialog close buttons

## Acceptance Criteria

1. All icon-only buttons have descriptive aria-labels
2. Labels describe the action (not the icon)
3. Screen reader testing passes
