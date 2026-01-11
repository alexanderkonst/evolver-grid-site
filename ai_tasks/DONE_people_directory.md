# Task: People Directory with Filters

**Assigned to:** Codex  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

Build a filterable directory of people. This is a core social network feature.

---

## What to Build

### 1. Directory Page

**File:** `src/pages/PeopleDirectory.tsx`

**Route:** `/community/people` or `/directory`

### 2. Filter System

```
┌─────────────────────────────────────────────────────┐
│  People Directory                                   │
│                                                     │
│  Filters:                                           │
│  ┌──────────────┐ ┌────────────────┐ ┌────────────┐ │
│  │ Mission ▼    │ │ Focus Area ▼   │ │ Location ▼ │ │
│  └──────────────┘ └────────────────┘ └────────────┘ │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  [Person Card] [Person Card] [Person Card]          │
│  [Person Card] [Person Card] [Person Card]          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3. Filter Options

**By Mission Structure:**
- Pillar (e.g., "Conscious Culture")
- Focus Area (e.g., "Regenerative Living")
- Challenge (optional)
- Outcome (optional)
- Specific Mission Title

**By Location:**
- Country
- City (if shared)

**By Other:**
- Archetype (optional advanced filter)

### 4. Person Card Component

```tsx
<PersonCard
  avatar={user.avatarUrl}
  name={`${user.firstName} ${user.lastName}`}
  archetype={user.appleseed?.archetype}
  location={user.showLocation ? user.location : null}
  mission={user.showMission ? user.missionTitle : null}
  onClick={() => navigate(`/u/${user.username}`)}
/>
```

### 5. Query Logic

```typescript
let query = supabase
  .from('game_profiles')
  .select('*')
  .neq('visibility', 'hidden');

if (filters.pillar) {
  query = query.eq('mission_pillar_id', filters.pillar);
}
if (filters.focusArea) {
  query = query.eq('mission_focus_area_id', filters.focusArea);
}
if (filters.location) {
  query = query.ilike('location', `%${filters.location}%`);
}
```

### 6. Add link to navigation

Add "People" to sidebar under Community space.

---

## Success Criteria

- [ ] Directory page shows all visible profiles
- [ ] Filter by Mission (Pillar → Focus → Challenge → Outcome)
- [ ] Filter by Location
- [ ] Cards link to public profile
- [ ] Respects privacy settings
- [ ] Pagination or infinite scroll for many users

---

## When Done

Rename to `DONE_people_directory.md`
