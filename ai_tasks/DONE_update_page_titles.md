# Update Page Titles

**Agent:** Codex  
**Priority:** 🟢 LOW  
**Status:** PENDING

## Problem

Browser tab shows: "Aleksandr Konstantinov | Builder & Creator"
Should show: "Evolver | [Page Name]"

## Solution

Update document title in relevant pages and App component.

### Add to App.tsx or create title hook:
```typescript
useEffect(() => {
  document.title = `Evolver | ${pageTitle}`;
}, [pageTitle]);
```

### Or use react-helmet-async for per-page titles

## Success Criteria
- [ ] Tab shows "Evolver | ..." not personal name
- [ ] Different pages show relevant titles

## When Done
Rename to `DONE_update_page_titles.md`
