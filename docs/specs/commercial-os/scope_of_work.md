# Commercial OS v2 — Scope of Work

**Module:** Commercial OS (`/built-by-you/commercial-os`, source `commercial-tools/app/`)
**Built on:** v1 (three-stream targeting, config-driven copy, one canonical ledger) · [`ai_matchmaker_brief.md`](../../02-strategy/ai_matchmaker_brief.md) v3.0 · [Technology 123 — The Ripeness Vector](../../01-vision/phase_shift_technology_library.md) · [Technology 124 — Transition](../../01-vision/phase_shift_technology_library.md) · [`transition_holomap.md`](../../holomaps/transition_holomap.md) · the Quiz ([`quiz_product_spec.md`](../quiz/quiz_product_spec.md))
**Surface owner:** the ledger. No new page. The reading IS the product.
**Started:** Day 169 (August 28, 2026).

---

## The law this is built on

> Assist the ones rising, let the mud be, tend to the pond.

Ripeness is found, not manufactured (Technology 123). Persuasion is a perception deficit (Technology 126). A person who is not ripe is not a failure of the message, and insisting is what turns a good conversation into a bad one.

v1 encoded that law in the *copy* — the client stream routes to the quiz instead of pitching. v2 encodes it in the *instrument*: the tool stops guessing at ripeness from a headline and starts recording the real reading, from the sources that can actually carry one.

---

## The problem in one line

**v1 scores profiles. The business reads ripeness. A headline cannot carry an absence, and the brief says so in its own words: "this person does not look impressive on a profile."**

So the number the tool shows today is a search-relevance guess wearing the costume of a read. Every downstream decision inherits that costume.

---

## 1.1 Master Result

**A person moves through the ledger and the tool always knows how much it actually knows about them — and learns from the encounters that already happened, not from reply rates.**

Three shifts:

1. **Reading tiers.** Every ripeness figure is stamped with where it came from. A guess never renders as a read.
2. **The retrodiction bench.** The corpus already holds dozens of real, resolved encounters. They become the calibration set before a single new message is sent.
3. **Yield on ripeness, not replies.** Six intros produced six good conversations and zero clients. Reply rate was never the bottleneck, so it stops being the metric.

---

## 2. What already exists (reuse, do not respec)

- **One canonical ledger** (`evolver-commercial-ledger` v1) with stable `linkedin:<profileUrn>` identity, stage vocabulary, dedupe that preserves later relationship state.
- **Three streams + typology exclusion + quiz-routing copy** (`config.json`, brief-version stamped).
- **`streamRole`** on every record (client / partner / operator).
- **Outcome capture + learning rows** by template, stream, search term (`learningRows`).
- **Deterministic triage, booked-meeting snooze, follow-up scoring** (`ported-core.js`).
- **The Quiz** — the instrument that actually places a person on the transition arc, with email capture live in EXT.
- **The Fathom connector, the Offer Ledger** (`strategic_crm_outreach_tracker.md`), **the session log, the private pulse log,** and **nine client canvases** (`docs/02-strategy/unique-businesses/`).

Nothing above is rebuilt. v2 adds an organ and a memory.

---

## 3. Reading tiers — the structural change

