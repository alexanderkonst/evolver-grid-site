# Simplify Sidebar Modules

**Agent:** Codex  
**Priority:** 🟡 MEDIUM  
**Status:** PENDING

## Problem

Sidebar has 15+ module links under 7 spaces - too cluttered.

Current structure causes cognitive overload.

## Proposed Simplified Structure

| Space | Modules (after cleanup) |
|-------|------------------------|
| My Next Move | None |
| Profile | Zone of Genius, Quality of Life |
| Transformation | Practice Library, Growth Paths |
| Gatherings | None |
| Matchmaking | People Directory |
| Marketplace | None (just landing page) |
| Startup Co-op | None |

### Remove:
- Profile → Asset Mapping
- Profile → Mission Discovery (duplicate)
- Transformation → Personality Tests
- Marketplace → Genius Offer (move to Marketplace landing)
- Marketplace → My Public Page (move to Profile?)
- Matchmaking → Connections (move to People Directory)

## File to Modify

`src/components/game/GameShell.tsx` - SPACES array

## Success Criteria
- [ ] Maximum 2 modules per space
- [ ] No duplicate or confusing items
- [ ] Clear purpose for each link

## When Done
Rename to `DONE_simplify_sidebar.md`
