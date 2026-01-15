# CLAUDE: Referral Tracking

## Priority: 🟡 MEDIUM

## Goal
Store inviter_id when new user signs up via share link.

## Implementation Plan

### 1. Add referral param to share link
Update ShareZoG to include profile ID in URL:
```
www.alexandrkonstantinov.com?ref={profileId}
```

### 2. Capture referral on signup
In signup flow, read `ref` param and store:
```tsx
const searchParams = new URLSearchParams(window.location.search);
const inviterId = searchParams.get('ref');
```

### 3. Update game_profiles
Add to profile on creation:
```sql
invited_by: inviterId
```

### Database Migration
```sql
ALTER TABLE game_profiles 
ADD COLUMN invited_by UUID REFERENCES game_profiles(id);
```

### Files to Modify
1. `src/components/sharing/ShareZoG.tsx` - add ref param
2. Signup component - capture inviter
3. `src/lib/profiles.ts` - save invited_by

### Acceptance Criteria
- [ ] Share links include ?ref= parameter
- [ ] New signups capture inviter_id
- [ ] Can query who invited whom

## Assignee: CLAUDE
