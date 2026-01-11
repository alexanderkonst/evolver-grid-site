# Task: Add Unique Offer Button After ZoG Completion

**Assigned to:** Codex  
**Priority:** Critical  
**Created:** 2026-01-11

---

## Problem

After completing Zone of Genius, the "Create My Unique Offer" button disappears.
User has no obvious way to access the Unique Offer (Excalibur) generation.

---

## Where the Button Should Appear

### 1. Profile Page (CharacterHub)

If ZoG is complete but Unique Offer is NOT complete:
```
┌─────────────────────────────────────────┐
│  ✦ Your Zone of Genius                  │
│                                         │
│  ARCHITECT OF INTEGRATION CODES         │
│  "He who weaves synthesis from chaos"   │
│                                         │
│  [View Full]          [Edit]            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  💎 Your Unique Offer                   │
│                                         │
│  You know WHO you are.                  │
│  Now discover WHAT you can offer.       │
│                                         │
│     [Create My Unique Offer →]          │
└─────────────────────────────────────────┘
```

### 2. After Viewing Saved ZoG

On AppleseedView.tsx (the page showing saved ZoG):
- Add "Create My Unique Offer" CTA at the bottom

### 3. Zone of Genius Landing Page

If user has ZoG but not Unique Offer:
- Show both options: "View My Genius" and "Create My Unique Offer"

---

## Logic

```typescript
const hasZoG = !!zogSnapshot?.appleseed_data;
const hasExcalibur = !!zogSnapshot?.excalibur_data;

// Show Unique Offer CTA only if:
// - ZoG complete AND Excalibur NOT complete
if (hasZoG && !hasExcalibur) {
  <UniqueOfferCTA />
}
```

---

## CTA Component

```tsx
const UniqueOfferCTA = ({ onStart }: { onStart: () => void }) => (
  <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 text-center">
    <Sword className="w-10 h-10 text-violet-500 mx-auto mb-3" />
    <h3 className="text-lg font-semibold text-slate-900 mb-2">
      Your Unique Offer
    </h3>
    <p className="text-slate-600 mb-4">
      You know WHO you are. Now discover WHAT you can offer.
    </p>
    <Button onClick={onStart}>
      Create My Unique Offer →
    </Button>
  </div>
);
```

---

## Success Criteria

- [ ] Button appears on Profile if ZoG done, Excalibur not done
- [ ] Button appears on AppleseedView page
- [ ] Button leads to `/zone-of-genius/entry` (which will auto-continue to Excalibur)
- [ ] After Excalibur complete, button disappears, summary shows instead

---

## When Done

Rename to `DONE_unique_offer_button.md`
