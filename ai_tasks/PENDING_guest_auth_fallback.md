# Guest Profile Auth Fallback

## Goal
Fix 401 errors for logged-in users by ensuring all auth calls properly handle both authenticated and guest profiles.

## Problem
37+ instances of `supabase.auth.getUser()` do not fall back to guest profile, causing errors.

## Pattern to Apply

### Before (broken):
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error("Not logged in");
```

### After (fixed):
```typescript
import { getOrCreateGameProfileId } from "@/lib/profileUtils";

const profileId = await getOrCreateGameProfileId();
// Use profileId instead of user.id
```

## Files to Fix
Run grep to find all instances:
```bash
grep -rn "supabase.auth.getUser" src/ --include="*.tsx" --include="*.ts"
```

Each file needs:
1. Import `getOrCreateGameProfileId`
2. Replace `.auth.getUser()` with `getOrCreateGameProfileId()`
3. Update any `user.id` references to use `profileId`

## Priority Files
- `src/modules/zone-of-genius/saveToDatabase.ts`
- `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx`
- `src/pages/GameHome.tsx`
- Any page that saves/loads user data

## Acceptance
- No 401 errors for logged-in users
- Guest users can still use core features
- Data properly persists on auth
