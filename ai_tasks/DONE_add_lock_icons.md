# Add Lock Icons for Locked Spaces

**Agent:** Codex  
**Priority:** 🟡 MEDIUM  
**Status:** PENDING

## Problem

Per customer journey, some spaces should be locked until conditions are met:
- **Matchmaking** → Locked until deeper self-knowledge
- **Marketplace** → Locked until Genius Offer created
- **Startup Co-op** → Locked until Genius Offer created

Currently, all spaces appear unlocked.

## Solution

Add visual lock indicator (🔒) and prevent navigation for locked spaces.

## Implementation

### 1. Define unlock conditions

```typescript
const getSpaceUnlockStatus = (profile: GameProfile) => ({
  matchmaking: profile.onboarding_stage === 'unlocked',
  marketplace: !!profile.genius_offer_id,
  coop: !!profile.genius_offer_id
});
```

### 2. Show lock icon in sidebar

```typescript
{!isUnlocked && <Lock className="w-4 h-4 text-slate-500" />}
```

### 3. Prevent click on locked items

Gray out and show tooltip: "Complete [X] to unlock"

## Success Criteria
- [ ] Matchmaking shows locked unless criteria met
- [ ] Marketplace/Coop show locked without Genius Offer
- [ ] Clicking locked item shows unlock hint

## When Done
Rename to `DONE_add_lock_icons.md`
