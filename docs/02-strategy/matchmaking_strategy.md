# Matchmaking Strategy

> **Core Insight:** Start as a community tool with intra-community matching. Graduate to community-of-communities when multiple tribes are thriving.

> **Day 66 (Sasha, May 16, 2026) download** appended below — the older sections through "Notes" are preserved as genealogy; the new sections at the bottom (starting with **"The Day 66 Download — Matching Engine v2"**) are the current canonical strategy. The match-types table in the older section is superseded by the v2 primitive→use-case map.

---

## Strategic Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Intra vs Inter-community** | Intra-community first | Higher trust, faster action, proves value faster |
| **Tool vs Platform** | Community Tool first | MVP serves one tribe; network effects come later |
| **Scale architecture** | Rule-based now, embeddings later | Works to ~1,000 users; pgvector ready for growth |

---

## Matchmaking as the Trojan Horse (Entry Point)

> *March 2026 Shift — Quadrant 4 Discovery*

### The Dual Entry Architecture (Double Funnel)

With Matchmaking as an entry point, the system operates on a lower-friction, broader-aperture entry based on *need for connection* rather than *personal pain*. This introduces an entirely second funnel into the ecosystem:

```text
ENTRY 1 (Current):  Pain recognition → Session → Canvas → Build → Node
ENTRY 2 (New):      Asset matchmaking → Profile → Connection → Recognition → Session → Canvas → Build → Node
```

**Where it lives:** This new funnel runs on the **intelligence layer (Evolver)**, distinct from the operational layer (GHL) which currently powers Entry 1. Asset matchmaking is a platform feature—the system reading profiles and connecting nodes. The matchmaking IS the product at this entry point, not the Session.

**How it works structurally:**
1. **The Pull:** "Find your missing piece / co-founder / complementary genius / asset."
2. **The Gate:** To enter the matchmaking pool and see your matches, you *must* create a profile.
3. **The Stealth Mapping:** Creating a profile implicitly maps your genius (Uniqueness OS) and your current assets.
4. **The Trojan Horse:** The user entered for the network (MEET/COLLABORATE). But as the system reflects their own pattern back to them, they experience the intelligence of the platform. *THAT* creates the recognition that leads them to want the full session.

*Distribution consequence:* The platform distributes itself. Every match creates two satisfied users who inherently bring others into the system.

---

## Match Types (Priority Order)

| Match Type | Signal | Question Answered | Status |
|------------|--------|-------------------|--------|
| **Complementary Genius** | Archetype pairing | "Who's a great co-founder fit?" | ✅ Built |
| **Similar Genius** | Archetype/pattern overlap | "Who thinks like me?" | ✅ Built |
| **Similar Mission** | Mission commitment | "Who's working on what I care about?" | ✅ Built |
| **Asset Complementarity** | I have X, you need X | "Who can help / needs my help?" | 🔶 Next |
| **Growth Pairing** | QoL weak spots | "Who's navigating similar challenges?" | 🔶 Future |

---

## Current Implementation

**What exists:**
- `Matchmaking.tsx` — Shows 3 match categories
- `archetypeMatching.ts` — Complementarity logic
- `MatchCard.tsx` — Pass/Connect UI (connect action needs work)
- Filters: location, language

**Data sources used:**
- Unique Gift (`appleseed_data`)
- Mission commitments (`mission_participants`)

**Not yet used:**
- Assets (currently localStorage, needs DB persist)
- Quality of Life data

---

## Scale Architecture

### Current (up to ~1,000 users)
- Brute-force comparison: O(n²)
- Cached server-side, recomputed on profile change
- Works fine for MVP

### Future (10,000+ users)
```
Profile → Synthesized Text → Embedding → Vector DB (pgvector)

Query: "Find top 10 nearest neighbors to this embedding"
Complexity: O(log n) with approximate nearest neighbor
```

**Supabase-ready approach:**
1. Add `profile_embedding` column to `game_profiles`
2. Edge function generates embedding on profile update
3. Query with `ORDER BY embedding <=> $target LIMIT 10`

---

## MVP Scope

### Must Have
- [ ] Connect button actually works (email or connection request)
- [ ] Intra-community filtering (by cohort/program if applicable)
- [ ] Page rename: "Matchmaking" → "Discover" (cosmetic)

### Nice to Have
- [ ] AI-generated match explanation ("Why collaborate")
- [ ] Asset-based matching (requires DB migration for assets)

### Future (Post-Pilot)
- [ ] pgvector embedding column
- [ ] Inter-community toggle
- [ ] Growth/QoL-based pairing

---

## Community Framing

**Phase 1: Community Tool**
- Platform serves ONE community at a time
- All matching is intra-community (same cohort/program)
- High trust, fast iteration, value proven quickly

**Phase 2: Community of Communities**
- Multiple tribes on platform
- Inter-community matching unlocked
- Introduction/trust layer needed
- Network effects begin

**Transition trigger:** 3-5 thriving tribes using the tool internally.

