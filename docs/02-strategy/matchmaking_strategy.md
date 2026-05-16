# Matchmaking Strategy

> **Core Insight:** Matching is the optimization function the entire platform converges on. Every profile primitive — Top Talent, mission/lifelong-dedication, assets, Quality of Life, date of birth, unique business artifacts — exists *in order to* feed the matching engine. The engine connects people (later: projects, ecosystems) toward **collaboration**: joint activity producing impact and returns. The output is value created together that neither party could produce alone.

> **Document genealogy:** integrated Day 66 (Sasha, May 16, 2026). Synthesized from v1 (March 31) "Trojan Horse + 5-match-type" framing and the Day 66 "primitive-driven holarchic engine" download. Older v1-appended-with-v2-below version preserved in git at commit `76f101d3` for anyone tracing the lineage. When v3 lands, EDIT THIS DOCUMENT IN PLACE — do not stack appendices or create sibling docs. Document-creep is the explicit anti-pattern.

---

## 1. What we're building, why it matters

### The matching engine is the platform's center

Everything the user does on the platform — taking the reveal, activating the deeper view, mapping assets, completing QoL, discovering mission, generating UBB artifacts — feeds the same downstream function: **finding the people whose collaboration with them creates new value.** The activation surfaces aren't ends in themselves; they're how we accumulate the primitives the matching engine queries against.

This reframes the whole product:

- The Top Talent reveal isn't (only) about self-knowledge — it's the matching pivot.
- The mission isn't (only) about clarity — it's a direction filter.
- Assets aren't (only) inventory — they're plug-and-play LEGO blocks.
- QoL isn't (only) reflection — it's the consciousness barometer that determines compatibility.
- Date of birth isn't (only) metadata — it's the mystic / timing / design layer.
- UBB artifacts aren't (only) business documents — they're tribe-shape descriptors.

Every primitive serves the match. The match serves collaboration. Collaboration is the goal.

### Strategic role — the Trojan Horse funnel

Matchmaking ALSO functions as a low-friction entry into the platform, in parallel to the pain-recognition funnel:

```
ENTRY 1 (Pain):       Pain → Session → Canvas → Build → Node
ENTRY 2 (Connection): Matchmaking → Profile (auto-built) → Connection → Recognition → Session → ...
```

**The Pull** at Entry 2 is "find your missing piece / co-founder / complementary genius / asset." **The Gate** is profile creation — entering the pool requires building the profile. **The Stealth Mapping** is that creating the profile implicitly captures all the primitives (Uniqueness OS, mission, assets, QoL). **The Trojan Horse:** the user came for the network. As the system reflects their pattern back to them through the matches it surfaces, they experience the platform's intelligence — and *that* drives them toward the full session.

**Distribution consequence:** every successful match creates two satisfied users who inherently bring others into the system. The platform self-distributes through the matching surface.

---

## 2. The matching primitives

### Dimension A — Profile primitives (the inputs)

What the platform collects from / produces for each user. These are the inputs to every matching query.

| Primitive | What it captures | Status today |
|---|---|---|
| **Top Talent / Unique Talent / Zone of Genius** | The role this person can play really well; the contribution only they can make. Generates a list of **discrete applications** (the queryable surface for role-based matching). | Top Talent reveal + Excalibur deeper view. Applications currently buried inside deep view; not yet a first-class queryable list. |
| **Lifelong dedication** (formerly "mission") | What this person is here to do; the direction they move; the change they're trying to create. Day 66 rename — preserve "mission" in code/schema for now to avoid breakage. | Mission Discovery surface — saves one sentence to `game_profiles.mission_statement`. |
| **Assets** | What they bring — knowledge, community, product, capital, network, expertise, technology, audience. LEGO blocks of joint capability. | Asset Mapping module. DB-persisted (post Day 65 wave 4). |
| **Quality of Life** | Their consciousness barometer + bandwidth state across 8 domains. Filter/multiplier, not generator (see §4). | QoL Map module. DB-persisted. |
| **Date of birth** | Mystic-knowledge layer — astrology / numerology / Human Design / personal year. Not yet a matching input. | Captured on signup. |
| **Unique business artifacts** | What they're producing or offering commercially — the 18 UBB artifacts (uniqueness, myth, tribe, pain, promise, lead-magnet, value-ladder, etc.). Tribe-shape, offer-shape, value-shape descriptors. | UBB module. DB-persisted. |

### Dimension B — Wants and needs (the optimization goal)

Wants/needs are *what we're matching FOR*. The primitives are what each user IS; wants/needs are what they're LOOKING FOR. Without wants/needs, the engine knows the supply side but not the demand side — it can rank by similarity/complementarity but can't focus on what the user actually wants to find right now.

