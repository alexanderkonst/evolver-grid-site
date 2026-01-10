# Task: Route ZoG Entry to AI-First Flow

**Assigned to:** Codex  
**Priority:** High  
**Created:** 2026-01-10

---

## Context

When users click to start Zone of Genius, they currently go directly to the assessment.
They should first see the AI-first flow (ZoneOfGeniusEntry.tsx) which asks:
"Do you have an AI that knows you?" → If yes, paste response → generate snapshot.
If no, then go to assessment.

ZoneOfGeniusEntry.tsx ALREADY implements this correctly. We just need to route to it.

---

## What to Change

### 1. GameHome.tsx (line ~500)

Change:
```tsx
navigate('/zone-of-genius/assessment');
```
To:
```tsx
navigate('/zone-of-genius/entry');
```

### 2. CharacterHub.tsx (line ~348)

Change:
```tsx
navigate(zogSnapshot ? "/zone-of-genius" : "/zone-of-genius/assessment")
```
To:
```tsx
navigate(zogSnapshot ? "/zone-of-genius" : "/zone-of-genius/entry")
```

### 3. ZoneOfGeniusLandingPage.tsx (line ~16)

Change:
```tsx
navigate("/zone-of-genius/assessment");
```
To:
```tsx
navigate("/zone-of-genius/entry");
```

---

## Success Criteria

- [ ] Clicking "Zone of Genius start" in Profile leads to ZoneOfGeniusEntry
- [ ] User sees "Do you have an AI that knows you?" question first
- [ ] "No, I'll do the assessment" option still works and leads to assessment
- [ ] No TypeScript errors

---

## When Done

Rename this file to `DONE_zog_ai_first_flow.md`
