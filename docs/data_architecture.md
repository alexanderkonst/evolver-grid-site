# Data Architecture & Privacy

## Visibility Matrix

The core principle: **Users control who sees their data.**

### Data Layers

| Data Layer | Me | My Community | Meta (All) | Control |
|------------|-----|--------------|------------|---------|
| **Profile basics** | ✅ | ✅ | ⚠️ Opt-in | Toggle |
| **ZoG / Genius** | ✅ | ✅ | ⚠️ Opt-in | Toggle |
| **Offers / Products** | ✅ | ✅ | ✅ Public | Always on |
| **QoL scores** | ✅ | ❌ | ❌ | Private |
| **Practices / Actions** | ✅ | ⚠️ Aggregated | ❌ | Private |
| **Matchmaking** | ✅ | ⚠️ Opt-in | ⚠️ Opt-in | Toggle |

### UX Implementation

Every data section shows visibility indicator:

```
┌─────────────────────────────────────┐
│ My Zone of Genius                   │
│ ─────────────────────────────────── │
│ [Me ●] [Community ●] [Public ○]     │ ← Click to toggle
│                                     │
│ Your genius combines...             │
└─────────────────────────────────────┘
```

- **●** = Active (visible to this level)
- **○** = Inactive (not visible)
- **One-click toggle** for user control

---

## Database Schema

```sql
-- Visibility settings per profile
CREATE TABLE visibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES game_profiles(id) ON DELETE CASCADE,
  
  -- Per-field visibility
  zog_community BOOLEAN DEFAULT true,
  zog_public BOOLEAN DEFAULT false,
  
  profile_community BOOLEAN DEFAULT true,
  profile_public BOOLEAN DEFAULT false,
  
  matchmaking_community BOOLEAN DEFAULT true,
  matchmaking_public BOOLEAN DEFAULT false,
  
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## What's Always Public

| Data | Why |
|------|-----|
| **Offers / Products** | Marketplace needs visibility to work |
| **Community exists** | Discovery requires knowing communities exist |
| **Aggregate stats** | "50 members", "120 offers" — no personal data |

---

## What's Always Private

| Data | Why |
|------|-----|
| **QoL scores** | Deeply personal life assessment |
| **Practice history** | Individual journey details |
| **Internal notes** | Personal reflections |

---

## Multi-Tenant Data Isolation

```sql
-- Every query scoped to community
SELECT * FROM game_profiles 
WHERE community_id = :current_community_id;

-- Cross-community only for public/opted-in data
SELECT * FROM profiles_public_view
WHERE visibility_public = true;
```

---

## Marketplace: Public by Design

The **Shop/Marketplace** is intentionally public:

- Offers should reach ideal clients everywhere
- Products/services are meant to be discovered
- Each offer has its own public page: `/offers/:offer_id`
- Community shops aggregate their members' offers

---

## Next Steps

1. Create `visibility_settings` table
2. Add visibility toggles to Profile sections
3. Build `VisibilityIndicator` component
4. Scope all queries with community_id + visibility checks
