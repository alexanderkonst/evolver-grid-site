# Matchmaking Architecture

## Core Question

**Who/What matches with Whom/What, and for what purpose?**

---

## Matchmaking Dimensions

### 1. Human ↔ Human

| Match Type | Description | Optimization Goal |
|------------|-------------|-------------------|
| **Genius Complementarity** | Zone of Genius alignment | Find partners with complementary strengths |
| **Mission Alignment** | Shared mission/outcome interest | Find collaborators on same mission |
| **Offer ↔ Need** | Excalibur meets someone's gap | Marketplace transactions |
| **Geographic Proximity** | Same location/timezone | Local community building |
| **Stage Synchrony** | Similar journey stage | Peer support & accountability |

### 2. Human ↔ Mission

| Match Type | Description | Optimization Goal |
|------------|-------------|-------------------|
| **Genius Fit** | Which missions need their genius? | Deploy genius where needed |
| **Capacity Match** | Time/energy available | Right commitment level |
| **Role Fit** | Lead, support, advise? | Right position in team |

### 3. Human ↔ Event

| Match Type | Description | Optimization Goal |
|------------|-------------|-------------------|
| **Interest Alignment** | Event topic matches interests | Relevant gatherings |
| **Community Membership** | User's communities | Community events first |
| **Geographic** | Location-based | Local events priority |

### 4. Human ↔ Offer (Marketplace)

| Match Type | Description | Optimization Goal |
|------------|-------------|-------------------|
| **Need Detection** | User's gaps/challenges | Suggest relevant offers |
| **Budget Fit** | Pricing alignment | Affordable solutions |
| **Trust Layer** | Recommended by network | Social proof |

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

## Simple Starting Point (V1)

### Phase 1: Profile Completeness
Before matching, ensure rich profiles:
- [ ] Appleseed generated
- [ ] Excalibur generated
- [ ] LinkedIn uploaded (optional but encouraged)
- [ ] QoL snapshot done
- [ ] Mission selected

### Phase 2: Basic Matching Rules

**Mission Match:**
```
IF user.mission == other.mission AND user.id != other.id
THEN suggest connection
```

**Genius Complementarity:**
```
IF user.archetype complements other.archetype
AND same mission or community
THEN suggest collaboration
```

**Offer ↔ Need:**
```
IF user.excalibur.icp matches other.profile
THEN show in marketplace
```

### Phase 3: AI-Powered Matching
- Use embeddings for semantic similarity
- Consider interaction history
- Real-time recommendations

---

## UX Entry Points

| Location | Match Type |
|----------|------------|
| **Today / Home** | "People working on same mission" |
| **Profile View** | "Your potential collaborators" |
| **Marketplace** | "Offers for you" |
| **Events** | "Events you might like" |
| **Missions** | "People on this mission" |

---

## Next Steps

1. Define matching algorithm for V1
2. Create `matchmaking_scores` table
3. Build edge function to compute matches
4. UI components to display recommendations

---

*Document created: Day 8*
