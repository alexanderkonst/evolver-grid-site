# Simple Public Profile Page

## Goal
Create a clean, shareable public profile that showcases a user's Zone of Genius.

## Route
`/u/:username` or `/profile/:userId`

## Data to Display
1. **Profile Picture** (or default avatar)
2. **Name**
3. **Archetype Title** (from Appleseed)
4. **Core Vibration** (from Excalibur)
5. **Top 3 Talents** (from talents assessment)
6. **Bio/Tagline** (if set)

## Design
- Clean, minimal layout
- Matches landing page aesthetic (Playfair Display, pastels)
- Mobile-first
- Social share meta tags for link previews

## Files
- `src/pages/PublicProfile.tsx` (may already exist)
- Database query: `game_profiles` + `zone_of_genius_snapshots`

## Meta Tags
```html
<meta property="og:title" content="[Name] | Planetary OS">
<meta property="og:description" content="[Archetype Title]">
```

## Acceptance
- Profile loads with ZoG data
- Shareable URL works
- Link preview shows name + archetype
