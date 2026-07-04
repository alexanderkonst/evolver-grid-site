# Matchmaking Strategy

> **Core Insight:** Matching is the optimization function the entire platform converges on. Every profile primitive — Top Talent, mission/lifelong-dedication, assets, Quality of Life, date of birth, unique business artifacts — exists *in order to* feed the matching engine. The engine connects people (later: projects, ecosystems) toward **collaboration**: joint activity producing impact and returns. The output is value created together that neither party could produce alone.

> **Document genealogy:** v3 integrated Day 80 (Sasha, May 22, 2026). Locks the algorithm to a 4-input scoring model after an audit found production matching had drifted into opaque LLM judgment with neither QoL nor structured asset taxonomy in the signal. v2 integrated Day 66 (Sasha, May 16, 2026), synthesized from v1 (March 31) "Trojan Horse + 5-match-type" framing and the Day 66 "primitive-driven holarchic engine" download. Older v1-appended-with-v2-below version preserved in git at commit `76f101d3` for anyone tracing the lineage. v3 supersedes §3, §4, §5 of v2 in place per the "no document-creep" rule.

---

## 0. Civilizational anchoring

The matching engine is not a feature. It is the **operational substrate of the platform's lifelong dedication**: *assist humanity evolve into a consciously coordinated civilization by awakening individual genius, integrating consciousness with technology, and architecting systems that transform human potential into coherent collective flourishing.*

Conscious coordination at civilizational scale happens through real collaborations between consciously developed humans. The platform's developmental work (Top Talent reveal, mission discovery, asset mapping, QoL, UBB) wakes up the individual genius. The matching engine is the gravitational force that connects those awakened individuals into coherent networks. Without matching, the platform produces transformed individuals who don't find each other. With matching, the transformed individuals form the conscious-coordination layer the lifelong dedication aims at.

Every design decision in the rest of this document is downstream of this anchor. When trade-offs arise (privacy vs. discoverability, monetization vs. accessibility, scope of who-matches-whom), the tiebreaker is: *does this produce more real collaborations between consciously developed people, or fewer?*

---

## 0.5. The data moat

The engine's quality is directly downstream of input quality. The matching code itself — scoring functions, opt-in mechanic, intro emails — can be replicated by any competent team. **What can't be replicated is the data the engine queries against.** FYTT's profile primitives (six of them, each with developmental depth) are richer than anything available on the market:

| Platform | Matching substrate |
|---|---|
| LinkedIn | Job titles, employer, connection graph |
| Bordy AI | Stated interests + brief calendar context |
| Co-founder matching apps (YC etc.) | Skills + sector + stage |
| Most dating apps | Selected traits + photos |
| **FYTT** | **Top Talent (with discrete applications) + mission + assets + QoL stage + DoB-derived mystic data + 18-artifact business profile + (soon) wants/needs** |

This is the moat. The matching engine's job is to deserve the data — produce match quality proportional to the input richness. Any future strategic decision (open API, partnership, acquisition offer) should be evaluated against whether it preserves or dilutes this data moat. The data wasn't accumulated by chance; it was built through the developmental work the rest of the platform does, deliberately and over time. The engine compounds it.

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

### Dimension B — Wants and needs (an additional primitive, not a precondition)

Wants/needs is *another profile primitive*, capturing what each user is looking for right now. Adds a demand-side signal alongside the supply-side primitives in Dimension A. **Important: the engine works without it.** The other primitives (Top Talent, mission, assets, QoL, DoB, UBB artifacts) generate matches on their own; wants/needs enriches those matches by aligning them to expressed intent. Valuable, not load-bearing.

**The convergence claim:** at higher consciousness levels, wants and needs converge — the more developed a person, the more "what they want" aligns with "what they actually need." Implication for the engine: weight wants/needs more heavily for users where the convergence holds, less for users where wants are surface-noise. How the engine *infers* that convergence — open implementation question (§12).

**Status:** **Not yet captured.** Worth building, but other primitives keep the engine functional in the meantime. Schema sketch: paste-AI-response surface parallel to Mission Discovery, with a single text field on `game_profiles` (`wants_and_needs TEXT`) OR two separate fields (`wants TEXT`, `needs TEXT`). Splitting in the prompt vs. asking the AI to handle both as one blob — open question (§12).

---

## 3. The four canonical inputs (v3, Day 80)

v3 collapses the v2 single-primitive / compound-primitive split. Production matching uses **four canonical inputs** with explicit scoring directions. Every match is scored on all four; there is no mode selector and no separate "type" of match generated by any single primitive in isolation.

| Input | What it scores | Direction | Data source |
|---|---|---|---|
| **Top Talent** | How well their gift complements yours (your shadow filled, their gift drawn out) | Score rises with COMPLEMENTARITY | `appleseed.topTalentProfile.top_three_talents_compact` + `appleseed.vibrationalKey.name` + `appleseed.threeLenses.primeDriver` |
| **Mission** | How aligned the directions you're each moving in are | Score rises with SIMILARITY | `game_profiles.mission_statement` (one-sentence) and `mission_participants.mission_title` (when shared) |
| **Assets** | How well your assets plug together to form a larger whole (LEGO-block fit) | Score rises with COMPLEMENTARY COVERAGE | `user_assets` rows (type, sub-type, category, maturity) |
| **Quality of Life** | How similar your consciousness stages are (proxy for compatibility under stress) | Score rises with SIMILARITY | latest `qol_snapshots` row (8 axes) |

