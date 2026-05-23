# Collaboration Taxonomy

> **Core insight:** The matching engine's job is to propose specific collaborations, not abstract pairings. Without a vocabulary of collaboration TYPES, the engine collapses every pairing into the same lame default ("help her build a business on her thing"). This taxonomy gives the engine three layers of granularity — 5 holonic roots × ~5 sub-types each × specific named containers — so every match proposal can name a concrete SHAPE, not a generic pattern.

> **Document genealogy:** v1 integrated Day 80 (Sasha, May 23, 2026), after the audit found the rationale-writer LLM was inventing fake brand names and arbitrary numbers to satisfy the "be concrete" instruction. Real concreteness comes from a real vocabulary; that's what this doc supplies. Companion to `docs/02-strategy/matchmaking_strategy.md` §5 (the scoring spec) — scoring decides WHO to surface, this taxonomy decides WHAT shape to propose.

> **The maturity axis is separate.** `collaboration_spectrum.md` (the 11-stage maturity ladder: Holding Fortress → Random Conversations → Exchanges → Collabs → Partnerships → Gigs → Teams → Swarms → Holonic Ecosystems → Mycelium Symbiosis → ...) is the "how deep" axis. This taxonomy is the "what kind" axis. The two are orthogonal: a Co-Learning peer pair can sit at Stage 4 (Collabs) or Stage 7 (Teams). The maturity axis informs the engine's recommendation under the hood; users never see stage numbers in their match prose.

---

## 1. Why a taxonomy at all

Three reasons:

1. **Specificity over abstraction.** "Combine your capacities to create alignment" is what the engine produces without a vocabulary. With a vocabulary, it produces "co-author a methodology that integrates X and Y, where each of you contributes Z." The first is generic. The second is actionable.

2. **Bilateral framing.** The taxonomy forces the engine to ask "what does this collaboration look like from BOTH sides" instead of defaulting to "person A helps person B do their thing."

3. **Pattern recognition over time.** As the engine accumulates labeled matches (successful intros, mutual interest, declined heads-ups), we can correlate which taxonomy TYPES produce which OUTCOMES. That's the empirical data moat — what types of collaboration this network actually generates, across what kinds of pairings.

---

## 2. The 5 root types (Level 1 holons)

| Type | Core verb | The question it answers |
|---|---|---|
| **Co-Build** | Make | What do we MAKE together that neither could make alone? |
| **Co-Learn** | Grow | How do we GROW each other's capacity? |
| **Co-Distribute** | Reach | How do we REACH the people each of us can't reach alone? |
| **Co-Resource** | Pool | What do we POOL so we both access something larger? |
| **Co-Steward** | Tend | What do we TEND together that outlives the project? |

Five roots, not six. The earlier draft had a sixth (Co-Hold for emotional / ritual / accountability containers); retired as artificial — those activities fold cleanly into Co-Learn or Co-Steward depending on whether the container is about growth or about ongoing tending.

---

## 3. The 25 sub-types (Level 2 holons)

```
Co-Build
├── Business co-founding (full company, equity split)
├── Product co-creation (software, physical product, content)
├── Methodology co-creation (framework, IP, named practice)
├── Service co-delivery (a paid offering, delivered jointly)
└── Creative work (book, film, album, installation, one-off creation)

Co-Learn
├── Peer mastermind (recurring small group)
├── Accountability dyad (1:1 mutual commitment)
├── Study or research group (knowledge-build together)
├── Skill practice group (drill, role-play, reps)
└── Apprenticeship (asymmetric: one teaches, one learns)

Co-Distribute
├── Audience cross-pollination (guest swap, mention, intro batch)
├── Channel partnership (one distributes the other's offer)
├── Joint launch (combined offer, combined list)
├── Affiliate or revenue share (transactional pass-through)
└── Co-marketed event (summit, retreat, hackathon)

Co-Resource
├── Capital pool (syndicate, investment club, fund)
├── Talent pool (collective for client work)
├── Tool or asset sharing (studio, equipment, subscriptions)
├── Knowledge pool (shared research, data, IP library)
└── Network pool (mutual warm-list, intro exchange)

Co-Steward
├── Community moderation (Discord, forum, group)
├── Ecosystem governance (DAO, co-op, federation)
├── Infrastructure tending (shared platform, library, dataset)
├── Mentorship lineage (a craft / methodology / practice transmitted forward through teacher-student chains — e.g., a certified IFS school, a coaching certification, a martial arts lineage)
└── Movement building (long-horizon cause, advocacy, field-building)
```

