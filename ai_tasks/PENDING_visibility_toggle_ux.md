# Task: Improve Visibility Toggle UX

**Assigned to:** Codex  
**Priority:** Medium  
**Created:** 2026-01-10

---

## Context

Current visibility toggles (Me / Community / Public) take too much space and attention.
Need a more compact design.

---

## Current Problem

The toggles show labels ("Me", "Community", "Public") which:
- Take too much horizontal space
- Draw too much attention away from the content
- Don't explain what visibility means

---

## Proposed Solution: Compact Dropdown

Replace the three-button toggle with a compact dropdown:

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
      {value === 'private' && <Lock className="w-3 h-3" />}
      {value === 'community' && <Users className="w-3 h-3" />}
      {value === 'public' && <Globe className="w-3 h-3" />}
      <ChevronDown className="w-3 h-3 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-48 p-1">
    <div className="text-xs text-slate-500 px-2 py-1 mb-1">Who can see this?</div>
    <button className="...">
      <Lock /> Only me
    </button>
    <button className="...">
      <Users /> My community
    </button>
    <button className="...">
      <Globe /> Everyone
    </button>
  </PopoverContent>
</Popover>
```

---

## Files to Modify

- `src/components/VisibilityToggle.tsx` (if exists)
- Or create new `src/components/VisibilityDropdown.tsx`
- Update `src/pages/spaces/ProfileSpace.tsx` to use new component

---

## Design Requirements

1. **Very compact** — just icon + small chevron
2. **Dropdown on click** — shows three options with icons
3. **Tooltip or header** — "Who can see this?" in dropdown
4. **Selected state** — checkmark next to current option
5. **Muted colors** — should not draw attention

---

## Success Criteria

- [ ] Toggle takes minimal horizontal space (icon + chevron only)
- [ ] Dropdown opens on click and shows all options
- [ ] Current selection is visible
- [ ] Works on mobile
- [ ] No TypeScript errors

---

## When Done

Rename this file to `DONE_visibility_toggle_ux.md`
