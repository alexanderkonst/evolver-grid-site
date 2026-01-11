# Remove Double Navigation

**Agent:** Codex  
**Priority:** 🔴 HIGH  
**Status:** PENDING

## Problem

Two navigation systems coexist:
- Top navbar: "game of life", "tools", "library", "contact", "donate"
- Sidebar: 7 spaces with modules

This creates confusion for users.

## Solution

When user is inside `/game/*` routes, hide the top navbar and show only sidebar.

## Files to Modify

### Option A: Modify top navbar component
Add condition to hide on `/game/*` routes:
```typescript
const showTopNav = !location.pathname.startsWith('/game');
```

### Option B: Modify layout per route group
- Marketing pages → Top navbar only
- Game pages → Sidebar only

## Success Criteria
- [ ] `/game/*` routes show only sidebar
- [ ] `/`, `/library`, `/contact` show only top navbar
- [ ] No visual overlap

## When Done
Rename to `DONE_remove_double_nav.md`
