---
priority: low
agent: claude-cli
estimated_time: 3h
---

# Audit and Fix Arbitrary z-index Values

## Context

Per UI Skills guidelines (`docs/ui_skills.md`):
> MUST use a fixed `z-index` scale (no arbitrary `z-x`)

Currently found 45+ files using arbitrary z-index values like `z-10`, `z-20`, `z-50`, etc.

## Task

1. Create a z-index scale in Tailwind config or CSS variables:
```js
// tailwind.config.js
zIndex: {
  'base': '0',
  'dropdown': '10',
  'sticky': '20',
  'fixed': '30',
  'modal-backdrop': '40',
  'modal': '50',
  'popover': '60',
  'tooltip': '70',
}
```

2. Replace arbitrary values with semantic names:
- `z-10` → Determine what it represents, use semantic name
- `z-50` → Likely modal, use `z-modal` or similar

## Files to Audit

Major locations:
- `src/components/ui/*.tsx` (dialog, sheet, popover, etc.)
- `src/components/game/*.tsx`
- `src/pages/*.tsx`

## Acceptance Criteria

1. z-index scale defined in tailwind.config.js
2. All arbitrary z-values replaced with semantic tokens
3. No overlapping/fighting z-index issues
4. Modals/tooltips still appear above other content