| Tier | Source | What it is | May the UI show it as a ripeness read? |
|---|---|---|---|
| **0 · Lead sheet** | headline / title regex (today's score) | search relevance, nothing more | **No.** Label it "lead sheet," show it as a match reason, never as readiness |
| **1 · Self-placement** | Quiz completion written back to the row | the person placed themselves on the arc through the instrument | Yes, marked self-reported |
| **2 · Read** | ten axes scored by Sasha after a conversation, ninety seconds | the real reading | Yes |
| **3 · Ground truth** | what actually happened (paid / not, which container, delivered) | the only unarguable data | Yes, and it supersedes everything above |

Every record carries `reading: { tier, scoredAt, scoredBy, axes, notes }`. **The rule the UI enforces: a Tier-0 number is never displayed in the same visual slot as a Tier-2 reading.** The brief already states this as discipline ("a lead sheet, not a read"); v2 makes it structural instead of remembered.

---

## 4. The ten axes, as data

Exactly Technology 123. Scores 0-10, target stated, no invented axes.

| Axis | Measures | Target |
|---|---|---|
| Transition | position in the form-death / form-birth arc | Liminality (stage 5) |
| **Surrender** ⚡ | whether force has been abandoned as a method | high |
| Distance | how directly income depends on their own name | zero |
| Locus | success attributed inside or outside | internal, unarticulated |
| Uniqueness | development of their relationship to their own gift | stage 3-4 of 5 |
| Maturity | professional development stage | stage 6-7 of 16 |
| Consent | willingness to be seen and altered | high |
| **Means** ⚡ | capacity to invest in themselves | high (6-7 of 7) |
| **Ticking Clock** ⚡ | whether a dated consequence is already running | a real clock exists and is named |
| **Buying Frame** ⚡ | which category of purchase they believe in | transformation (6 of 7) |

⚡ = **multiplicative gate.** The stored form is:

> `Ripeness = Surrender × Means × Ticking Clock × Buying Frame × Fit(remaining six)`

A closed gate is never compensated by pushing harder elsewhere. The tool must therefore **display the shape, not only the total** — a 70 with Surrender at 2 is a different animal from a 70 with Surrender at 9, and the UI has to make that visible at a glance.

**Guardrail, enforced in the capture UI:** Ticking Clock is scored, never created. The field carries the line "score the clock that exists; inventing one is pressure selling and out of bounds." Reading five paying clients showed none had a clean dated clock — every sale ran on chronic pain plus Buying Frame already at target. The tool must not quietly teach the opposite.

---

## 5. The retrodiction bench — the corpus as calibration set

**This is the part that makes v2 worth building, and it needs no new outbound at all.**

Technology 123 is honest about its own maths: under roughly thirty scored cases, inverse-covariance weighting is not yet earned and latent factors get named by hand. The corpus already holds enough resolved encounters to approach that number, with outcomes attached.

### Sources

| Source | What it contributes |
|---|---|
| **Fathom recordings + transcripts** (via connector) | the actual language of the encounter, timestamped |
| **Offer Ledger** in `strategic_crm_outreach_tracker.md` | offers sent, accepted, declined, amounts, dates — Tier 3 ground truth |
| **`session_log.md`** Days 100-169 | narrative context, what was tried, what shifted |
| **`project_pulse_log.md`** | pulse event cards per touchpoint |
| **Nine client canvases** (`unique-businesses/`) | the deepest reads that exist, on people whose outcome is known |
| **The six Boardy intros** (Days 154-168) | the cases that produced the brief v3.0 correction |

### The case record

Each bench case is one row: person · stream · **the ten axes as they stood at the time of the encounter** · what was offered · what actually happened · which flavor of rupture (Technology 124 shock taxonomy) · free-text note. Scored retrospectively, by Sasha, from the material — ninety seconds each, exactly as in the field.

### What the bench answers

1. **Does the vector retrodict?** Do the five paying clients score high and the non-buyers score low, on axes assessed blind to the outcome?
2. **Which axis actually carried the signal?** The Day 138 Clock Audit already suggests Buying Frame over Ticking Clock. Thirty cases either confirm that or overturn it.
3. **Which axes travel together?** Name the latent factor by hand and score it once, rather than double-counting correlated axes.
4. **Can a Tier-1 quiz placement stand in for a Tier-2 read?** If the quiz's arc placement tracks the hand-scored Transition axis on known cases, the round-trip is worth building. If it does not, that finding is worth more than the feature.

**This is the same bench Quiz Phase 3 needs** (retrodiction against the seven known clients, roadmap Q1). One bench, two consumers. Building it here does not duplicate that work; it is that work, with the ledger as the surface.

**Sequencing law:** the bench runs *before* the round-trip is built. Nothing in Phase 2 or 3 below is justified until Phase 1 produces a signal.

---

## 5b. The MF Cross — reading ripeness off a public profile (Day 169)

*Added after Sasha's Day 169 sharpening. Supersedes nothing; it is the Tier-0 layer finally given a defensible basis.*

### Faculty, not fidelity (Technology 138)

The variable the lexicon reads is the **faculty** of self-recognition, not the **fidelity** of a person's current self-image. Two variables, not one:

| Faculty | Fidelity | Who | Door |
|---|---|---|---|
| low | low | the not-yet | none. Let be, or nurture |
| low | apparently high | Settled — an untested fit | none |
| **high** | **low** | **the buyer** | Stream A, myth register |
| high | high | peer / operator | Streams B and C |

The lexicon detects the organ, which is why it cannot tell a buyer from a peer on its own — both have the organ. That is the whole reason the cross exists. Full law, the derivation method for any practice, and the two failure modes: **Technology 138, The Faculty Precedes the Fidelity.**

### What the vocabulary actually measures

Sasha proposed filtering on words that signal consciousness. The corpus already has the precise name for what that measures, and it is stronger than "consciousness."

Tribe v6.1 states it: **MF (mirror fidelity) is the whole product**, and *"a person can only buy what they can already see. Someone with low MF cannot perceive an MF-raising offer, because perceiving it requires the very faculty the offer would install."* The thesis is inaudible below an MF threshold.

A person who writes *holonic*, *integral*, *evolutionary*, *polymath*, *conscious* on a public profile is producing their own evidence that the faculty is present. **The lexicon is the first machine-readable proxy for MF that exists.** It is not a personality filter and it does not measure enlightenment. It measures whether an offer of this kind can be perceived at all.

It also lands on the axis that actually predicted revenue: the Day 138 Clock Audit found none of the five paying clients had a dated clock, and all five had **Buying Frame already at target** — a standing habit of paying for their own transformation. The conscious-register vocabulary is that habit, worn in public.

### Why the lexicon alone reproduces the v1 failure

Brief v3.0 was written because six intros produced six good conversations and zero clients: **topic-similarity matching returns peers.** The conscious lexicon is the highest-resonance filter available, so used alone it returns peers faster and with more confidence. It must be crossed.

The cross already exists in the corpus twice: Day 157 (sameness × complementarity) and the Tribe v6.1 growth equation. At profile resolution it reads as three factors, **multiplied, not added**, mirroring the gate structure of Technology 123:

> **Lead = MF (lexicon) × Identity (income on their own name) × Transition (the form is ending)**

| MF | Identity | Transition | Class | Register | What it is |
|---|---|---|---|---|---|
| ✓ | ✓ | ✓ | **bullseye** | myth | Stream A. The faculty, the vehicle, and the opening, all present |
| ✓ | ✓ | — | peer_partner | myth | Stream B. Faculty present, form still working. Leverage, not relief |
| ✓ | octave marker | — | operator | myth | Stream C. Studio, collective, accelerator. Never the client template |
| ✓ | — | — | peer | myth | Resonance only. This is the class that ate the first six intros |
| — | ✓ | ✓ | **not_yet** | plain | **Real pain, no faculty to perceive the offer.** See below |
| — | — | — | cold | plain | No read |

### The not-yet class, named

This is the answer to *"I have been wasting time on people who aren't ready yet."*

The costly class is not the obvious mismatch. It is **high transition, low MF**: someone whose form has genuinely ended, who is in real pain, who looks like a perfect prospect on every conventional measure, and who cannot perceive an MF-raising offer because perceiving it requires the faculty the offer would install. Tribe v6.1 already classifies this as a not-yet rather than a buyer. Until now nothing named it at the top of the funnel, so it was discovered one call at a time.

The tool now blocks the cold door on this class outright: no connect button, no client template, a hold instruction in its place. This is the "let the mud be" law made mechanical. It is not a judgment of the person. It is the recognition that the offer is inaudible from where they stand, and that insisting is the pearls-before-swine failure.

### Lexicon tiers

Precision-weighted, because the terms are not equal. Stored in `config.mfLexicon`.

| Tier | Weight | Terms | Basis |
|---|---|---|---|
| **1** | 30 | holonic · integral · evolutionary · polymath · zone of genius · sovereignty · regenerative | Near-zero false positive. Sasha: "integral coupled with entrepreneur is one of the highest fits" |
| **2** | 20 | conscious · conscious tech · conscious deep tech · visionary · system architect · mystic · sacred geometry · new earth · noosphere | Strong signal, higher volume, some noise |
| **3** | 8 | decentralization · web3 · modular · social entrepreneurship · impact entrepreneur · purpose-driven | **Hypothesis under test.** Sasha's own flag: these people "may be too rational still. Or aspirational." Aspiration is not fidelity |
| *markers* | — | venture studio · founder collective · accelerator · startup studio · syndicate | Sasha: "these are almost like the next octave for me." Route to Stream C, never to the client template |

**The sixteen terms are sixteen measurable hypotheses, not sixteen truths.** The tool already tracks yield per search term, so the bench and the channel will say which tiers earned their weight. Terms that return peers get demoted. This is the brief-is-the-product loop running on the lexicon itself.

### The watchlist — a different axis, a different mechanic

Some words are not faculty markers. They are **costly public signals**: a person willing to say a socially expensive true thing under their own name. On the ripeness vector that reads on **Consent** (axis 7, willingness to be seen and altered), not on faculty.

`cannabis` is the first. Also `plant medicine · psychedelic · entheogen · ayahuasca · psilocybin`.

These do not score and do not classify. They **flag the profile for Sasha's own eyes**: it sorts to the top of the list, the Connect button is replaced by "Open profile," and the decision to reach out is made by watching the person speak. Never auto-templated, never auto-connected. Whether these people are peers, clients or something else is an open question the watchlist exists to answer rather than presume.

### Register selection, not just stream selection

The Message Bank already carries this law: *"Match their language: conscious / soul for founders and mystics; clean talent-intelligence / capability for enterprise. Same core, different words."*

MF now selects the register. High MF gets the myth register (his own language, no translation). Unknown or low MF gets the plain register (ordinary business words, identical core). Templates are keyed `<stream>__<register>` with the plain variant as fallback.

### The nose, captured

Sasha: *"honestly I can smell they aren't there just from what their LinkedIn says."*

That is a Tier-2 quality read performed on a Tier-0 artifact, and it is currently lost the instant it happens. **Build a one-tap read on every lead row — ripe / not-yet / never, plus the word he is reacting to.** Those judgments become labels. Once there are enough of them, the lexicon is scored against his nose rather than against a guess, and where the nose disagrees with the lexicon, the nose is the ground truth and the lexicon gets corrected.

This is the mechanism by which tacit perception enters the instrument. It belongs in Phase 2 and it feeds the bench directly.

---

## 6. The loop

```
search / import          → Tier 0 lead sheet
   ↓
message with quiz link   → token carries the ledger row id
   ↓
quiz completion          → Tier 1 placement + email written back
   ↓
conversation             → Tier 2: ten axes, 90 seconds
   ↓
outcome                  → Tier 3 ground truth
   ↓
learning                 → yield per stream / term / brief version, measured in ripeness and revenue
   ↓
brief proposal           → the tool drafts the next brief version from what came back
```

The last arrow is the point of the whole thing. **The brief is the product of this channel**, and the same is true here: the tool's real output is not messages, it is a sharper brief. Words → results → sharper words, which is the method run on the instrument itself.

---

## 7. Data model additions

Additive only. Existing records stay valid.

```js
reading: {
  tier: 0 | 1 | 2 | 3,
  scoredAt, scoredBy,
  axes: { transition, surrender, distance, locus, uniqueness,
          maturity, consent, means, tickingClock, buyingFrame },   // 0-10, null = unscored
  gates: { surrender, means, tickingClock, buyingFrame },           // derived, for shape display
  ripeness,                                                          // derived, multiplicative
  shockFlavor,          // Technology 124 taxonomy: external | economic | somatic | relational | internal | perceptual
  notes
},
quiz: { token, sentAt, completedAt, stage, resultRef },
screening: {              // partner stream only
  asked: bool,
  answer: "process" | "who-they-are" | null   // Day 167: separated six intros perfectly, both directions
},
disposition: "open" | "nurture" | "let-be",   // replaces the closed boolean
nurture: { reason, reTouchAt },               // banana: ripens off the tree
briefVersion                                   // stamped at send time
```

---

## 8. UI changes

- **Fit column splits.** "Lead sheet" (Tier 0, muted, with its match reason) and "Reading" (Tier 1-3, with the axis shape). Never one number.
- **Axis shape** as a ten-segment strip with the four gates marked. A closed gate renders the row visibly cold no matter what the total says.
- **Ripeness capture drawer** — the ninety-second form, opened from any person with a conversation. Ten sliders, shock flavor, one note field, the Ticking Clock guardrail line inline.
- **"Let be" is a primary button, sitting beside "Draft," at equal visual weight.** Choosing not to pursue is a correct outcome of the instrument, not a failure state hidden in a menu. Nurture asks for a re-touch date; let-be asks for nothing.
- **Partner stream loses the funnel.** No cap counter, no cadence, no stage ladder. One field: the screening question and its answer.
- **Bench view** — the retrodiction table, scored cases, and the honest count ("18 of ~30 cases scored; weighting still by hand").

---

## 9. Learning, corrected

`learningRows` currently ranks by reply rate and positive rate. v2 ranks by:

1. **Ripeness yield** — mean Tier-2 ripeness of the people a search term / stream / brief version actually produced.
2. **Gate-open rate** — the share who cleared all four gates. This is the number that predicts revenue.
3. **Revenue**, once there is enough of it to be a signal rather than an anecdote.

Reply rate stays visible, demoted, labeled as what it is: a measure of whether the copy is pleasant, not whether the person is ripe.

---

## 10. Laws and non-goals

- **Never persuade.** No urgency generation, no manufactured clock, no nurture sequence designed to move someone toward readiness. The tool finds the ripe; it does not ripen anyone.
- **Excluded stays excluded.** Typology-system builders are structurally unable to buy. No override button.
- **Partners are never prospects.** No stage ladder, no pitch template, no conversion metric on stream 2.
- **A profile is never a read.** Enforced by the tier model, not by memory.
- **No autonomous sending, ever.** Every message is reviewed and sent by Sasha. Unchanged from v1.
- **Not a CRM replacement.** The Offer Ledger in `strategic_crm_outreach_tracker.md` remains the canonical commercial record; this tool feeds it pulse cards, it does not supersede it.
- **Not a scoring oracle.** The bench may show the vector does not retrodict. That result is a legitimate output and gets written into the corpus rather than engineered around.

---

## 11. Phases

| Phase | Scope | Definition of Done | Gate |
|---|---|---|---|
| **1 · The bench** | Score the existing corpus retrospectively. Ten axes per case, outcome attached. No code beyond a table and an import. | ≥20 cases scored; retrodiction result stated plainly, including a negative one; latent factors named by hand | **Nothing below starts until this produces a signal** |
| **2 · The organ** | Reading tiers in the data model + the ninety-second capture drawer + axis-shape display + let-be/nurture parity | Every record shows its tier honestly; a Tier-0 guess cannot render as a read; capture takes under two minutes in practice | Phase 1 signal |
| **3 · The round-trip** | Quiz token out, placement + email back into the row | A stranger who takes the quiz appears in the ledger at Tier 1 without manual entry | Phase 1 shows quiz placement tracks the Transition axis |
| **4 · The corrected loop** | Learning by ripeness yield and gate-open rate; brief-version attribution | Learnings answer "which brief version produced ripe people," not "which copy got replies" | Phase 2 + enough Tier-2 data |
| **5 · The mirror** | The tool drafts the next brief version from its own outcomes | A proposed brief diff that Sasha judges worth reading | Phase 4 |

---

## 12. Open questions for Sasha

1. **Who scores the bench?** The reads are his; nobody else can score Locus or Uniqueness on a real person. Estimated 30-45 minutes for twenty cases. Is that his time or is a subset enough?
2. **Consent for the Fathom material.** The video-proof item (roadmap VP1/Q4) already established that consent precedes extraction. Does retrospective *internal* scoring from transcripts need the same consent step, or is that only for public use?
3. **Does the bench live in the tool or in the corpus?** In the tool it is queryable; in the corpus it is durable and readable. Recommendation: corpus is the record, tool imports it.
4. **Naming.** "Commercial OS v2" is a version, not a name. If this becomes a named instrument, that naming is his.

---

*Spec written Day 169 (August 28, 2026) after a 27-perspective pass on v1. The center reading that produced it: every instrument in this business is taken by the founder first, and this tool had never been pointed inward at the people whose outcomes are already known.*
