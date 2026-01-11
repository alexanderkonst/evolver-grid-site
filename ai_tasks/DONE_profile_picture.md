# Task: Profile Picture Upload

**Assigned to:** Claude CLI / Lovable  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Users need to upload and display profile pictures.

---

## What to Build

### 1. Add avatar_url to game_profiles

```sql
ALTER TABLE game_profiles ADD COLUMN avatar_url TEXT;
```

### 2. Storage bucket for avatars

In Supabase Storage:
- Create bucket `avatars`
- Public read access
- Authenticated upload

### 3. ProfilePictureUpload component

**File:** `src/components/profile/ProfilePictureUpload.tsx`

- Show current avatar (or placeholder)
- Click to upload new image
- Crop/resize to square
- Upload to Supabase Storage
- Save URL to game_profiles.avatar_url

### 4. Display in sidebar

In `GameShell.tsx` or sidebar component:
- Show avatar next to username
- Circle format
- Fallback to initials if no avatar

### 5. Display in CharacterHub

Show larger avatar on profile page.

---

## UI Mockup

**Sidebar:**
```
┌────────────────────┐
│ [Avatar] Username  │
│ Level 5            │
└────────────────────┘
```

**Profile Page:**
```
┌─────────────────────────────┐
│      ┌─────────┐            │
│      │ Avatar  │  [Edit]    │
│      │  120px  │            │
│      └─────────┘            │
│     Username                │
│     Member since Jan 2026   │
└─────────────────────────────┘
```

---

## Success Criteria

- [ ] Can upload profile picture
- [ ] Shows in sidebar
- [ ] Shows on profile page
- [ ] Fallback to initials if none

---

## When Done

Rename to `DONE_profile_picture.md`
