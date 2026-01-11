# Fix 404 Pages

**Agent:** Codex  
**Priority:** 🟢 LOW  
**Status:** PENDING

## Problem

Several routes return 404:
- `/tools` - linked from top navbar
- Possibly others

## Solution

Either:
1. Create the missing pages
2. Or remove dead links from navigation

## Investigation Needed

Check which routes are missing:
- `/tools`
- `/donate` (if linked)
- Any other navbar links

## Files to Modify

If removing links:
- `src/components/Navbar.tsx` or similar

If creating pages:
- Create `src/pages/Tools.tsx`
- Add route in `App.tsx`

## Success Criteria
- [ ] No 404 from navbar links
- [ ] All visible links work

## When Done
Rename to `DONE_fix_404_pages.md`
