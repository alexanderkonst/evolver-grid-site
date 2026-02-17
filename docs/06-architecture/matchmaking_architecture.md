# Matchmaking Architecture

## Core Question

**Who/What matches with Whom/What, and for what purpose?**

---

## Match Types Ranked by Value

| Rank | Match Type | WOW Factor | Description |
|------|------------|------------|-------------|
| 1 | **Co-founder Match** | 🔥🔥🔥🔥🔥 | "Finally found who I want to build with" |
| 2 | **Perfect Client** | 🔥🔥🔥🔥 | "Someone actually wants what I offer" |
| 3 | **Team for Mission** | 🔥🔥🔥🔥 | "Ready team for my mission" |
| 4 | **Mentor/Advisor** | 🔥🔥🔥 | "Someone who walked this path" |
| 5 | **Accountability Partner** | 🔥🔥🔥 | "Peer at same stage who holds me" |
| 6 | **Local Community** | 🔥🔥 | "Nearby people I resonate with" |
| 7 | **Relevant Event** | 🔥 | "Event I actually need" |

---

## Matchmaking Dimensions

### Human ↔ Human

| Match Type | Description | Optimization Goal |
|------------|-------------|-------------------|
| **Genius Complementarity** | Unique Gift alignment | Find partners with complementary strengths |
| **Mission Alignment** | Shared mission/outcome interest | Find collaborators on same mission |
| **Offer ↔ Need** | Excalibur meets someone's gap | Marketplace transactions |
| **Geographic Proximity** | Same location/timezone | Local community building |
| **Stage Synchrony** | Similar journey stage | Peer support & accountability |

### Human ↔ Mission

| Match Type | Description | Optimization Goal |
|------------|-------------|-------------------|
| **Genius Fit** | Which missions need their genius? | Deploy genius where needed |
| **Role Fit** | Lead, support, advise? | Right position in team |

### Human ↔ Event

| Match Type | Description | Optimization Goal |
|------------|-------------|-------------------|
| **Interest Alignment** | Event topic matches interests | Relevant gatherings |
| **Community Membership** | User's communities | Community events first |
| **Geographic** | Location-based | Local events priority |

---

## How AI-Powered Matching Works

### Simple Explanation (for a 12-year-old)

Imagine every person as a **point in multi-dimensional space**. Each point has coordinates:
- Archetype (Architect, Mirror, Firekeeper...)
- Mission (Climate, Education, Health...)
- Location (Malaysia, USA, Mexico...)
- Capabilities (Coach, Builder, Investor...)
- Needs (Team, Funding, Clarity...)

The AI takes your point and finds **nearest points along relevant dimensions**.

**Want a collaborator?** → Search proximity by Mission + complementarity by Archetype.
**Want a client?** → Find those whose Need = your Offer.
**Want a mentor?** → Find those further along the same trajectory.

### Technical Implementation

1. **Profile → Embedding**: Convert profile into numerical vector
2. **Vector Comparison**: Calculate cosine distance between vectors
3. **Top-N Nearest**: Return highest-scoring matches

---

## Data Sources for Matching

| Data | Source | Fields |
|------|--------|--------|
| **Appleseed** | ZoG generation | Archetype, Prime Driver, Appreciation, Monetization |
| **Excalibur** | Offer generation | ICP, Promise, Price, Channel |
| **QoL Snapshot** | Assessment | 8 life domains scores |
| **LinkedIn PDF** | Upload | Experience, Skills, Network |
| **Mission Participation** | Selections | Pillar, Focus, Challenge, Outcome |
| **Events RSVP** | Interactions | Communities, Locations |
| **Assets** | Registration | Projects, Skills, Resources |

---

## UX Design: Tinder-Style Match Page

### Core Principle

**Absurd simplicity.** One match at a time. Swipe to explore.

### Default View

```
┌─────────────────────────────────────────────┐
│                                             │
│        [Avatar - Large]                     │
│                                             │
│        Karime Kuri                          │
│        ✦ Sacred Mirror                      │
│                                             │
│        MATCH REASON:                        │
│        Same mission: Regenerative Living    │
│        Complementary archetype              │
│                                             │
│    [← Pass]              [Connect →]        │
│                                             │
└─────────────────────────────────────────────┘
```

### Filter Option

User can select:
- **All matches** (AI recommendation - default)
- **Co-founders**
- **Team members**
- **Accountability partners**
- **Local community**

### Swipe Actions

- **→ Right / Connect**: Send connection request
- **← Left / Pass**: Skip, show next
- **↑ Up / Super**: High-interest flag

---

## V1 Implementation Plan

### Phase 1: Profile Completeness
Before matching, ensure rich profiles:
- [x] Appleseed generated
- [x] Excalibur generated
- [ ] LinkedIn uploaded (optional but encouraged)
- [x] QoL snapshot done
- [x] Mission selected

### Phase 2: Basic Matching Rules

```typescript
// Same mission match
if (user.mission === other.mission && user.id !== other.id) {
  suggestConnection();
}

// Complementary archetype
if (complementaryArchetypes(user.archetype, other.archetype)) {
  suggestCollaboration();
}
```

### Phase 3: AI-Powered Matching

Use embeddings for semantic similarity across all profile dimensions.

---

## Parked Ideas (Future)

- Compatibility scores between specific users
- "5 people who need your offer" recommendation
- Offer ↔ Need marketplace matching

---

*Document created: Day 8*
*Last updated: Day 8*

