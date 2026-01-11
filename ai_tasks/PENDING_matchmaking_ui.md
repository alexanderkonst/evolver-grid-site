# Task: Matchmaking Space Tinder-Style UI

**Assigned to:** Claude CLI  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Build Tinder-style matchmaking UI. Absurd simplicity. One match at a time.

---

## What to Build

### 1. Matchmaking Page

**File:** `src/pages/spaces/MatchmakingSpace.tsx`

Replace placeholder with full matchmaking UI.

### 2. Match Card Component

**File:** `src/components/matchmaking/MatchCard.tsx`

```tsx
interface MatchCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    archetype: string;    // From Appleseed
    tagline?: string;     // From Appleseed
  };
  matchReason: string;    // e.g., "Same mission: Regenerative Living"
  onPass: () => void;
  onConnect: () => void;
}
```

### 3. UI Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│        [Avatar - Large, 120px]              │
│                                             │
│        Karime Kuri                          │
│        ✦ Sacred Mirror                      │
│        "She who reflects the love you       │
│         forgot existed"                     │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│        WHY YOU MATCH:                       │
│        🎯 Same mission: Regenerative Food   │
│        🧩 Complementary archetype           │
│                                             │
│   ┌─────────────┐   ┌─────────────────┐     │
│   │  ← Pass     │   │   Connect →     │     │
│   └─────────────┘   └─────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

### 4. Match Filter

Above the card, simple filter:
```tsx
<Select defaultValue="all">
  <SelectItem value="all">All Matches</SelectItem>
  <SelectItem value="mission">Same Mission</SelectItem>
  <SelectItem value="local">Near Me</SelectItem>
  <SelectItem value="cofounders">Co-founders</SelectItem>
</Select>
```

### 5. Swipe Support (Optional)

If time permits, add touch swipe gestures:
- Swipe right = Connect
- Swipe left = Pass

---

## Data Source

For V1, fetch users with:
- Same mission as current user
- Has appleseed_data (archetype exists)
- Not current user
- Not already connected

---

## Success Criteria

- [ ] Match card displays with avatar, name, archetype
- [ ] Pass and Connect buttons work
- [ ] Filter dropdown works
- [ ] Next match loads after action
- [ ] Mobile responsive

---

## When Done

Rename to `DONE_matchmaking_ui.md`
