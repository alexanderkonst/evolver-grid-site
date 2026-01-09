# Community White-Label Specification

## Purpose

Enable any community to run their own instance of the platform with their branding, naming, and identity — while remaining connected to the meta-community network.

---

## White-Label Configuration

### 1. Visual Identity

| Element | Example (Priroda) | Storage |
|---------|-------------------|---------|
| **Logo** | prírodă-logo.svg | `communities.logo_url` |
| **Primary Color** | #2E7D32 (green) | `communities.brand_primary` |
| **Secondary Color** | #81C784 | `communities.brand_secondary` |
| **Accent Color** | #FFC107 | `communities.brand_accent` |
| **Background** | #FAFAFA | `communities.brand_bg` |

### 2. Naming Convention

| Platform Default | Priroda Override | Field |
|------------------|------------------|-------|
| Transformation Space | Академия Развития | `spaces.transformation_name` |
| Profile Space | Личный Кабинет | `spaces.profile_name` |
| Marketplace | Магазин | `spaces.marketplace_name` |
| Growth Paths | Пути Развития | `growth_paths_label` |

### 3. Language

| Field | Value |
|-------|-------|
| `default_locale` | `ru` |
| `supported_locales` | `['ru', 'en']` |

---

## Database Schema

```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,           -- 'priroda'
  name TEXT NOT NULL,                   -- 'Priroda'
  
  -- Branding
  logo_url TEXT,
  brand_primary TEXT DEFAULT '#6366f1',
  brand_secondary TEXT DEFAULT '#818cf8',
  brand_accent TEXT DEFAULT '#f59e0b',
  brand_bg TEXT DEFAULT '#f8fafc',
  
  -- Naming overrides (JSON)
  space_names JSONB DEFAULT '{}',
  
  -- Localization
  default_locale TEXT DEFAULT 'en',
  
  -- Ownership
  owner_user_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Link profiles to communities
ALTER TABLE game_profiles 
ADD COLUMN community_id UUID REFERENCES communities(id);
```

---

## UI Implementation

### CSS Variables Injection

```tsx
// In CommunityProvider
const injectBranding = (community: Community) => {
  document.documentElement.style.setProperty('--brand-primary', community.brand_primary);
  document.documentElement.style.setProperty('--brand-secondary', community.brand_secondary);
};
```

### Logo Replacement

```tsx
// In GameShell.tsx header
<img 
  src={community?.logo_url || '/evolver-logo.svg'} 
  alt={community?.name || 'Evolver Grid'}
/>
```

---

## Demo Prep: Priroda

1. Create `communities` record with slug `priroda`
2. Upload their logo
3. Set Russian names for all spaces
4. Apply green brand colors
5. Show them **their** platform

---

## Forking Strategy

**Recommended:** Hybrid approach. Single Supabase project with `community_id` filtering. Visual overrides via CSS variables.

---

## Next Steps

1. Create `communities` table migration
2. Add `community_id` to `game_profiles`
3. Build `CommunityProvider` context
4. Inject CSS variables from community config
5. Create community admin page for logo/color upload