**Note on Mentorship lineage:** clarified from the earlier "Lineage stewardship" framing, which read as too archaic. The pattern is concrete: someone trained in a methodology (Internal Family Systems, Aletheia coaching, Holotropic Breathwork, a CrossFit certification, the Bonsai craft) deliberately trains new practitioners so the methodology survives and propagates. Two people aligned on a methodology can collectively steward its propagation — co-running a training, jointly certifying graduates, co-authoring the canonical curriculum.

---

## 4. Layer 3: containers (the leaves)

Each sub-type has 3-6 specific containers — the actual concrete shape the engine names in a match proposal. Examples below; full enumeration grows as real matches surface real patterns.

```
Co-Build / Methodology co-creation
   ├── Two-author book
   ├── Co-taught cohort (no arbitrary week count — let the partners decide)
   ├── Joint framework with shared IP
   ├── Open-source toolkit
   └── Industry white paper

Co-Learn / Peer mastermind
   ├── Founder mastermind (small group, recurring)
   ├── Niche craft circle (e.g., copywriters, healers)
   ├── Investment club (study + decide together)
   ├── Reading group with practice
   └── Hot-seat rotation

Co-Distribute / Audience cross-pollination
   ├── Podcast appearance swap
   ├── Newsletter guest mention
   ├── Joint AMA or office hours
   ├── Co-promoted free resource
   └── Cross-promo cohort invite

Co-Resource / Network pool
   ├── Quarterly intro exchange (each side brings N warm intros)
   ├── Shared CRM or rolodex
   ├── Co-curated mastermind invitations
   ├── Collective vendor / supplier shortlist
   └── Joint client referral channel

Co-Steward / Community moderation
   ├── Co-moderating a private community
   ├── Splitting timezone coverage on a Discord
   ├── Shared editorial calendar for a public group
   ├── Joint events programming
   └── Co-leading welcome / onboarding ritual
```

A v2 of this doc will enumerate all 25 sub-types with 3-6 leaves each, totalling roughly 100 containers. v1 ships with the partial enumeration above; the model has enough vocabulary to propose well-shaped collaborations across all 5 root types from day one.

---

## 5. How the engine uses the taxonomy

The matching engine produces match proposals in this order:

1. **Score** (deterministic + LLM-judged) — see `matchmaking_strategy.md` §5. Returns four sub-scores: Top Talent complementarity, Mission similarity, Asset Lego-fit, QoL similarity, composed via geometric mean into a 0-100 resonance score.
2. **Pick the type** — the rationale-writer LLM receives both profiles + sub-scores AND this taxonomy. It picks the root type that best fits the pairing pattern (e.g., high asset complementarity → Co-Build or Co-Distribute; high mission similarity + similar gifts → Co-Learn; pooled identity around a shared craft → Co-Steward).
3. **Pick the sub-type** — narrows into the layer-2 holon.
4. **Pick or compose the container** — names the actual shape, optionally pulling from the named leaves above OR composing a new one in the same register.
5. **Write the proposal prose** — bilateral, no invented brand names, no arbitrary numbers (per `_shared/matchScoring.ts` prompt rules).
6. **Optional evolution line** — one short sentence about how the collaboration could deepen over time. This is where the maturity axis lives. Under the hood the engine has access to the 11-stage spectrum and can suggest "could start as one-time gig and evolve into a recurring practice" without naming the stages explicitly.

---

## 6. The under-the-hood maturity axis

Users never see "Stage 4 (Collabs)" or "Stage 7 (Teams)" in their match prose. Stages are an internal coordinate system the engine uses to inform proposal shape:

