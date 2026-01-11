# Task: Public Profile Page

**Assigned to:** Claude CLI  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Users need shareable public profile pages at `/u/{username}` or `/profile/{userId}`.

---

## What to Build

### 1. Username field

Add to game_profiles:
```sql
ALTER TABLE game_profiles ADD COLUMN username TEXT UNIQUE;
```

### 2. Public Profile Page

**File:** `src/pages/PublicProfile.tsx`

**Route:** `/u/:username` or `/profile/:userId`

### 3. Page Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│   [Avatar - 120px]                          │
│                                             │
│   Karime Kuri                               │
│   ✦ Sacred Mirror                           │
│   "She who reflects the love you forgot"    │
│                                             │
│   📍 Mexico City                            │
│   🎯 Mission: Regenerative Living           │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│   UNIQUE OFFER                              │
│   "I guide high-performing women out of     │
│    burnout and back into sovereign,         │
│    sacred wholeness..."                     │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│   [Connect with Karime]                     │
│                                             │
└─────────────────────────────────────────────┘
```

### 4. Visibility Controls

Check user's privacy settings before displaying:
- If `visibility = 'hidden'` → Show "Profile Private"
- If `visibility = 'minimal'` → Show only name + archetype
- If `visibility = 'full'` → Show everything

### 5. Meta Tags for Sharing

```tsx
<Helmet>
  <title>{user.firstName} | Evolver Grid</title>
  <meta property="og:title" content={`${user.firstName} - ${user.archetype}`} />
  <meta property="og:description" content={user.tagline} />
  <meta property="og:image" content={user.avatarUrl} />
</Helmet>
```

---

## Success Criteria

- [ ] Public profile accessible at /u/{username}
- [ ] Shows Appleseed data (archetype, tagline)
- [ ] Shows Excalibur offer
- [ ] Respects privacy settings
- [ ] Shareable with nice meta tags
- [ ] Connect button (links to connection flow)

---

## When Done

Rename to `DONE_public_profile.md`
