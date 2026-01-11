# Task: Show Appleseed + Excalibur in Profile

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

After user generates Appleseed and Excalibur, they should be visible in:
- Character Hub / Game Profile
- Zone of Genius page

Currently there's no display of these results in the main profile.

---

## What to Build

### 1. Create AppleseedSummaryCard component

**File:** `src/components/profile/AppleseedSummaryCard.tsx`

Compact card showing:
- Vibrational Key name (e.g. "✦ Architect of Integration Codes ✦")
- Tagline
- "View Full Appleseed" link

### 2. Create ExcaliburSummaryCard component

**File:** `src/components/profile/ExcaliburSummaryCard.tsx`

Compact card showing:
- Offer sentence
- Price
- "View Full Excalibur" link

### 3. Add to CharacterHub.tsx or GameHome.tsx

In the profile section, show:
```tsx
{hasAppleseed && <AppleseedSummaryCard data={appleseed} />}
{hasExcalibur && <ExcaliburSummaryCard data={excalibur} />}
```

### 4. Hook to load data

Use existing `useZogSnapshot` or create new hook to load appleseed_data and excalibur_data.

---

## UI Design

```
┌─────────────────────────────────┐
│ ✨ Your Zone of Genius          │
│                                 │
│ ✦ Architect of Integration Codes ✦ │
│ "He who sees what wants to be   │
│  whole — and builds the blueprint." │
│                                 │
│ [View Full Appleseed]           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ⚔️ Your Excalibur               │
│                                 │
│ "I help founders clarify their  │
│  genius into a one-page offer." │
│                                 │
│ $333–$555 per session           │
│                                 │
│ [View Full Excalibur]           │
└─────────────────────────────────┘
```

---

## Success Criteria

- [ ] Appleseed card shows in profile
- [ ] Excalibur card shows in profile
- [ ] Click leads to full view
- [ ] Empty state if not generated yet
- [ ] Mobile responsive

---

## When Done

Rename to `DONE_profile_display.md`
