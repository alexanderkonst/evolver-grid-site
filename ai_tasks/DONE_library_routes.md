# Task: Fix /library Routes — 404 Errors

**Assigned to:** Codex  
**Priority:** High  
**Created:** 2026-01-11

---

## Problem

Links like `/library/breathwork` return 404.

My Next Move recommends practices that link to `/library/{category}` but the route doesn't exist.

---

## Investigation Needed

1. Check if Library page exists: `src/pages/Library.tsx`
2. Check if routes are configured in `App.tsx` or router file
3. Check what the correct URL structure should be

---

## Possible Fixes

### Option 1: Route Missing

Add route:
```tsx
<Route path="/library/:category" element={<LibraryCategory />} />
```

### Option 2: Route Wrong Format

Maybe it should be `/game/transformation/library/:category`

### Option 3: Create Library Category Page

If page doesn't exist, create simple page:
```tsx
const LibraryCategory = () => {
  const { category } = useParams();
  // Show practices filtered by category
};
```

---

## Success Criteria

- [ ] `/library/breathwork` works
- [ ] `/library/*` routes all work
- [ ] My Next Move links don't 404

---

## When Done

Rename to `DONE_library_routes.md`