**Key claim:** at higher consciousness levels, wants and needs converge. The more developed a person is, the more "what they want" aligns with "what they actually need." This means the wants/needs primitive is more reliable for high-consciousness users; for less-developed users, wants/needs may diverge from what would actually serve them, and the engine should weight other primitives more heavily.

**Status:** **Not yet captured.** This is the biggest gap. The next leveraged platform addition is a wants/needs surface — paste-AI-response pattern parallel to Mission Discovery, with a structured wants/needs blob saved to the profile. *This is the precondition for the matching engine to fire on intent, not just supply.*

---

## 3. The primitive → match-outcome map

Each primitive — alone or in combination — generates a specific matching outcome. The engine is the set of these mappings.

### Single-primitive matches

| Primitive | High similarity → | High dissimilarity → |
|---|---|---|
| **Lifelong dedication** | Co-founder direction signal — two people moving toward the same change are prone to building together | Cross-pollination only — divergent missions rarely co-found |
| **Top Talent / Role** | **Guild / peer-learning** — same craft, share insight, gift-exchange knowledge | **Complementary partnership** — diametrically opposite roles fill each other's gaps |
| **Assets** | Redundancy — limited match value when supply overlaps | **LEGO plug-and-play** — community + product, capital + idea, audience + expertise. AI's strongest matching domain; assets compose into joint capability |
| **Quality of Life** | **Compatibility** — people at similar QoL stages can sustain working together | One-way only — a higher-QoL person can support a lower-QoL person, but the reverse strains and eventually breaks |
| **Date of birth** | Timing alignment (compatible personal years; resonant designs) | Design complementarity (e.g., different Human Design types that synergize) |
| **Unique business artifacts** | Aligned tribe/offer → potential redundancy OR market alliance | Adjacent tribes → cross-promotion, partnership, integration opportunities |

### Compound matches — the most powerful

The platform's existing "genius match" is already a compound. v2 names this explicitly and identifies the others:

| Compound | Outcome | Status |
|---|---|---|
| **Mission similarity + Role complementarity** | **Co-founder match** — same direction, complementary skills. Homophily on values, heterophily on contribution. | ✅ Built (current "Genius Match" feature) |
| **Mission similarity + Role similarity** | **Guild / mastermind match** — peer learners moving the same way | 🔶 Implicit; not surfaced as a distinct type |
| **Asset complementarity (alone)** | **LEGO collaboration** — community + product, etc. The single most powerful AI-driven match domain | 🔶 Next — already DB-persisted; needs matching surface |
| **Role similarity (alone)** | **Gift-exchange / peer-enrichment** — same craft, mutual insight exchange. No mission alignment needed; info flows regardless of direction. | 🔶 Implicit |
| **QoL similarity** | **Compatibility multiplier** applied on top of any other match — not a match type alone, but a quality gate | 🔶 To wire as a filter |

---

## 4. Quality of Life is not a match type — it's a compatibility filter

The v1 doc listed "Growth Pairing — QoL weak spots" as a future match type. v2 reframes: QoL is **not generative of matches** but **filters / multiplies** matches generated from other primitives.

The reasoning: people at very different QoL stages experience sustained collaboration as friction. A stage-5 wealth person and a stage-1 wealth person can co-create, but they pull in different directions under stress (the stage-5 wants long-horizon impact moves; the stage-1 needs cash flow this month). The collaboration burns out unless one is explicitly supporting the other (asymmetric mentor relationship, not symmetric collaboration).

**Implication for the engine:** QoL never adds a match — it can only reduce one. A 0.9 similarity-on-primitives match between QoL-divergent people gets multiplied down to 0.5; the engine surfaces other matches first.

**Caveat / blind spot (flagged for validation):** this is currently Sasha's working hypothesis backed by his lived experience with the 7-founder collective, not empirically validated across a larger user base. Worth treating as `assumption-to-test` until match outcomes can be tracked against QoL stage divergence.

---

## 5. Informal scoring functions

For the **COLLABORATION** outcome (default, especially co-founder match):

```
score(A, B) =   mission_alignment(A, B)
              × role_complementarity(A, B)         ← OR role_similarity, depending on intent
              × asset_plug_and_play(A, B)
              × QoL_compatibility(A, B)            ← multiplier, not generator
              + (optional) mystic_alignment(A, B)
              + (optional) artifact_synergy(A, B)
```

For the **GIFT-EXCHANGE / PEER-LEARNING** outcome:

```
score(A, B) =   role_similarity(A, B)              ← OR role_dissimilarity for cross-domain learning
              × asset_plug_and_play(A, B)
              × QoL_compatibility(A, B)
              (no mission alignment requirement — info flows regardless of direction)
```

The intent of the search (co-founder vs. peer-learner vs. gift-exchange) determines which compound the engine computes. The intent comes from the user's wants/needs primitive once it's captured.

---

## 6. Homophily and heterophily — the literature grounding

The "mission similarity + role complementarity = best co-founder fit" framing maps directly to two well-established findings in collaboration / team / network research:

- **Homophily** (McPherson et al. 2001, network sociology) — people prefer to connect with similar others on values, identity, direction. Strong predictor of trust formation and sustained collaboration.
- **Heterophily / Skill complementarity** (Wasserman 2012 *The Founder's Dilemmas*; Reagans-Zuckerman team-diversity work; YC's co-founder research) — teams perform better when members bring complementary skills, especially under non-routine creative work.

The compound match is **homophily on values + heterophily on skills**. Not a novel discovery; a precise synthesis of two well-established findings combined into a single matching primitive.

---

## 7. The holarchy — three layers of profiles, six matching combinations

| Layer | What it is | Has a profile today? |
|---|---|---|
| **Person** | Individual human | Yes — the platform builds it |
| **Project** | Organization, team, group of people. In practice always has ONE ultimate decision-maker (the leader). | No — schema doesn't exist; users may create them over time |
| **Ecosystem** | A group of groups. Network of projects with shared coordinates (norms, governance, distribution, narrative arc). | No |

Six matching combinations follow:

```
person ↔ person       ← v2 focus
person ↔ project
person ↔ ecosystem
project ↔ project
project ↔ ecosystem
ecosystem ↔ ecosystem
```