---

## Notes

- Assets currently stored in localStorage per user — needs DB migration before asset-matching works
- Connect button exists in UI but action may be non-functional
- Current matching algorithm handles ~1,000 users fine; embedding prep is for growth readiness

---

# The Day 66 Download — Matching Engine v2 (May 16, 2026)

> Sasha's voice memo / typed download, captured + structured. This section is now canonical strategy; the older sections above are preserved as genealogy. When v3 lands, follow the same pattern — append below, mark the supersession at the top.

## 1. The holarchy

Three layers, three levels of profile:

| Layer | What it is | Has a profile? |
|---|---|---|
| **Person** | Individual human | Today: yes (the platform builds it) |
| **Project** | Organization, team, group of people. In practice always has ONE ultimate decision-maker (the leader). Matching a project ≈ matching its leader, for now. | Not yet — schema doesn't exist; users may create them over time |
| **Ecosystem** | A group of groups. Network of projects with shared coordinates. | Not yet |

These nest holarchically: people form projects, projects form ecosystems. Six matching combinations follow from the three layers:

```
person ↔ person       ← THE CURRENT FOCUS
person ↔ project
person ↔ ecosystem
project ↔ project
project ↔ ecosystem
ecosystem ↔ ecosystem
```

**Scope of v2:** person-to-person only. Projects and ecosystems get profiles later. Because every project has a leader-person, getting person-to-person matching right unlocks the project layer as a natural extension (matching project-leaders = matching projects, for v1 of that layer).

## 2. The two dimensions of the profile

The profile has **two dimensions**, both needed for matching:

### Dimension A — Profile primitives (the inputs)

What the platform already collects (or can):

| Primitive | What it captures | Status today |
|---|---|---|
| **Lifelong dedication** (formerly "mission") | What this person is here to do; the direction they move | Mission Discovery surface — saves one sentence |
| **Role / Top Talent / Unique Talent / Zone of Genius** | The role they play really well; the contribution only they can make | Top Talent reveal + Excalibur deeper view |
| **Assets** | What they bring — knowledge, community, product, capital, network | Asset Mapping module |
| **Quality of Life** | Their consciousness barometer + bandwidth state across 8 domains | QoL Map module |
| **Date of birth** | Mystic-knowledge layer — astrology / numerology / Human Design / personal year. Not yet surfaced for matching but enables a whole class of timing/design-based signal. | Captured on signup; not yet a matching input |
| **Unique business artifacts** | What they're producing or offering commercially (uniqueness, myth, tribe, pain, promise, lead-magnet, value-ladder, etc.) | UBB module — 18 artifacts |

### Dimension B — Wants and needs (the optimization goal)

What we are matching FOR. The platform doesn't yet capture this explicitly. At higher consciousness, wants and needs converge — the more developed a person is, the more "what they want" aligns with "what they actually need." For the matching engine: this is the demand-side signal. Without it, we know what a person IS but not what they're LOOKING FOR.

**How to capture wants/needs:** the user's own AI can extract these from prior conversations (similar pattern to Mission Discovery — paste an AI response in, capture the synthesis). The user articulates wants/needs explicitly; the platform stores them as another profile primitive.

**Optimization goal restated:** every match is a connection between (one person's primitives + wants/needs) and (another person's primitives + wants/needs) towards **collaboration** — joint activity producing impact and returns (monetary or otherwise). Secondary mode: information / gift exchange, where the complementarity enables mutual enrichment without commercial framing.

## 3. The primitive → use-case map

This is the core of the matching engine: each primitive (or combination of primitives) generates a specific matching outcome.

