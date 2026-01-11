# Task: Profile ZoG Display — Show Saved Genius in Profile

**Assigned to:** Codex  
**Priority:** Critical  
**Created:** 2026-01-11

---

## Problem

When user completes Zone of Genius:
- Profile still shows "Zone of Genius: [Start]" button
- Saved ZoG doesn't display in Profile page
- UX is confusing — user has to click Start to see saved data

---

## Expected Behavior

If user has completed ZoG:
- Show their genius summary card directly on Profile
- NO "Start" button if complete
- One-click to "View Full Profile" or "Edit"

If user has NOT completed ZoG:
- Show "Start" CTA

---

## What to Build

### 1. Check for existing ZoG data

```typescript
const { data: zogSnapshot } = await supabase
  .from('zog_snapshots')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

const hasZoG = !!zogSnapshot?.appleseed_data;
```

### 2. Profile ZoG Section Logic

```tsx
// In CharacterHub.tsx or Profile

{hasZoG ? (
  <ZoGSummaryCard 
    archetype={zogSnapshot.appleseed_data.archetype}
    tagline={zogSnapshot.appleseed_data.tagline}
    onViewFull={() => navigate('/appleseed/view')}
    onEdit={() => navigate('/zone-of-genius/entry')}
  />
) : (
  <ZoGStartCard 
    onStart={() => navigate('/zone-of-genius/entry')}
  />
)}
```

### 3. ZoGSummaryCard Component

```
┌─────────────────────────────────────────┐
│  ✦ Your Zone of Genius                  │
│                                         │
│  ARCHITECT OF INTEGRATION CODES         │
│  "He who weaves synthesis from chaos"   │
│                                         │
│  [View Full]          [Edit]            │
└─────────────────────────────────────────┘
```

### 4. Same for Unique Offer (if exists)

```tsx
{hasExcalibur ? (
  <UniqueOfferSummaryCard ... />
) : hasZoG ? (
  <CreateOfferCTA onStart={() => navigate('/zone-of-genius/entry')} />
) : null}
```

---

## Files to Modify

- `src/pages/CharacterHub.tsx` or Profile page
- May need new components: `ZoGSummaryCard.tsx`, `UniqueOfferSummaryCard.tsx`
- Hook to fetch `zog_snapshots`

---

## Naming

**DO NOT use "Appleseed" or "Excalibur" in UI.**

Use instead:
- "Zone of Genius" or "Your Genius"
- "Unique Offer" or "Your Offer"

---

## Success Criteria

- [ ] Profile shows ZoG summary if completed
- [ ] Profile shows Unique Offer summary if completed
- [ ] No "Start" button if already complete
- [ ] View Full and Edit buttons work
- [ ] Absurdly simple UX — Steve Jobs level

---

## When Done

Rename to `DONE_profile_zog_display.md`
