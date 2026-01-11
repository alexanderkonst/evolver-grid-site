# Task: XP System Hookup

**Assigned to:** Codex  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Actions should award XP to create dopamine loops. Currently XP is displayed but not actively awarded.

---

## What to Build

### 1. XP Award Function

**File:** `src/lib/xpSystem.ts`

```typescript
export const awardXP = async (
  userId: string, 
  amount: number, 
  source: string,
  vector?: 'genius' | 'spirit' | 'mind' | 'emotions' | 'body'
) => {
  // Update total_xp in game_profiles
  // Log to xp_events table (if exists)
  // Return new total
};
```

### 2. XP Award Points

| Action | XP | Vector |
|--------|-----|--------|
| Complete Zone of Genius | +100 | Genius |
| Complete Unique Offer | +200 | Genius |
| Complete QoL Assessment | +50 | Mind |
| RSVP to Event | +10 | Spirit |
| Complete Transformation Unit | +25 | varies |
| First Connection Made | +25 | Spirit |
| Daily Login Streak | +5 | Mind |

### 3. Hook into Existing Flows

**After ZoG Save (saveToDatabase.ts):**
```typescript
await awardXP(userId, 100, 'zog_complete', 'genius');
```

**After Excalibur Save:**
```typescript
await awardXP(userId, 200, 'excalibur_complete', 'genius');
```

**After RSVP:**
```typescript
await awardXP(userId, 10, 'event_rsvp', 'spirit');
```

### 4. XP Toast Notification

When XP is awarded, show toast:
```
🎉 +100 XP (Genius)
```

### 5. Level Calculation

```typescript
const calculateLevel = (totalXP: number) => {
  // Level 1: 0-100
  // Level 2: 101-250
  // Level 3: 251-500
  // etc.
};
```

---

## Success Criteria

- [ ] XP awards on ZoG complete
- [ ] XP awards on Unique Offer complete
- [ ] XP awards on RSVP
- [ ] Toast shows XP gain
- [ ] Level updates in profile
- [ ] XP history trackable (optional)

---

## When Done

Rename to `DONE_xp_hookup.md`
