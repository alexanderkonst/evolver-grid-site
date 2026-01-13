# Task: Fix SectionsPanel Indentation

## Priority: HIGH

## Description
The indentation in SectionsPanel is reversed — parent sections appear MORE indented than their children due to chevron icon taking space. Fix so children are properly indented under parents.

## File to Modify
`src/components/game/SectionsPanel.tsx`

## Current Problem (Lines ~170-220)
```tsx
// Parent section div has chevron that pushes text right
<div className="flex items-center gap-2 px-3 py-2 mx-2 rounded-md">
    {hasSubSections && (
        <span className="w-4 h-4 flex items-center justify-center">
            {/* Chevron */}
        </span>
    )}
    <span>{section.label}</span>
</div>

// Child sections have ml-4 but appear LESS indented
<div className="ml-4 border-l border-slate-700">
    <div className="flex items-center gap-2 px-3 py-1.5 ml-2 rounded-md">
```

## Required Changes

1. **Keep parent sections at normal indent** (remove chevron space for non-expandable items):
   - Add placeholder space for items WITHOUT subsections so all labels align

2. **Increase child section indent** from `ml-4` to `ml-8`:
```tsx
<div className="ml-8 border-l border-slate-700">
```

3. **Visual target**:
```
Overview              ← top level, no icon
Practice Library      ← top level, no icon
▾ Growth Paths        ← top level with chevron
    └─ Body           ← indented child
    └─ Mind           ← indented child
Personality Tests     ← top level, no icon
```

## Acceptance Criteria
- [ ] All top-level sections aligned at same left position
- [ ] Sub-sections clearly indented under their parents
- [ ] Chevrons only appear for expandable sections
- [ ] Visual hierarchy is obvious (parent → child)

## Test
1. Open `/game/transformation`
2. Expand "Growth Paths"
3. Verify Body, Mind, etc. are MORE indented than "Growth Paths"
