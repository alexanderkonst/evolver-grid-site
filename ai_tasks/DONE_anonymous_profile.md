# Allow Anonymous Profile Exploration

**Agent:** Codex  
**Priority:** 🟡 MEDIUM  
**Status:** PENDING

## Problem

`/game/profile` shows "SIGN IN TO ACCESS YOUR CHARACTER" wall.
Users should be able to explore their (anonymous) profile before signing in.

## Context

Anonymous users have `game_profiles` entries via localStorage `game_profile_id`.
They should see their profile data (ZoG results, QoL, etc.) without signing in.

## Solution

Update `CharacterHub.tsx` to load profile for anonymous users too.

### Logic update:
```typescript
// If no user session, try loading via localStorage profile ID
if (!user) {
  const profileId = localStorage.getItem('game_profile_id');
  if (profileId) {
    loadProfileById(profileId);
  }
}
```

## Success Criteria
- [ ] Anonymous user with completed ZoG can see profile
- [ ] Profile shows ZoG/QoL data
- [ ] Sign-in prompt appears as CTA, not as wall

## When Done
Rename to `DONE_anonymous_profile.md`
