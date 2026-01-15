# CLAUDE: Signup Modal on Save

## Priority: 🔴 HIGH

## Goal
When a guest user clicks "Save to My Profile" on the Zone of Genius result, show a signup modal instead of directly saving.

## Implementation Plan

### 1. Create SignupModal Component
```
src/components/auth/SignupModal.tsx
```
- Modal with Wabi-sabi styling
- Email + Password fields (optional: social login buttons)
- After signup success → auto-save ZoG → show toast → reveal panels

### 2. Update ZoneOfGeniusEntry.tsx
- Check if user is guest (`!session?.user`)
- If guest: open SignupModal instead of calling handleSaveAppleseed
- If authenticated: save directly (current behavior)

### 3. Update AppleseedDisplay.tsx
- Pass `isGuest` prop to control button text
- Guest: "Save to My Profile" (triggers signup)
- Authenticated: "Saved ✓" (disabled, already auto-saved)

### Files to Modify
1. `src/components/auth/SignupModal.tsx` [NEW]
2. `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx`
3. `src/modules/zone-of-genius/AppleseedDisplay.tsx`

### Acceptance Criteria
- [ ] Guest sees "Save to My Profile" button
- [ ] Click opens signup modal
- [ ] After signup, ZoG is saved automatically
- [ ] Toast: "✨ Genius Saved!"
- [ ] Panels reveal after save

## Assignee: CLAUDE
