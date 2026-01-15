# Guest Appleseed Persistence

> **Status**: PENDING  
> **Agent**: CLAUDE  
> **Priority**: High

## Objective
Persist ZoG (Appleseed) results for guests in localStorage before signup, then migrate to database after successful auth.

## Approach
1. Save appleseed data to localStorage when generated for guests
2. After signup (SignupModal onSuccess), migrate localStorage data to Supabase
3. Clear localStorage after successful migration

## Files to Modify
- `/src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx` - Add localStorage save
- `/src/components/auth/SignupModal.tsx` - Trigger migration on success
- `/src/modules/zone-of-genius/saveToDatabase.ts` - Add migration function

## Acceptance Criteria
- [ ] Guest can complete ZoG without losing data on signup
- [ ] Data migrates seamlessly after auth
- [ ] Build passes