**Why four, not six (no DoB, no UBB artifacts):** DoB-driven matching (astrology / Human Design) is parked. UBB artifacts are downstream of the four canonical inputs; they refine but do not generate matches. When the four-input engine is producing strong matches, UBB can layer on as a refinement signal — but not before the substrate is solid.

**Why these four, why this scoring direction:** Top Talent complementarity captures the "different gifts compose into joint capability" insight. Mission similarity captures the homophily-on-values finding from the literature (§6). Asset Lego-fit captures the "what we bring together exceeds what we bring apart" intuition. QoL similarity captures the consciousness-compatibility filter — collaboration between people at very different developmental stages strains under load (§4 below).

**The v2 compound types (co-founder, guild, LEGO, peer, gift-exchange) are retired as match TYPES.** They become emergent descriptions the rationale-writing layer can use to characterize a specific pairing, but they no longer drive the scoring or the UI category structure. A match between two people IS a (Top Talent complementarity, Mission similarity, Asset fit, QoL similarity) tuple. The composition function (§5) produces ONE resonance score from that tuple. The rationale prose names the pattern (co-founder, peer, etc.) when the tuple shape suggests it.

---

## 4. Quality of Life as similarity input (v3 update)

**v3 revision (Day 80, 2026-05-22):** QoL is one of the four canonical inputs (§3). It contributes additively to the resonance score per the composition function in §5, not as a separate multiplier or filter.

**Direction:** more similarity = higher match score. People at similar consciousness stages can sustain collaboration; people at very different stages experience the divergence as friction under load.

**Mechanism:** 8 QoL axes (health, wealth, love & relationships, social ties, growth, impact, happiness, home) form an 8-dimensional vector. Similarity = `1 − normalized_euclidean_distance(A, B)`. Two profiles at identical stages score 1.0; maximally divergent profiles score 0.0.

**Why the v2 "multiplier-only" framing was revised:** v2 modeled QoL as never-additive (it could only reduce a match). Operationally that pattern is unstable because users without QoL data would have their best matches dampened by neutral fallback values, and QoL-aligned strong matches got no extra credit. v3 makes QoL one of four equal-status inputs — strong on all four = strong match; weak on QoL with strong on the other three = still a decent match (just not the strongest the system can find).

**Missing-data handling:** if either user lacks a QoL snapshot, the QoL similarity score defaults to 0.5 (neutral). The composition function (§5) tolerates this gracefully.

**Status (v3):** wired into production matching as of Day 80 refactor (see §9).

---

## 5. Scoring functions (v3, Day 80 — canonical)

### 5.1 Composition function — geometric mean of four normalized sub-scores

```
resonance(A, B) = 100 × ⁴√( top_talent(A,B) × mission(A,B) × assets(A,B) × qol(A,B) )
```

Each sub-score is normalized to `[0, 1]`. Final resonance is `[0, 100]`.

**Why geometric mean (not arithmetic, not pure multiplicative):**
- **Arithmetic mean** (weighted sum) is too forgiving: one input at 1.0 and three at 0 gives 0.25 — a false-positive signal. The platform's purpose is connecting people whose ENTIRE profile resonates, not just one slice.
- **Pure multiplicative** is too punishing: missing QoL (neutral 0.5) caps the whole match at `0.5 × 1 × 1 × 1 = 0.5` even when the other three are perfect.
- **Geometric mean** is the right curve: every input pulls its weight, but a single weak input doesn't crater the score. All four at 0.5 → 50; one at 1.0 and others at 0.5 → ~59; two at 1.0 → ~71; all four at 1.0 → 100. Strong overall match requires strong inputs across the board, but partial profiles still produce useful signal.

**Missing-data handling:** any sub-score for which data is genuinely absent defaults to 0.5 (neutral). This means partial profiles score lower than full profiles by design — the engine prefers users who have completed onboarding because they generate higher-confidence matches.

### 5.2 Top Talent complementarity

```
top_talent(A, B) ∈ [0, 1] — higher when their gifts complement yours
```

**Inputs:** for each user, the concatenated string of `top_three_talents_compact` + `vibrationalKey.name` + `threeLenses.primeDriver`. This is the user's "gift signature."

**Method:** semantic complementarity is the hardest of the four to formalize. v3 implements it as **LLM-judged on a structured rubric**, narrowed scope and deterministic output. The matching edge function passes two gift signatures to the model with the prompt: "Rate from 0.0 to 1.0 how complementary these two talent profiles are — 0 means redundant (same gifts, same shadow), 1 means fully complementary (their gift fills your shadow and vice versa). Reply with a single number." Low temperature (0.1) for determinism.

