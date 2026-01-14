# Display Plain Language in ZoG UI

## Goal
Show both poetic AND plain language versions in the UI.

## Files
- `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx`
- `src/pages/AppleseedView.tsx`
- `src/pages/ExcaliburView.tsx`

## Changes

### Display Format
```
"Когерентный Алхимик"
(помогаю системам стать гармоничными)
```

Poetic title = large, prominent
Plain meaning = smaller, underneath in lighter color

### For each field with _plain sibling:
1. archetype + archetype_plain
2. coreVibration + coreVibration_plain
3. primeDriver + primeDriver_plain

## Styling
- Poetic: larger font, bold
- Plain: smaller, italic, lighter color (e.g., text-muted-foreground)

## Acceptance
- Every poetic term shows its plain translation
- Layout is clean, not cluttered