| Pairing pattern | Engine bias | What the user sees |
|---|---|---|
| Both early-stage, sparse profiles | Propose Stage 2-3 entry containers (one-time conversation, single exchange) | "Start with a single conversation to feel the resonance" |
| Both have established work | Propose Stage 4-5 containers (project collabs, partnerships) | "Co-deliver one offering and see how it lands" |
| Both are network operators | Propose Stage 6-8 containers (gigs, teams, swarms) | "Bring each other into your existing programming" |
| Both at very different stages | Propose asymmetric containers (apprenticeship, mentorship) | "Trade roles — she gives you somatic depth, you give her structural language" |

The engine's job is to know the stage map; the user's job is to recognize the proposal and act on it.

---

## 7. How this connects to the rationale-writer prompt

The rationale-writer (in `supabase/functions/_shared/matchScoring.ts` `buildRationalePrompt`) needs to receive this taxonomy as context — abbreviated for token efficiency. Concretely:

- The list of 5 root types + 25 sub-types is short enough to inline in the system prompt.
- The example containers (Layer 3 leaves) can be embedded as few-shot grounding.
- The "starting move + how it could deepen" two-beat structure goes in the JSON schema.

Implementation note for the next prompt revision: replace the current "name a clear SHAPE of collaboration" instruction with "Pick the most-fitting root type from {Co-Build, Co-Learn, Co-Distribute, Co-Resource, Co-Steward}, then a sub-type, then a specific container. Name what each person brings AND gets. Add one optional sentence about how this could deepen over time."

---

## 8. Validation — does the taxonomy fit real matches?

Test cases from real Sasha pairings:

| Pairing | Old engine output | New taxonomy output |
|---|---|---|
| Aleksandr ↔ Karime (your example) | "Help Karime build a business on her healing practice" | **Co-Build / Methodology co-creation** → "Co-author a framework that integrates Aleksandr's pattern-naming with Karime's embodied healing protocols. Both bring complementary IP; both walk away with a jointly-owned methodology you can each teach." Evolution: "Could deepen into co-teaching a cohort once the framework is tested in one-on-one work." |
| Aleksandr ↔ Sergey ("everything clicks") | "Maybe build a business together" | **Co-Build / Service co-delivery** → "Co-run the founder activation work you've each been doing solo. You bring articulation; he brings execution sequencing. Each of you keeps your own front-of-house brand while jointly serving a shared back-of-house client list." Evolution: "Could evolve into a shared studio if client demand justifies it." |
| Aleksandr ↔ someone at peer-mastermind stage | "Network or collaborate" | **Co-Learn / Peer mastermind** → "Join a small recurring mastermind of founders working on platform-style ventures. Trade hot-seats; bring sharp structural feedback; receive the same in return." Evolution: "Could thicken into a shared investment pool if the trust holds." |

In each case the new output names a SHAPE the user could screenshot and forward to the other party with "want to do this?" attached. That's the bar.

---

## 9. Growth path for the taxonomy itself

The 5 × 25 × ~100 shape is a v1 starting point. As the engine accumulates labeled outcomes, two evolutions:

- **Pruning** — sub-types or containers that never produce successful matches get retired.
- **Splitting** — sub-types that produce many qualitatively different matches get split into more granular children.

The empirical signal comes from `match_intros` rows (mutual interest fired), tagged with the taxonomy node the engine proposed. We're not building a perfect taxonomy a priori — we're building a useful one that learns from what actually works in this specific network.

---

## 10. Open questions

| Q | Why it matters |
|---|---|
| Should the user see the root type label (e.g., "Co-Build") in their match card, or only the prose proposal? | Showing the label is good for taxonomy literacy but adds cognitive load. v1 hides it; surface as a small tag if user testing shows demand. |
| When the engine has multiple equally-good proposals (e.g., a pairing fits Co-Build AND Co-Distribute well), should it offer both or pick one? | v1 picks one (the higher-fit) with one evolution line. Tradeoff: clarity vs option-space. |
| At what point do leaf containers warrant DB tables (so users can query "show me Co-Learn / mastermind matches")? | When the taxonomy is stable enough that filters become a premium feature. Parked. |