| Primitive | Similarity reads as | Dissimilarity reads as |
|---|---|---|
| **Lifelong dedication** (mission) | Strong co-founder signal — two people moving in the same direction are prone to building together | Cross-pollination / weak signal — divergent missions rarely co-found, but can cross-fertilize ideas |
| **Role / Top Talent** | **Guild / peer learning** — similar talents share craft, enrich each other's perspectives, gift-exchange info | **Complementary partnership** — diametrically opposite roles fill each other's gaps |
| **Assets** | Redundancy — limited matching value when two people have the same assets | **LEGO plug-and-play** — one's community + another's product = a whole. AI's strongest matching domain; assets compose into joint capability |
| **Quality of Life** | **Consciousness barometer** — people at similar QoL stages attract / can sustain working together. Diverging QoL = mutual repulsion under collaborative stress | (asymmetric — high-QoL person can still support a lower-QoL person, but the reverse doesn't hold; this is a one-way compatibility check, not a symmetric match) |
| **Date of birth** | (timing alignment — e.g., compatible personal years, design types) | (design complementarity — e.g., different Human Design types that synergize) |
| **Unique business artifacts** | Aligned offer / tribe / promise → potentially redundant or competitive | Aligned offer to OTHER's tribe → cross-promotion, partnership, integration opportunities |

### The compound outcomes

The most powerful matching outcomes are **compounds** of multiple primitives:

| Compound | Use case | Status |
|---|---|---|
| **Mission similarity + Role complementarity** | **Co-founder match** ("genius match" in the current platform — already shipped) | ✅ Built |
| **Mission similarity + Role similarity** | **Guild / mastermind match** — peer learners in the same direction | 🔶 Implied; not yet first-class |
| **Asset complementarity (alone)** | **LEGO collaboration** — community + product, capital + idea, etc. | 🔶 Next — needs DB-backed assets first |
| **Role similarity (alone)** | **Gift-exchange / peer-enrichment match** — same craft, share insight | 🔶 Implied |
| **QoL stage similarity** | **Compatibility filter** applied on top of any other match — not a match type alone, but a quality multiplier | 🔶 To wire as a filter |

**Quality of Life serves a different role from the other primitives.** It's not generative of new matches; it's a **filter / barometer** that ensures any other match is compatible at the consciousness layer. People at very different QoL stages will repel under sustained collaboration even if other primitives align.

## 4. The optimization function (informal)

A match between Person A and Person B for the COLLABORATION outcome can be informally scored as:

```
score(A, B) = mission_alignment(A, B)
            × role_complementarity(A, B)         ← OR role_similarity, depending on intent
            × asset_plug_and_play(A, B)
            × QoL_compatibility(A, B)            ← multiplier, not generator
            + (optional) mystic_alignment(A, B)
            + (optional) artifact_synergy(A, B)
```

For the GIFT-EXCHANGE / LEARNING outcome:

```
score(A, B) = role_similarity(A, B)              ← OR role_dissimilarity for cross-domain
            × asset_plug_and_play(A, B)
            × QoL_compatibility(A, B)
            (no mission_alignment requirement — info exchange doesn't need direction match)
```

The intent of the search (co-founder vs. peer-learner vs. gift-exchange) determines which compound is computed.

## 5. What's known vs. unknown about complementarity

Sasha raised: "I refer to complementarity, but complementarity is basically the same word for a high match — when one complements the other... is this a known phenomenon in matching?"

Two patterns are well-documented in the matching / collaboration literature:

- **Homophily** — people prefer to connect with similar others (mission, values, identity). Strong predictor of trust formation, sustained collaboration, peer learning. Sociology / network science (McPherson et al. 2001).
- **Heterophily / Skill complementarity** — teams perform better when members bring complementary skills, especially under non-routine creative work. Co-founder research at YC, Wasserman's *The Founder's Dilemmas*, and Reagans-Zuckerman team-diversity literature all support this.

The synthesis Sasha is articulating — **mission similarity + role complementarity = best co-founder fit** — maps directly to this dual-pattern finding. Homophily on values/direction, heterophily on skills/contribution. Not novel research, but a precise framing of two well-established findings combined.

## 6. Pragmatic next moves (parked for prioritization, not action)

Three buckets, in roughly the order they unlock progressive matching capability:

1. **Surface wants/needs as a first-class profile primitive.** New module, parallel to Mission Discovery — same paste-AI-response pattern. Save a wants/needs blob (or 3-5 structured items) on the profile. Unlocks demand-side matching.
2. **Promote Top Talent applications to a queryable surface.** Per the prior architectural download — the "role they play really well" is currently buried inside Excalibur deep view. Surface it as a list of discrete applications (with valence: love-doing / can-do / proven). This is the JOIN key for role-similarity and role-complementarity matching.
3. **Persist assets in DB (not localStorage) and add asset-complementarity scoring.** Per the older sections of this doc — known dependency. Once assets are queryable, the LEGO matching becomes the most powerful new match-type.

## 7. Project + ecosystem layers (parked, deferred)

Not building these now. When they come:

- **Project profile** = same primitives as person, in project-shape. Mission (project mission), roles (roles needed, not held), assets (project assets), QoL (project bandwidth / health), wants/needs.
- **Ecosystem profile** = aggregation of project profiles + emergent coordinates that are not present in any single project (shared norms, governance, distribution channels, narrative arc).
- **Person-leader as proxy** for project-matching in v1 — until project profiles exist, match the leader and treat the project as their extended hand. Workable for most cases (every project has one ultimate decision-maker).

## 8. Open questions parked from the download

- Should QoL be a hard filter (block matches below a similarity threshold) or a soft multiplier (down-rank but still show)? Soft is safer for v1; hard requires more confidence in the QoL stage signal.
- How aggressively to weight mystic signals (DoB-derived)? Probably keep optional / off-by-default for v1, on-by-default in a future "deep matching" tier.
- Wants/needs format: free-text sentence (like Mission Discovery) vs. structured array (3 wants + 3 needs)? Open question — free-text first probably, structured emerges from analysis later.
- **Document-creep guard:** when v3 of matchmaking strategy lands, append below "The Day 66 Download" with a "Day NN Download — v3" header and mark the v2 sections as superseded. Do NOT create a new top-level matchmaking doc.