**Project-leader as proxy** for v1 of project-matching: until project profiles exist, match the leader-person and treat the project as their extended hand. Workable for most cases (every founder-led startup has one ultimate decision-maker). **Caveat / blind spot** (flagged for the assumption): not all projects have a single leader — DAOs, true co-CEO arrangements, partnerships of equals — and projects have NEEDS that aren't the leader's needs (a startup needs a CTO; the founder doesn't personally). The leader-proxy works as a v1 shortcut; it doesn't replace true project profiles.

---

## 8. Implementation status

### Already shipped

- `src/pages/Matchmaking.tsx` — shows 3 match categories (Complementary Genius, Similar Genius, Similar Mission)
- `src/lib/archetypeMatching.ts` — complementarity logic on Top Talent archetypes
- `src/components/MatchCard.tsx` — Pass/Connect UI (connect action incomplete)
- Filters: location, language

Data sources used today:
- Unique Gift (`appleseed_data` from zog_snapshots)
- Mission commitments (currently `mission_participants`; will migrate to `mission_statement` on game_profiles)

Data sources NOT yet used:
- Top Talent applications as a discrete queryable list
- Wants/needs (primitive doesn't exist yet)
- Assets (DB-persisted Day 65; not yet a matching input)
- Quality of Life
- Date of birth / mystic layer
- Unique business artifacts

### Scale architecture

| Scale | Approach |
|---|---|
| **≤ 1,000 users** (current) | Brute-force O(n²) comparison, cached server-side, recomputed on profile change |
| **10,000+ users** (future) | Profile → synthesized text → embedding → pgvector. Query: `ORDER BY embedding <=> $target LIMIT N`. Approximate-nearest-neighbor brings it to O(log n). |

**Supabase-ready transition:** add `profile_embedding` column to `game_profiles`; edge function generates embedding on profile update; queries switch to vector cosine.

---

## 9. MVP scope (current sprint priorities)

### Must have (to make the existing matchmaking surface actually function)

- [ ] Connect button does something real (email handshake, in-platform connection request, etc.)
- [ ] Intra-community filtering (by cohort/program if applicable)
- [ ] Page rename: "Matchmaking" → "Discover" (cosmetic but signals the intent shift — discovery vs. transaction)

### Next (unlock the higher-leverage primitives)

- [ ] Surface Top Talent applications as a queryable list (currently buried inside Excalibur deep view)
- [ ] Persist wants/needs as a first-class profile primitive (new module, paste-AI-response pattern)
- [ ] Add asset-complementarity scoring to the matching engine
- [ ] AI-generated match explanation ("Why collaborate") — surfaces the WHY of each match

### Future (scale + breadth)

- [ ] pgvector embedding column
- [ ] Inter-community matching
- [ ] QoL compatibility multiplier wired into score
- [ ] Mystic / DoB alignment layer (optional, off-by-default for v1, on for a future "deep matching" tier)
- [ ] Project profile schema (lifts the project-leader-proxy approximation)
- [ ] Match outcome tracking — did a surfaced match lead to actual collaboration? Feedback loop into the engine.

---

## 10. Community phasing — complementary to the holarchy

The holarchy in §7 describes WHAT layers exist (person / project / ecosystem). The community phasing is a separate cut: HOW MANY communities the platform serves at once.

**Phase 1 — Community Tool (current):** the platform serves ONE community at a time. All matching is intra-community (same cohort, same trust container). High trust, fast iteration, value proven quickly. Most appropriate while user count is small and trust friction would dominate match value.

**Phase 2 — Community of Communities (future):** multiple tribes on the platform. Inter-community matching unlocked. Introduction/trust layer needed (vouching, cohort badges, opt-in cross-pollination). Network effects begin.

**Transition trigger:** 3–5 thriving tribes using the tool internally with proven intra-community match outcomes.

The holarchy (§7) and the community phasing here are orthogonal — Phase 1/Phase 2 is about how communities relate; person/project/ecosystem is about the layers within and across communities.

---

## 11. Three pragmatic next moves (priority-ordered)

1. **Build the wants/needs primitive.** Paste-AI-response surface parallel to Mission Discovery. Save as `wants_and_needs TEXT` (or two columns, `wants TEXT` + `needs TEXT`, structured) on `game_profiles`. Unlocks demand-side matching. Smaller than Mission Discovery was; ~2 hours of implementation. **Status: parked for prioritization.**

2. **Promote Top Talent applications to a first-class queryable surface.** Schema: `top_talent_applications(id, user_id, application_label, context_tags, valence, source, created_at)`. Surface on `/game/me/zone-of-genius/applications`. Becomes the JOIN key for role-similarity AND role-complementarity matching. **Status: parked for prioritization.**

3. **Add asset-complementarity scoring + wire it into the matching engine.** DB-persisted assets exist (Day 65). What's missing: the scoring function (`asset_plug_and_play(A, B)`) and the match-surface that displays "your community + their product = a thing" matches. **Status: parked for prioritization.**

---

## 12. Open questions

Carried forward from v2 + surfaced during synthesis:

- **QoL filter behavior** — hard cutoff (block matches below threshold) or soft multiplier (down-rank but still show)? Soft is safer for v1; hard requires more confidence in the QoL signal.
- **Mystic / DoB weighting** — probably off-by-default for v1, on by default in a future "deep matching" tier. Trust implications — many users will be skeptical; surface this layer openly, not silently.
- **Wants/needs schema shape** — free-text sentence (one extracted line) vs. structured array (top-3 wants + top-3 needs vs. tagged categories). Free-text first probably; structured emerges from analysis later.
- **Project layer hand-off** — when does the project-leader proxy break down and require true project profiles? Probably when a multi-founder project sets matching preferences that diverge from any single co-founder's preferences.
- **Romantic / platonic boundaries** — the primitives largely apply to romantic matching too. The platform explicitly excludes this for v2 (professional focus). Will users self-divert anyway? Should the system route those signals elsewhere?
- **Trust + safety + abuse prevention** — gap in both v1 and v2. People will game profiles to surface in front of high-value users. Reputation, verification, blocking — all out of scope today; all real questions at scale.
- **The "connect" action mechanic** — Pass/Connect UI exists, but what does Connect actually DO? Email? In-platform request? Direct intro? Unspecified in both v1 and v2.
- **Match outcome feedback loop** — did surfaced matches lead to actual collaboration? Without measurement, the engine can't improve. Out of scope today; required for the engine to mature.

---

## 13. Genealogy

- **v0 (Feb 17, 2026):** original matchmaking docs at `docs/00-intro kit/archived/matchmaking_strategy.md`, `docs/06-architecture/matchmaking_architecture.md`, `docs/07-technology/matchmaking_engine.md`. Engineering-leaning; subordinated to v1's strategic framing.
- **v1 (March 31, 2026):** Trojan Horse + 5-match-type framing in this file. Pulled the engine up into strategy. Preserved here as foundational concepts that v2 didn't replace.
- **v2 (May 16, 2026, Day 66):** primitive-driven holarchic engine download. Reframed match-types as compounds of primitives; added wants/needs dimension; added holarchy; added scoring sketches.
- **Synthesized (May 16, 2026):** this version. v1 strategic framing (Trojan Horse, community phasing, scale architecture, MVP scope) integrated with v2 engine theory (primitives, wants/needs, compounds, holarchy, scoring).

**Anti-pattern note for v3:** edit this document in place. Do not stack v2-style appendices or create sibling docs. Document-creep is the explicit anti-pattern.
