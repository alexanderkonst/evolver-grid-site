# Task: Color Contrast Check

## Priority: High
## Complexity: Low

## Description
Fix low-contrast text to meet WCAG AA accessibility standards (4.5:1 ratio).

## Known Issues
- `text-slate-400` on white backgrounds is often too light
- Light text on pastel backgrounds may fail contrast

## Files to Audit
Search for:
```
text-slate-400
text-slate-300
text-gray-400
text-gray-300
```

## Fixes
Replace low-contrast classes:
- `text-slate-400` → `text-slate-500` or `text-slate-600`
- `text-slate-300` → `text-slate-500`

## Background-Specific
On pastel backgrounds (wabi-sabi palette):
- Use `text-[#2c3150]` for primary text
- Use `text-[#2c3150]/70` for secondary text

## Testing
Use browser dev tools → Accessibility → Contrast checker

## Acceptance Criteria
- [ ] No text below 4.5:1 contrast ratio (normal text)
- [ ] No text below 3:1 contrast ratio (large text)
- [ ] Placeholder text still distinguishable
- [ ] Disabled states still readable