**Future hardening:** as the platform accumulates labeled pairs (Sasha's gold set + match-success feedback from §8), the LLM judgment gets validated against ground truth. If it correlates poorly, swap to embedding-distance with INVERTED distance (closer to fully-complementary anchor archetypes) or a learned model. v3 ships the LLM-judged path because it's the only one with realistic accuracy on day 1.

### 5.3 Mission similarity

```
mission(A, B) ∈ [0, 1] — higher when their lifelong dedications point the same way
```

**Inputs:** `mission_statement` strings from each `game_profiles` row. Falls back to `mission_participants.mission_title` if statement absent.

**Method:** semantic similarity via text-embedding cosine. v3 uses the same LLM gateway with an embedding endpoint (or, if cleaner, calls the rationale model with a tight similarity rubric — see implementation note in §9).

**Edge case:** if a user has no mission, sub-score defaults to 0.5. The engine surfaces these matches but they'll score lower than mission-aligned pairs.

### 5.4 Asset Lego-block fit

```
assets(A, B) ∈ [0, 1] — higher when assets compose into a larger whole
```

**Inputs:** `user_assets` rows for each user. Each row has `type_id` (one of 6 canonical: Expertise, Life Experiences, Networks, Material Resources, Intellectual Property, Influence), `sub_type_id`, `category_id`, plus free-text title + description.

**Method (v3 initial — categorical coverage + depth complementarity):**

1. For each user, build a **type-presence vector** over the 6 canonical types (1 if they have at least one asset of that type, 0 otherwise).
2. **Coverage complementarity** = (size of union) / 6. Two users together covering all 6 types score 1.0 on this component; two with identical 1-type coverage score 0.17.
3. **Depth complementarity bonus** = for each type, +0.10 if one user has 2+ assets in that type and the other has 0. Caps at +0.4 total.
4. Combine: `assets = min(1.0, coverage_complementarity + depth_bonus)`.

**Why this shape:** captures Sasha's "LEGO blocks plug together to form a larger whole" intent. Two solo experts in the same single domain are NOT a Lego match — they're substitutes. Two people whose types cover orthogonal ground compose into joint capability.

**Future hardening (v4):** add sub-type and category-level cross-references (e.g., "audience" + "product" is a stronger LEGO than two random complementary types). For v3, the type-level shape is the right granularity — finer-grained taxonomies need real match-success data to validate the weights.

### 5.5 QoL similarity

```
qol(A, B) ∈ [0, 1] — higher when consciousness stages align
```

**Inputs:** latest `qol_snapshots` row per user. 8 numeric axes (`health_stage`, `wealth_stage`, `love_relationships_stage`, `social_ties_stage`, `growth_stage`, `impact_stage`, `happiness_stage`, `home_stage`), each in `[0, 7]`.

**Method:**
1. Form 8-dim vectors `v_A`, `v_B`.
2. Compute euclidean distance `d = ‖v_A − v_B‖`.
3. Max possible distance over 8 axes of range 7 is `√(8 × 49) ≈ 19.8`.
4. `qol(A, B) = 1 − (d / 19.8)`.

Two identical QoL vectors score 1.0. Two maximally divergent (one at 0 everywhere, one at 7 everywhere) score 0.0.

**Missing-data handling:** if either user lacks a QoL snapshot, returns 0.5.

### 5.6 Output contract

Every match the engine surfaces carries:

```
{
  resonanceScore: number (0-100, geometric-mean of sub-scores × 100),
  subScores: {
    topTalent: number (0-1),
    mission: number (0-1),
    assets: number (0-1),
    qol: number (0-1),
  },
  // The rationale-writer layer adds these, derived from the sub-scores + raw profiles:
  matchType: "co-founder" | "collaborator" | "peer" | "mentor" | "client-fit",
  collaborationProposal: string,  // 1-2 sentences, specific
  suggestedAction: "intro" | "micro-collab" | "practice-together" | "wait",
  alignment: string,        // 1 sentence on Mission similarity (what they share)
  complementarity: string,  // 1 sentence on Top Talent + Asset fit (what they bring)
  friction: string,         // 1 sentence on potential friction or "None identified"
}
```

Sub-scores are persisted with the match row so debugging is auditable. The UI surfaces resonanceScore + the prose; sub-scores are admin-visible only for now.

### 5.7 Rationale-prose contract

The LLM call AFTER scoring writes the human-readable explanation. Its job is narrow:

- **Inputs given:** both profiles' raw data + the four sub-scores
- **Outputs:** the JSON fields listed in §5.6 (matchType through friction)
- **Voice:** editorial. Concrete. Specific to THESE two people. No platitudes ("you both have great energy"), no AI-tells ("I detected complementary skill sets"), no buzzwords ("AI-powered match"). Direct address ("their network reaches the customers your offer needs"). Cormorant-Garamond-if-it-were-prose register.
- **Length:** alignment, complementarity, friction = one sentence each. collaborationProposal = 1-2 sentences max.
- **The matchType is a description, not a generator.** Pick whichever single label best characterizes the pairing pattern given the sub-scores. The score is what surfaces the match; the label is just a readable handle.

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

**Project profiles will exist** when the project layer is built — they aren't reducible to the leader-person's profile. Every project (including DAO circles, co-CEO arrangements, partnerships) does have an ultimate decision-maker for any given decision context, so the LEADER question is settled — but the PROJECT itself has its own profile primitives (its mission, its needed roles, its assets, its bandwidth) that are distinct from any single member's. The project layer is parked until person-to-person matching is producing real collaborations.

**Why person↔person is the right v1 layer (the sequencing argument):** three reasons compound — (1) we already have the data for person profiles (six rich primitives accumulated by the existing platform work) but we don't yet have project profiles, so person↔person is the only layer where the engine can actually fire today; (2) person↔person is the smallest dependency chain — no new schema for profile types, no new entry surface for project creation, no new authorship/governance model for ecosystems; (3) person↔person exercises and validates the engine's core mechanics (scoring, opt-in, intro, feedback loop) at the smallest scope before we layer on project complexity. When project profiles ship, every mechanic from §8 — opt-in, intro, feedback — extends naturally. v1 proves the substrate; later layers add reach without re-litigating the engine.

---

## 8. Match interaction mechanic — the double-opt-in spec (v1)

**Design principle:** how would matching want to be in a high-consciousness, high-vibration platform? Both sides choose. AI provides the *why*. Privacy is respected. Trust is earned by mutual interest, not by reputation theater.

**Reference model:** [Bordy AI](https://bordy.ai/) and similar high-signal intro-matching systems (Lunchclub, etc.). The pattern: surface the *why* in advance; require mutual yes for any meeting to happen; let the system itself (not vouching, not credentials) be the trust layer via the mutual-interest filter.

### The flow

```
1. User A opens /matchmaking and sees a card for User B
   ↓
   The card shows B's profile + an AI-generated "why you should meet
   B" paragraph: what the collaboration would be, what the knowledge
   exchange could surface, what the complementary assets might
   produce. The text describes the MATCH, not the person.

2. A clicks "I'd like to meet" → records A's interest in B
   ↓
   System checks: has B already expressed interest in A?
     NO  → save A's interest; B will see A surfaced in their
            matches with the same AI-generated "why."
     YES → both sides have opted in; trigger the intro email
            (step 4).

3. (Parallel) B opens /matchmaking later. Sees A surfaced. Reads the
   AI-generated "why." Either yes or no.
     NO  → A is told nothing (no rejection notification). The match
            stays in A's history as "no mutual interest yet" —
            potentially re-surfacable later if B's profile evolves.
     YES → both sides have opted in; trigger the intro email.

4. THE INTRO EMAIL — single email, both A and B in To:
   Subject: "Sasha — meet your match." (or similar)
   Body:    "A and B, you've both expressed interest in meeting
            each other. Here's why the platform thought you'd
            connect: [the AI-generated 'why' paragraph]. Take
            it from here." + light suggested next-step (schedule
            a call / pick a time / send a hello).

5. The intro email firing is the **high-trust event** recorded in
   the system as a successful match — feeds the feedback loop
   that tunes the engine over time.
```

### Privacy & assets handling

- Profile details visible on the match card: everything the user already chose to surface on `/game/me/*` (their Top Talent, public mission, public assets). Private data (raw QoL scores, DoB-derived signals, draft UBB artifacts) stays internal to the engine's scoring — not displayed on cards.
- Assets: if a user added an asset to their profile, it's surfaceable in match context (the "complementary assets" line in the AI-generated why). Users can mark assets private or delete them anytime; private assets still factor into matching but aren't named in the why-text.
- The AI-generated *why* describes the MATCH (what could come of A+B), not the PERSON in a profile-reveal sense. This is the difference between Tinder (here's a person, decide) and Bordy (here's a connection-shape, decide).

### Trust + verification via mutual opt-in

Mutual interest IS the trust filter. A user gaming their profile to appear in front of high-value users only succeeds in surfacing in matches — they still don't get the intro email unless the other side independently opts in. This naturally throttles abuse without needing identity verification, vouching, or reputation scores as a v1.

(Future layer: reputation built from intro emails that led to actual collaborations — but that's downstream; the v1 mechanic is robust on its own.)

### The feedback loop signal

Every intro email fired is a **success event**: two people who saw each other's profile + the AI-generated why both said yes. That's a much higher-signal data point than a single-side click. Recorded as a `match_intros` row with `(user_a, user_b, match_score, ai_why_text, primitive_compound, created_at)`.

**Engine learning — what gets tuned by intro-success data:**

Each intro carries metadata about WHICH primitive compound generated the match (mission-similarity + role-complementarity, asset-LEGO, role-similarity-alone, etc. per §3). Over time, the engine can observe per-compound intro rates and tune the score weighting:

| Observed pattern | Engine response |
|---|---|
| Asset-LEGO compound produces 40% intro-rate; mission-similarity-alone produces 20% | Increase asset-complementarity weight in the score; surface asset-LEGO matches earlier |
| User X gets 60% intro-rate on co-founder compound but 5% on peer-learning compound | Personalize X's match feed toward co-founder compound; weight peer-learning lower for X specifically |
| AI-why text v2 produces 50% intro-rate; v1 produced 30% | Promote v2 prompt to canonical (A/B testing of why-text templates) |
| Two users match strongly on primitives but never both opt in | Down-weight that compound for that pair (avoid wasting a slot) |

The learning is *empirical, per-user, per-compound*. No model training required for v1 — just rolling rate calculations updated as new intros land. ML models become useful at scale (>10k intros), not before.

**Followup signal** (post-intro, harder to capture but valuable): did the intro lead to actual collaboration? Optional self-report form sent 30 days post-intro, or organic mention captured via Asset Mapping ("collaborated with @user on X"). v1: not required; v2+: a real source of engine improvement and the highest-trust outcome data the platform can hold.

### Schema sketch

```sql
-- Records every "I'd like to meet" click, both directions
CREATE TABLE match_interests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id    UUID NOT NULL REFERENCES auth.users(id),
  to_user_id      UUID NOT NULL REFERENCES auth.users(id),
  match_score     NUMERIC,
  ai_why_text     TEXT,         -- the why shown to from_user at time of click
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (from_user_id, to_user_id)
);

-- Records the moment both sides have opted in → intro email fires
CREATE TABLE match_intros (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id       UUID NOT NULL REFERENCES auth.users(id),
  user_b_id       UUID NOT NULL REFERENCES auth.users(id),
  match_score     NUMERIC,
  ai_why_text     TEXT,
  intro_sent_at   TIMESTAMPTZ DEFAULT now(),
  CHECK (user_a_id < user_b_id)  -- canonical ordering to dedupe
);
```

The trigger: when a row is inserted into `match_interests` and there's already a row with `(from, to)` reversed → insert into `match_intros` + fire the intro email via the existing magic-link / nurture email infrastructure. Database-level via trigger, OR application-level via the click handler — either works for v1.

### AI-why text generation — where the prompt lives

The "why you should meet B" paragraph shown on each match card is generated by an AI prompt that takes both user profiles + the primitive compound that matched them + the score, and returns 2-3 paragraphs explaining the match shape (collaboration potential, knowledge exchange, asset synergy). The prompt:

- Lives at `src/prompts/user/matchWhyPrompt.ts` (to be created with §8 implementation, following the same pattern as `missionDiscoveryPrompt.ts`)
- Takes inputs: `{ user_a_profile, user_b_profile, compound_type, primitive_scores, asked_for: "collaboration" | "peer-learning" | "gift-exchange" }`
- Returns: `{ why_text: string, hook: string }` — `hook` is a one-line summary for compact card surfaces
- Iteration: when intro-rates on A/B-tested why-templates differ measurably, promote the higher-performing template to canonical (see "Engine learning" above)

Privacy boundary in the prompt: the AI gets read access to both profiles but is instructed to describe the MATCH (what could come of A+B together), not the people in profile-reveal terms. The card already shows what's public; the why-text explains the connection-shape.

### What's NOT in v1 (parked)

- Reputation / vouching layer
- Scheduling integration (intro email points to "schedule a call" but doesn't book it)
- Match outcome capture beyond the intro-sent event
- Filtering by user-set preferences (location, language, etc. — those exist on the page but aren't wired into the mechanic)
- Paid match-volume tiers
- Inter-community vs. intra-community filtering

These are all sound moves for later; the v1 mechanic is functional without them.

---

## 8.5. Implementation reality — extending, not rewriting

Audit done May 16 confirms: the matchmaking surface is already substantial.

| Layer | Today's state | What §8 adds |
|---|---|---|
| **Match scoring engine** | `suggest-asset-matches` edge function — Gemini 2.5 Flash on Appleseed + Excalibur + Mission + Assets, returns collaboration_proposal + alignment + complementarity + friction | Pass score + compound type forward so feedback loop can tune |
| **Match card UI** | `src/components/matchmaking/MatchCard.tsx` — Aurora styled, stateless, parent-event-driven | CTA label change ("Add Connection" → "I'd like to meet"), new mutual-interest state surfacing |
| **Match list page** | `src/pages/Matchmaking.tsx` — Tinder-style swiper + categorized genius matches, production-ready | Replace the single-side `handleAiConnect` with double-opt-in flow |
| **Connect action** | Inserts to `connections` table + fires `send-connection-intro-email` immediately to receiver | Change to: insert `match_interests` row; only fire intro email when reverse-direction row already exists |
| **Tables** | `connections` (asymmetric request) | NEW: `match_interests` + `match_intros` |
| **Intro email** | `send-connection-intro-email` edge function (single-recipient) | NEW or refactor: mutual-intro email (both A and B in To:) |
| **AI-why text** | `suggest-asset-matches` returns collaboration_proposal + alignment + complementarity (these ARE the why) | Already there — surface as the card's "why you should meet" prominently; possibly factor out to its own prompt file |

**Open decision (Phase 2):** what to do with the existing `connections` table. Three options — (a) deprecate; (b) keep for legacy compat alongside new tables; (c) refactor it into the new shape. Decide during Architecture phase based on data inspection.

---

## 8.6. Active Introduction Layer — the AI matchmaker mode (Day 67, 2026-05-19)

### Why this exists

§8 shipped a clean double-opt-in mechanic but its activation model was **passive**: B had to organically return to `/game/collaborate/matches` to see and respond to A's interest. In a non-Tinder, no-geography product where engagement loops are weaker than dating apps, that means most interest dies in silence. §8.6 flips this to **active introduction** — the platform itself reaches out as a thoughtful matchmaker.

### The flow

```
A clicks "I'd like to meet" on B
  ▼
match_interests row stored (§8 mechanic — unchanged)
  ▼
NEW Email #1 — heads-up to B (send-match-headsup-email)
  • AI-generated body (uses existing suggest-asset-matches output —
    no new prompt to write)
  • Subject: "${A.firstName} wants to meet you — here's what we saw"
  • Body: who A is + 3 concrete connection points +
    1-2 collaboration possibilities
  • Two magic-link buttons:
      ┌──────────────────────┐  ┌────────────┐
      │ Yes, introduce us    │  │  Not now   │
      └──────────────────────┘  └────────────┘
  • Footer: "We won't pester you. Stop notifying me → Settings"

  ▼
B's inbox. Three outcomes:

  (a) B clicks Yes → match-consent edge function
       → HMAC verifies token
       → match_interests.consent_response = 'consented'
       → match_intros row inserted
       → invokes send-mutual-intro-email
       → renders "Done. We're sending the intro now." page
       → both A and B receive the bilateral intro email

  (b) B clicks Not now → match-consent edge function
       → match_interests.consent_response = 'declined'
       → renders "Got it. We won't follow up." page
       → A is suppressed from B's deck for 15 days

  (c) B ignores → token expires after 30 days
       → match_interests.consent_response = 'expired'
       → no further action; A can withdraw or re-invite later
```

### Why magic-link buttons (not email-reply parsing)

Considered: AI reads B's email reply and detects consent. Rejected because:
- Requires inbound email infrastructure (Postmark / SendGrid / Cloudflare Worker)
- Brittle (spam-filter mangling, threading weirdness, ambiguous replies)
- Higher cognitive load on B (typing > clicking)
- No clean "no" path — silence is the only signal

Magic-link buttons keep everything in the existing Supabase + Resend stack, zero new providers, click = unambiguous signal, secured by HMAC-SHA256 signed tokens with 30-day expiry.

### Refactored bilateral intro email

The §8 intro email is rewritten in **human-matchmaker voice**, not engine voice:

```
Hey ${B.firstName}, meet ${A.firstName}.

I thought you two could hit it off on:
  • ${concrete_point_1}
  • ${concrete_point_2}
  • ${concrete_point_3}

Leave it up to you guys to make the connection and follow up
if you still want to. You both said yes.

— Find Your Top Talent
```

No magic-link CTA. Reply-thread = action surface. Both addresses in `to:`. Same thread.

### The "How it works" explainer

Added to the top of the Genius Matches page: a `MatchExplainer` accordion, auto-expanded on first visit (tracked via `game_profiles.match_explainer_seen_at`), explaining in three sentences:

1. **You click "I'd like to meet"** — Your interest stays private.
2. **We send them a heads-up email** — They can say yes or not now in one click.
3. **If they say yes** — We send you both an intro email in the same thread.

Plus the safety line: *"If they don't respond, we leave it at that. You can withdraw anytime."*

### Schema additions (§8.6 layer)

```sql
-- match_interests gains:
headsup_email_sent_at   TIMESTAMPTZ
consent_response         TEXT  -- 'pending' | 'consented' | 'declined' | 'expired'
consent_responded_at     TIMESTAMPTZ
headsup_email_status     TEXT  -- 'sent' | 'bounced' | 'failed' | 'no_email' |
                                --  'opted_out' | 'globally_suppressed' |
                                --  'already_connected'
headsup_sent_count       INTEGER

-- game_profiles gains:
match_headsup_opt_out      BOOLEAN DEFAULT false
match_explainer_seen_at    TIMESTAMPTZ
```

### Implementation status (§8.6)

See [docs/specs/match-mechanic/active-intro_tracker.md](../specs/match-mechanic/active-intro_tracker.md) for the live build tracker + Debug DoD.

---

## 8.7. Three loops — matching as a return habit, not a one-time check (Day 80, 2026-05-23)

The matching engine is alive when three loops are running concurrently. Today only the first one exists.

| Loop | Direction | What triggers it | What it produces |
|---|---|---|---|
| **Discovery** (user-pull) | User → engine | User opens the matches page | A small batch of high-resonance candidates + heads-up email when interest fires |
| **Re-engagement** (system-push) | Engine → user | Weekly cron + new-match thresholds | A digest email pulling user back: "3 new matches this week + 1 mutual still waiting" |
| **Improvement** (capability-deepen) | User → own profile | Engine surfaces "adding mission would lift 4 of your match scores" nudges | Deeper profiles → higher-quality matches → more reason to return |

The platform monetizes on Loop 1 (the high-precision collaboration product). Loops 2 and 3 are what makes Loop 1 worth paying for. Without re-engagement, matches feel one-and-done. Without improvement, profiles stay thin and matches stay generic.

**Order of build:** Loop 1 first (already shipped). Loop 2 next (weekly digest email — leverages existing `send-match-headsup-email` template + a cron-triggered edge function that runs `suggest-asset-matches` per active user weekly and packages the top 3 NEW matches into an email). Loop 3 ships alongside, since it's a single line of UI ("add your mission to lift these matches by ~X points") on the matches page.

---

## 8.8. Portion logic — what we surface, in what cadence (Day 80, 2026-05-23)

The framing reset: **we're not selling self-knowledge, we're selling high-precision collaborations.** That changes the portion calculus. Two principles:

1. **Each match has real value.** Computing a match costs LLM tokens AND surfaces a finite-trust artifact (the heads-up email that fires when someone clicks "I'd like to meet"). The system can't burn either at unlimited rate.
2. **Returns require freshness.** Users who see the same matches twice never come back. Users who see 3 new matches every week return weekly.

**v1 portion rule:** **3 matches per session, freshest pool first.** Smaller than the engine's natural top-8 because:

- 3 is below the cognitive-fatigue threshold (users review every one carefully instead of skimming)
- 3 leaves headroom for "fresh next time" — the engine deepens-and-rotates rather than exhausting the pool
- 3 matches the natural rhythm of how a human thinks about new connections (Dunbar's "close circle" is roughly 5, not 50; even fewer when each contact is a potential collaboration)

**Refresh budget:** users get **1 manual refresh per session** (loads the next 3) for a total of 6 fresh profiles per visit. Beyond that, "come back next week." This is the implicit free-tier ceiling and the natural upsell anchor.

**Why this beats showing 8 at once:**
- A 3-card page tells the user: each of these is intentional. An 8-card page tells them: pick whichever catches your eye, the rest is filler.
- Refresh-on-demand teaches the return habit. Static-list-of-8 teaches the one-and-done habit.
- We never have to say "here are lower-quality matches we hid from you" — we just say "your top 3 right now."

**Implementation knob:** the cap lives at `suggest-asset-matches/index.ts` in the `survivors.slice(0, N)` line. v1 N=3 (primary) with a separate `loadMoreMatches` endpoint returning the next 3.

---

## 8.9. Free vs sponsored vs premium — the monetization map (Day 80, 2026-05-23)

The matching network has a chicken-and-egg problem: too few users means too few matches means no reason to join. Charging end users at this stage kills the volume needed to make matching valuable. Solution: charge the side of the market that benefits at scale, free the side that creates volume.

| Tier | Who pays | What they get | Why it works at Sasha-stage |
|---|---|---|---|
| **Free for individuals (always)** | Nobody | 3 matches per session + 1 manual refresh + weekly digest email | Network effect requires volume; can't gate the on-ramp |
| **Community sponsorship** | Network operators (Network School, Sasha's Ignition cohort grads, future partner communities) | Branded matching surface + analytics for their members + bulk match credits | Communities already pay for tools; matching is one more line item. Sasha already has the Network School white-label as the prototype |
| **Premium individual** (parked, post-scale) | Power users | Filters (location, type, language), unlimited refreshes, see-who-viewed-you, daily digest, priority queue | Standard SaaS pattern. Won't ship until matching is producing real collaborations at scale |
| **Successful-intro fee** (parked, post-scale) | Both parties of a high-stakes mutual intro | Concierge intro for marquee matches (investors, hires, board members) | Value-based pricing — only charge when value lands. Earliest at hundreds of active users |

**For the current stage:** **free for everyone, community sponsorship as primary revenue.** Premium tiers are explicitly parked. The mistake to avoid is pricing the matching surface before there's enough density to make matches valuable.

---

## 8.10. Profile-completion incentive (Day 80, 2026-05-23)

The improvement loop (Loop 3 in §8.7) needs one surface to land on. v1: a single line on the matches page, immediately above or below the match cards, that says:

> *"Adding your Quality of Life assessment would lift X of your matches by ~Y points."*

OR if QoL is already done:

> *"Going deeper on your Top Talent reveal would refine 3 of your matches with higher complementarity signal."*

OR if both are done:

> *"You're at the depth ceiling. New matches will surface as more people complete their profiles."*

The order of nudges (priority sequence as the user fills in their profile):

1. **Quality of Life assessment** — the missing 4th canonical input, easy to add, lifts QoL similarity sub-score from neutral 0.5 to real value
2. **Deeper Top Talent review** — the v3 deep-profile prompt that produces top_three_talents_compact, primeDriver, etc. — many legacy users only have the basic reveal
3. **Mission discovery (if missing)** — lifts mission similarity sub-score
4. **Asset mapping (if missing)** — lifts asset Lego-fit sub-score
5. **Future: wants/needs, UBB artifacts** — once those primitives are wired into matching

The nudge is shown ONCE per session, takes minimal visual weight, and disappears when there's nothing to nudge (the user is at depth ceiling).

**Filters (location, language, type) are parked for the premium tier** per §8.9. They don't belong as a free-feature on the matches page — they belong as the unlock that justifies a premium subscription when one exists. Until then, the engine's own scoring is the filter.

---

## 9. Implementation status

### Already shipped

- `src/pages/Matchmaking.tsx` — shows 3 match categories (Complementary Genius, Similar Genius, Similar Mission) **+ Day 66 §8: double-opt-in `handleExpressInterest` / `handleWithdrawInterest` handlers, three-state MatchCard, mutual-detection logic, bilateral intro email invocation**
- `src/lib/archetypeMatching.ts` — complementarity logic on Top Talent archetypes
- `src/components/matchmaking/MatchCard.tsx` — Pass / **"I'd like to meet"** UI with three interaction states (default / interest-expressed / mutual) + Withdraw path + ARIA live regions
- `src/pages/Connections.tsx` — refactored to two-section view (mutual intros + your expressed interests); privacy boundary preserved (no incoming-unilateral leak)
- `src/pages/spaces/TeamsSpace.tsx` — exclusion-set migrated to `match_intros` + `match_interests`; new-interest writes go to `match_interests`
- `supabase/functions/send-mutual-intro-email/` — Aurora-register bilateral intro email (both addresses in `to:`, no magic-link CTA, reply-thread = action surface, JWT-validated caller)
- `supabase/migrations/20260516214500_match_mechanic.sql` — `match_interests` + `match_intros` tables, RLS, indexes, comments
- `src/prompts/user/matchWhyPrompt.ts` — documented why-text prompt + `extractConnectionHook` / `stripConnectionHook` utilities
- Filters: location, language
- **Legacy `connections` table** — dropped via one-time Lovable SQL (Day 66, no real data lost)

> §8 Interaction Mechanic shipped Day 66 (2026-05-16) — see `docs/specs/match-mechanic/match-mechanic_tracker.md` for the Debug DoD 10/10 audit + key decisions.

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

## 10. MVP scope (current sprint priorities)

### Must have (to make the existing matchmaking surface actually function)

- [x] **Connect button does something real** — Day 66 §8 shipped: double-opt-in mechanic, mutual-interest detection, bilateral intro email
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

## 11. Community phasing — complementary to the holarchy

The holarchy in §7 describes WHAT layers exist (person / project / ecosystem). The community phasing is a separate cut: HOW MANY communities the platform serves at once.

**Phase 1 — Community Tool (current):** the platform serves ONE community at a time. All matching is intra-community (same cohort, same trust container). High trust, fast iteration, value proven quickly. Most appropriate while user count is small and trust friction would dominate match value.

**Phase 2 — Community of Communities (future):** multiple tribes on the platform. Inter-community matching unlocked. Introduction/trust layer needed (vouching, cohort badges, opt-in cross-pollination). Network effects begin.

**Transition trigger:** 3–5 thriving tribes using the tool internally with proven intra-community match outcomes.

The holarchy (§7) and the community phasing here are orthogonal — Phase 1/Phase 2 is about how communities relate; person/project/ecosystem is about the layers within and across communities.

---

## 12. Three pragmatic next moves (priority-ordered)

1. **Implement the match interaction mechanic from §8** — the double-opt-in flow with AI-generated "why" text. This is what makes existing matches *actionable* (the current Connect button is the gap). Two new tables (`match_interests`, `match_intros`), one trigger or app-layer handler, one intro email template. Unlocks the feedback loop in the same move (every intro fired = a recorded success event the engine can learn from).

2. **Promote Top Talent applications to a first-class queryable surface.** Schema: `top_talent_applications(id, user_id, application_label, context_tags, valence, source, created_at)`. Surface on `/game/me/zone-of-genius/applications`. Becomes the JOIN key for role-similarity AND role-complementarity matching. Without it, role-based matching runs on coarse archetype labels rather than the fine-grained applications the user actually performs.

3. **Build the wants/needs primitive.** Paste-AI-response surface parallel to Mission Discovery. Save as `wants_and_needs TEXT` (or split: `wants TEXT` + `needs TEXT`, see §13). Enriches matches with demand-side signal. Not a precondition — the engine works without it — but adds signal that the other primitives can't surface.

(Asset-complementarity scoring is in the engine's compound table and DB-ready; wiring it into the actual scoring function is implementation work that lands naturally alongside #1 when the match-surface gets its real Connect mechanic. Not listed separately above because it's the same code path.)

---

## 13. Open questions

Settled in this synthesis (no longer open):

- ~~The "connect" action mechanic~~ → settled in §8: double-opt-in, intro email, recorded as success event for the feedback loop.
- ~~Match outcome feedback loop~~ → settled in §8: every intro-sent fire is the high-trust signal recorded for engine improvement.
- ~~Trust + safety + abuse prevention~~ → mutual-opt-in IS the v1 trust filter (gaming a profile to surface in front of someone still doesn't fire an intro email unless the other side independently agrees).
- ~~User definition for v1~~ → person. Project profiles come later but won't be reducible to leader-person.
- ~~Pricing of matching surface~~ → free for v1. Premium tiers are a future move once free engine produces real collaborations.

Still genuinely open:

- **Wants/needs schema shape — single TEXT field or split into `wants` + `needs`?** Sasha's lean: either works for v1; might be cleaner to ask the AI for both in the prompt and store separately, but also fine to let the AI handle both in one paragraph. Decide at build time of the wants/needs surface.
- **QoL filter behavior (for whenever we wire it)** — hard cutoff or soft multiplier? Not wiring QoL into the engine yet; revisit when that work is scheduled.
- **Mystic / DoB weighting** — off-by-default for v1, on by default in a future "deep matching" tier. Trust implications — many users will be skeptical; surface this layer openly, not silently.
- **Wants-vs-needs convergence inference** — how does the engine know which users to weight wants/needs more heavily for? §2B sketches the convergence-with-consciousness idea but doesn't propose a mechanism. Open implementation question.
- **Romantic / platonic boundaries** — the primitives largely apply to romantic matching too. The platform explicitly excludes this for v2 (professional focus). Will users self-divert anyway? Should the system route those signals elsewhere? Not urgent until usage signal forces it.
- **Post-intro outcome capture** — did the intro lead to actual collaboration? §8 mentions optional self-report 30 days post-intro and organic capture via Asset Mapping. Decide which (or both) when match volume justifies the build.

---

## 14. Genealogy

- **v0 (Feb 17, 2026):** original matchmaking docs lived in the old intro-kit archive (deleted July 4, 2026 as outdated) plus `docs/06-architecture/matchmaking_architecture.md` and `docs/07-technology/matchmaking_engine.md`. Engineering-leaning; subordinated to v1's strategic framing.
- **v1 (March 31, 2026):** Trojan Horse + 5-match-type framing in this file. Pulled the engine up into strategy. Preserved here as foundational concepts that v2 didn't replace.
- **v2 (May 16, 2026, Day 66):** primitive-driven holarchic engine download. Reframed match-types as compounds of primitives; added wants/needs dimension; added holarchy; added scoring sketches.
- **v2.1 (May 16, 2026, Day 66 — same day):** Sasha-reviewed synthesis. Wants/needs reframed from "load-bearing precondition" to "one valuable primitive among many." QoL-as-multiplier deferred (not wiring yet). Project-leader-proxy critique retracted (every project has an ultimate decision-maker per decision context; project profiles will exist independently when built). User scope locked as "person" for v1; matching engine pricing locked as "free for v1." Added §8: Match interaction mechanic spec — the Bordy-style double-opt-in flow, intro email, recorded success event as the feedback loop, mutual-opt-in as the v1 trust filter.
- **v2.2 (May 16, 2026, Day 66 — same day, later):** Added §0 (Civilizational anchoring — the engine as operational substrate of the platform's lifelong dedication) and §0.5 (Data moat — input quality is the platform's true differentiator; the matching code is replicable, the developmental-depth primitives aren't). The "Beneficial → 10" jump from the rigor re-run.
- **Synthesized (May 16, 2026):** the version that integrated v1 strategic framing (Trojan Horse, community phasing, scale architecture, MVP scope) with v2 engine theory (primitives, wants/needs, compounds, holarchy, scoring). Superseded by v2.1.

**Anti-pattern note for v3:** edit this document in place. Do not stack v2-style appendices or create sibling docs. Document-creep is the explicit anti-pattern.
