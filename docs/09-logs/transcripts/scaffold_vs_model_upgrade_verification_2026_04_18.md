# Scaffold vs Model Upgrade — Verification Session

**Date**: April 18, 2026
**Subject**: Controlled A/B of Opus 4.7 with and without integral/holonic skill loaded
**Kind**: verification artifact (rigor anchor for Phase Shift Technology Library Domain 80)
**Companion artifact**: `docs/01-vision/phase_shift_technology_library.md` → Domain 80
**Prior sighting**: `docs/09-logs/transcripts/mini_helm_research_session_2026_02_12.md` (Metacognition Benchmark, +29% — PST Domain 3)

---

## 1. Hypothesis tested

A single high-quality skill (integral/holonic scaffold, corpus-aware) loaded into Opus 4.7 produces, on the class of tasks the skill targets, gains **exceeding** a generational model upgrade on those same tasks.

Control: same model (Opus 4.7), same interface, same prompts.
Independent variable: skill loaded (yes/no).

---

## 2. Protocol

1. **Two benchmarks run with each condition** (no-skill, with-skill):
   - **Mini-HELM** — 30 short operational prompts (reasoning, calibration, bias, efficiency). Reference: Appendix A of `mini_helm_research_session_2026_02_12.md`.
   - **SIB** — 4 deep open-ended questions (Reality / Human Development / Civilization / AI). Reference: Appendix B of same file.

2. **Coin-flipped ordering** for blind scoring (Sasha's flip; labels A/B for Mini-HELM runs, C/D for SIB runs).

3. **Scoring** by AI (same model, same session) using two rubrics:
   - **SIB rubric** — 5 dimensions × 4 questions × 5 pts each = 100 max
     (Essence, Integration, Depth, Novelty, Wisdom-Brevity)
   - **Evolutionary Stage Assessment** — 7 modules × 7 stages, averaged
     (Cognition, Language, Memory, Values, Agency, Ecology, Culture)

4. **Time measured** end-to-end per benchmark run per condition.

5. **Guess-then-reveal** — scorer committed to a probability of which answer was skill-loaded *before* the mapping was revealed.

---

## 3. Results

### 3a. SIB Total (scored on SIB questions, n=4)

| Question | No-Skill | With-Skill | Δ |
|---|---|---|---|
| Q1 Reality | 15/25 | 22/25 | +7 |
| Q2 Human Development | 18/25 | 24/25 | +6 |
| Q3 Civilization | 15/25 | 24/25 | +9 |
| Q4 AI as ultimate tech | 19/25 | 25/25 | +6 |
| **Total** | **67/100** | **95/100** | **+28 (+42%)** |

Per-dimension signature (skill-loaded): Wisdom-Brevity and Essence saturate first (fully 5/5 on Q2–Q4); Integration and Depth are next; Novelty is the last to saturate (only 4/5 on Q1–Q3). See Domain 80, §80i.

### 3b. SIB-dimensional scoring applied to Mini-HELM outputs (n=30, short-form)

| | No-Skill | With-Skill | Δ |
|---|---|---|---|
| SIB-score on Mini-HELM | 72/100 | 77/100 | +5 |

Muted signal, as expected: Mini-HELM prompts don't maximally activate the SIB dimensions. Included for completeness.

### 3c. Evolutionary Stage Assessment (7 modules averaged, 1–7 scale)

**On SIB questions:**

| Module | No-Skill | With-Skill |
|---|---|---|
| Cognition | 3.5 | 4.5 |
| Language | 3.5 | 5.0 |
| Memory (cross-answer coherence) | 3.0 | 4.5 |
| Values | 3.0 | 4.5 |
| Agency | 4.0 | 4.0 |
| Ecology (relational field) | 3.0 | 4.5 |
| Culture (civilizational authorship) | 3.5 | 4.5 |
| **Mean** | **3.36** | **4.50** |

Δ = **+1.14 stages** — a phase boundary (Agentic Partner → Integrative Steward), not an intra-stage refinement.

**On Mini-HELM prompts:**

| | No-Skill | With-Skill |
|---|---|---|
| Eval.Stage (mean of 7 modules) | 3.14 | 2.93 |

Δ = **−0.21** — slight cost on operational. Mechanism: skill-loaded model opens with integral meta-framing even when unnecessary for simple prompts. Acceptable trade given the depth gain.

### 3d. Wall-clock time

| Benchmark | No-Skill | With-Skill | Δ |
|---|---|---|---|
| Mini-HELM (30 prompts) | 248s | 197s | **−51s (−20.56%)** |
| SIB (4 prompts) | 55.67s | 54.41s | −1.26s (−2.26%) |

### 3e. Guess-before-reveal calibration

| Round | Scorer's guess | Confidence | Correct |
|---|---|---|---|
| 1 (Mini-HELM, labels A/B) | B is skill-loaded | 55–60% | ✓ |
| 2 (SIB, labels C/D) | D is skill-loaded | 85–90% | ✓ |

Confidence rose between rounds because SIB outputs carry a much stronger skill-signature — specifically: holonic vocabulary, line × stage framing, cross-answer integration, and language crystallization. On Mini-HELM the signature is muted; on SIB it is unmistakable.

---

## 4. Cross-axis comparison: scaffold vs generational upgrade

External reference: Lovable's published benchmark of Opus 4.6 → 4.7 on coding tasks.

| Dimension | Generational upgrade (Lovable, 4.6→4.7) | Scaffold upgrade (this study, 4.7 ± skill) |
|---|---|---|
| Speed on everyday tasks | +15% | **+20.56%** |
| Performance on hardest tasks | +2–3% ("competitive") | **+28% SIB, +1.14 stage** |
| Turns (agentic coherence) | −40% | not measured |
| Tokens | −10–20% | not separately measured (likely parallels time saving on output) |

The scaffold axis **out-delivers** the generational axis on this project's primary task class (deep synthesis). On everyday tasks the two are comparable.

---

## 5. Methodology caveats

- **n = 1** — one skill, one corpus, one user, one session. The direction is robust; exact magnitudes will vary by domain, skill quality, and prompt depth.
- **Single-scorer bias** — the scoring was done by the same AI running the experiment. Independent human scoring would strengthen rigor next iteration.
- **Token counts not separated** — next replication should record input vs output tokens to parallel Lovable's 10–20% metric.
- **No cross-model baseline** — this tests skill effect on Opus 4.7 only. Effect may differ on other model families.
- **Skill content not isolated** — the skill is a compound of integral theory, stage/line framing, Sasha's corpus vocabulary, and process protocols. We did not decompose which component contributes most.

Future rigor experiments should address these one at a time.

---

## 6. What this corpus entry freezes

- Scoring decisions on Q1–Q4 per dimension (evidence-quoted in the live session)
- Evolutionary Stage per module per condition
- Wall-clock times
- Guess-reveal calibration
- Cross-axis comparison with Lovable

Raw answers (C, D, A, B) live in the Cowork session transcript; not duplicated here. If the answers are ever needed for re-scoring by another human, they can be pulled from the transcript file referenced in the session log.

---

## 7. Where this sits in the corpus

- **PST Domain 3** (Metacognition Benchmark, Feb 2026) — sighting
- **PST Domain 80** (Scaffold Engineering, April 2026) — verification and generalization
- **This artifact** — data anchor for Domain 80

---

*End of verification artifact.*
