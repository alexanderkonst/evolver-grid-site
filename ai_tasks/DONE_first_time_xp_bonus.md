# First-Time Action XP Bonuses

**Agent:** Codex  
**Priority:** 🟡 MEDIUM  
**Status:** PENDING

## Concept

When user does something for the FIRST TIME, award bonus XP.
This gamifies feature discovery and encourages exploration.

## Implementation

### 1. Track First-Time Actions

Add to `game_profiles` (or separate table):
```typescript
interface FirstTimeActions {
  first_zog_complete: boolean;
  first_qol_complete: boolean;
  first_event_rsvp: boolean;
  first_connection: boolean;
  first_library_view: boolean;
  first_profile_edit: boolean;
  first_genius_offer: boolean;
  // ... more as needed
}
```

### 2. XP Award Logic

Create helper in `src/lib/xpService.ts`:

```typescript
async function awardFirstTimeBonus(
  userId: string, 
  actionKey: string,
  baseXP: number,
  bonusMultiplier: number = 2
): Promise<{awarded: boolean, xp: number}> {
  // Check if already done
  const profile = await getProfile(userId);
  if (profile.first_time_actions?.[actionKey]) {
    return { awarded: false, xp: 0 };
  }
  
  // Award bonus XP (2x base)
  const bonusXP = baseXP * bonusMultiplier;
  await awardXP(userId, bonusXP, `first_${actionKey}`);
  
  // Mark as done
  await markFirstTimeComplete(userId, actionKey);
  
  return { awarded: true, xp: bonusXP };
}
```

### 3. First-Time Bonuses Table

| Action | Base XP | First-Time Bonus |
|--------|---------|------------------|
| Complete ZoG | 100 | +200 (total 300) |
| Complete QoL | 100 | +200 (total 300) |
| RSVP to Event | 25 | +50 (total 75) |
| Make Connection | 25 | +50 (total 75) |
| View Library | 10 | +20 (total 30) |
| Edit Profile | 10 | +20 (total 30) |
| Create Genius Offer | 200 | +400 (total 600) |

### 4. UI: Toast with "FIRST TIME!" Badge

```typescript
toast({
  title: '🎉 FIRST TIME BONUS!',
  description: `+${bonusXP} XP for your first ${actionName}!`
});
```

### 5. Database Migration

Add to `game_profiles`:
```sql
ALTER TABLE game_profiles 
ADD COLUMN first_time_actions JSONB DEFAULT '{}';
```

Add migration to `PENDING_MIGRATIONS.md`.

## Success Criteria

- [ ] First ZoG completion gives 2x XP
- [ ] First RSVP gives 2x XP
- [ ] Toast shows "FIRST TIME BONUS!"
- [ ] Second time = normal XP (no bonus)
- [ ] Actions tracked in profile

## Future Ideas (Not for now)

- Token system based on XP
- Tradeable tokens
- On-chain representation

## When Done

Rename to `DONE_first_time_xp_bonus.md`
