# Task: Social Sharing (Zone of Genius)

**Assigned to:** Codex  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

Users should be able to share their Zone of Genius results to social networks. This is viral growth mechanism.

---

## What to Build

### 1. Share Button Component

**File:** `src/components/sharing/ShareZoG.tsx`

Add to AppleseedDisplay after generation:

```
┌─────────────────────────────────────────┐
│  🎉 Share Your Genius                    │
│                                         │
│  [LinkedIn] [Facebook] [Twitter/X]      │
│  [Telegram] [Copy Text]                 │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Share Text Template

```
✦ I just discovered my Zone of Genius ✦

I'm the "{ARCHETYPE_NAME}"
"{TAGLINE}"

My Prime Driver: {PRIME_DRIVER}

Discover your genius: {PROFILE_URL}

#ZoneOfGenius #EvolverGrid
```

### 3. Social Share Links

**LinkedIn:**
```
https://www.linkedin.com/sharing/share-offsite/?url={encoded_profile_url}
```

With pre-filled post (LinkedIn doesn't support pre-filled text directly, but we can try intent URL):
```
https://www.linkedin.com/feed/?shareActive=true&text={encoded_text}
```

**Facebook:**
```
https://www.facebook.com/sharer/sharer.php?u={encoded_profile_url}&quote={encoded_text}
```

**Twitter/X:**
```
https://twitter.com/intent/tweet?text={encoded_text}&url={encoded_profile_url}
```

**Telegram:**
```
https://t.me/share/url?url={encoded_profile_url}&text={encoded_text}
```

### 4. Copy Text Button

Just copy the share text to clipboard with toast confirmation.

### 5. Usage

Add `<ShareZoG />` to:
- AppleseedDisplay (after save)
- Profile page (if Appleseed exists)
- Public profile

---

## Share Card Image (Future Enhancement)

Generate OG image with:
- User's archetype
- Tagline
- Beautiful design

For now, just use text sharing.

---

## Success Criteria

- [ ] Share buttons appear after Appleseed generation
- [ ] LinkedIn share works (opens with text)
- [ ] Facebook share works
- [ ] Twitter/X share works
- [ ] Telegram share works
- [ ] Copy text works with toast
- [ ] Profile URL is correct (public profile)

---

## When Done

Rename to `DONE_social_sharing.md`
