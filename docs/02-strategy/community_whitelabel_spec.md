# Community White-Label Specification

## Purpose

Enable any community to run their own instance of the platform with their branding, naming, and identity — while remaining connected to the meta-community network.

---

## Host Bridge Offer (v0 draft, 2026-10-30)

*Provenance: Hark draft for Sasha, 2026-10-30, from the Whole Map v-next (Move 2: hosts as the bridge across the first interval) and the product-needs overlay (gap 5: hosts were sold a white-label before anyone read the host's own gift). Not sent to anyone. Terms marked "to confirm" are Sasha's call. The white-label configuration below this section is unchanged.*

### The offer in three lines
1. **Your gift first, free.** We read your own top talent through Zone of Genius on findyourtoptalent.com, before we ask anything of your community.
2. **A Mastermind inside your community.** We run the Founder-Market Fit Discovery Mastermind for your members, in your room, under your name.
3. **50/50 and your own brand.** Revenue from your members is split 50/50, and the platform runs white-labelled as your community's own space.

### Who it is for
Hosts and stewards (tribe 6 on the Whole Map): people who already hold a room of 30 to 3,000 members, online or on the land, and whose work is not counted as work ("I make the room for everyone, and nobody counts it as work"). Best fit: founder clubs, conscious-business circles, retreat and hub hosts, healer and coach collectives whose members have a lived gift and no one to make things with yet.
Not for: audiences without a host (newsletters, follower lists), or communities that only want a one-off speaker.

### What the host gets
- Their own gift read and named: a one-sentence top talent they can say out loud (the Mirror note, for the person who mirrors everyone else).
- Hosting that pays: half of every member's Mastermind seat and of the follow-on work members buy, without building a programme themselves.
- A deeper room: members leave with a Circle (something made with someone else), so the community holds together for more than content.
- Their own branded space (logo, colours, naming, language) with the consent-based leader view from the white-label spec.
- Zero delivery load: Sasha and Evolver run the sessions, the integration week and the follow-up.

### What members get
- Their own top talent and mission read by their own AI (ChatGPT, Claude, Gemini), with the guided in-site test as fallback.
- A live Mastermind: two 90-minute sessions plus 7 days of integration, with peers from their own community.
- A visible line: steps and traces the room can see, so the next move (a price, a first sale, a partner) is named, not guessed.
- No guarantee of outcome is promised, in line with the Mastermind's terms.

### Sequence
1. **Mirror for the host.** Host plays Zone of Genius (free). Sasha reads it back in one session; host confirms "yes, that's me".
2. **Fit check.** One call: who the members are, what they are stuck on, whether a Mastermind fits this room now. Either side can stop here.
3. **Terms on one page.** Split, branding, member data consent, dates. Signed or agreed in writing.
4. **Branded space.** White-label configured (logo, colours, naming, language) per the spec below.
5. **Invitation.** Host invites members to play the game in their branded space; Zone of Genius is the door, the Mastermind is not pitched in the first invitation.
6. **Mastermind.** Two live days + 7 days integration, run by Sasha inside the community.
7. **Settlement and review.** Revenue split paid out; host and Sasha review what landed; decide on the next season.

### What we need from the host
- 30 minutes for their own reading, and one fit call.
- Their honest yes on fit after reading their own gift (no yes, no launch).
- Brand assets (logo, colours, community name, language) and one named contact.
- An invitation to their members in their own voice, through their own channels.
- A room for two live sessions (their call/space or ours) and consent rules for member data.
- No upfront fee, no ad spend, no delivery work.

### Terms to confirm (Sasha)
- 50/50 base: Mastermind seats only, or seats plus follow-on 1:1 work (Founder-Market Fit session, Product-Market Fit month) bought by members within a set window.
- White-label under this offer vs the standing white-label price ($1,500 setup + $75/mo): waived, deferred, or netted from the split.
- Mastermind seat price inside a host's community.

### Candidate hosts (profiles; names in the private ledger CRM)
Warm = an existing relationship with Sasha; listed only, no lines or timing proposed. Cold = no relationship yet.

| # | Profile | Warm/cold | Why it fits | CRM ref |
|---|---|---|---|---|
| 1 | Host of a private founder club (~103 members; crypto, AI, biotech, artists) with frequent Bali events | Warm | Owns a room of builders; shared thesis; a guest-workshop rev-share is already on the table | Master Table 60 |
| 2 | Host of a paid entrepreneur membership + impact marketplace | Warm | Raised licensing an onboarding module for her own community | Master Table 68 |
| 3 | Community holder, first white-label node candidate | Warm | Long-time client; white-label proposal already received; accepted the community-host pitch in July | Master Table 1 |
| 4 | Zone of Genius workshop partner with his own community | Warm | Already ran ZoG with Sasha; accepted the community-host pitch in July | Master Table 19 |
| 5 | Co-founder of a high-agency resilience/climate community | Warm | Expressed pilot interest once membership grows | Master Table 29 |
| 6 | Host of a DAO community + village project | Warm (cooled) | Said yes in July and offered a custom URL; later white-label skin went unanswered | Tier 2, T2-5 |
| 7 | Host of an impact creators / builders club | Warm-neutral | Intro call held; open to co-hosted events | Master Table 67 |
| 8 | Post-exit founders community (2,500+), "what's next" theme | Cold | Exact match to the founders-between-chapters thesis; the Mastermind may be the shape the offer lacked | Tier 2, T2-10 |
| 9 | Founder of a Dubai & Bali conscious community | Cold | Community operator in the inner-work + host seam | Candidate list |
| 10 | Host of monthly online breathwork journeys | Cold | Healer who already gathers a recurring room | — |

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
