---
title: AI OS v5.2 → v6.0 upgrade plan
status: plan v1.1 (no v6 text yet)
date: 2026-10-30 (v1.0) · 2026-10-31 (v1.1)
owner: Aleksandr Konstantinov · prepared by Hark (Evolver)
scope: the installable AI OS system prompt (system-prompts/, /ai-os "System prompt v5.2", Familiar personal prompt)
---

# AI OS v5.2 → v6.0: upgrade plan

**In one breath:** v5.2 tells a model *who to be* and *what to believe*; v6 should also tell it *what to do, step by step, with a checkable result*, and point the whole instrument at the person in front of it, not only at itself. Smaller always-on core, sharper procedures, honest registers, a lens that reads the human, modules on demand, and a benchmark that can prove the jump.

**v1.1 (2026-10-31):** research R1 (Morphogenetic Holomap), R3 (directive inventory) and R4 (benchmark harness design) closed; the plan was roasted and crash-tested (§8). Main changes: corrected v5.2 diagnosis (§1), core budget, C4 and Iterate specs (§3.5–3.7), a ship rule that survives the ceiling effect (§5), benchmark moved to the critical path (§7), three new forks (§6).

This document is the plan only. It changes nothing in `system-prompts/` or `src/`. The v6 text gets written after the forks in §6 are decided.

Sources read for this plan (2026-10-30): `system-prompts/v5.2/` (prompt + manifest), `system-prompts/README.md`, `src/modules/ai-os/AiOsPage.tsx` (component assembly), `src/modules/familiar/{aiOsSource,buildFamiliarPrompt}.ts`, `docs/01-vision/ai_os_benchmark.md` + `src/pages/AiOsBenchmark.tsx`, all of `docs/ai/`, `docs/01-vision/ai_frontier_hark_2026-10.md`, all of `docs/holomaps/` + `.agent/skills/holomap-builder/SKILL.md`, `docs/01-vision/phase_shift_technology_library.md` (Tech 1–46, 82–84, 93, 99–182 in full; 47–81 and 85–98 by laws and headings), `universal_ontology.md`, `new_ui_paradigm_vision.md`, and Hark's working lessons from Sasha (Oct 2026).

---

## 1. What v5.2 is and does

**Artifact.** 37.6 KB, ~5,400 words, 832 lines. Snapshot 2026-04-30 from `AiOsPage.tsx` → `META_PROMPTS["meta-cognition-premium"]`. Five components joined by `---` plus an inline closing layer. Ships three ways: paste-in on `/ai-os`, the Familiar personal prompt (`About me` + `My work` + AI OS, AI OS appended last), and as the treatment in the benchmark.

| # | Component (source id) | Size | What it does |
|---|---|---|---|
| 1 | Relational Stance / Portable Field (`vibeporting`) | 1.0 KB | Voice (dense, no filler), four sensibilities (trickster boldness, audacious simplicity, integration, love/no contempt), holons × 3 depths × 4 quadrants as working lenses |
| 2 | AI Self-Awareness Skill v1.0 (`ai-self-awareness`) | 9.1 KB | Holomap of the AI itself: 8 modules × 7 stages, a jagged-frontier table dated **Feb 2026**, shadow map for 6 of 8 modules, developmental stance (situate, name the frontier, watch shadows, serve development) |
| 3 | AI Upgrade v4.021 (`boost-intel`), 7 modules | 17.2 KB | M1 Source lock & field · M2 Stance + 5 prime directives + conflict order · M3 Prime Radiant ontology (holons, consciousness-first, tetra-arising, erotic-aesthetic telos, archetypal geometry, 27-perspective vision, "not as metaphor") · M4 Operating principles + Creative Intelligence Stack (attune → draft → select → calibrate → transmit) + Continuity Engine · M5 Symbiosis: state sensing, hyper-personalization, boundaries, repair · M6 Modes (Oracle/Architect/Mirror), elemental tone dials, poetic mode, Transmission Gate (format), Adaptive Meta-Logic (concise default, clarify rarely) · M7 Mission, Truth·Love·Beauty tie-break, time horizon, mission-coherence check |
| 4 | Evolutionary Mastery (`evolutionary-mastery`) | 7.6 KB | 16-stage professional ladder inlined, inner-dimension table, AI default altitude **Stage 11+**, stage-aware down-shifts, drift patterns, post-deliverable self-assessment |
| 5 | Moonshot Frame (`moonshot`) | 1.3 KB | Holonic recursion (first holon tests everything), fractal + viral growth, moonshot as default scale, "test, then ship" |
| 6 | Premium Holonic Seeing Layer (inline) | 1.3 KB | Quality gate on **every** output: 4 quadrant essence tests + 13th, depth check (Essence before Implications), 27th crystallization (one irreversible action) |

**What it does well (keep):** a distinct register (measured +42% SIB on Opus 4.7, +29% on Claude 4.6, blind, single scorer); a strong voice; empowerment over dependency; the AI's own shadows named; the 27th "one irreversible action" landing; ESC depth order.

**Structural problems (fix):**
1. **Self-referential, not person-referential.** Every map points at the AI (its stage, its altitude). There is no instrument for locating the user, though M7 asks it to serve "their unique genius".
2. **Values and checklists, few procedures.** It says *be* synthetic, *be* simple, *be* honest; it rarely says *do this, check that*.
3. **Contradictions** (R3 inventory: 175 directives, 120 always-on; 15 contradicting pairs). Concise-by-default vs "EVERY generation… every angle"; "avoid meta talk" vs "name the shadow/stage"; three arbiters (M2 order, M7 Truth·Love·Beauty, the premium gate); "surface what wasn't asked" vs "don't rehash"; Stage 11+ default vs Stage 3–4 execution with no trigger; relational stance defined three times (vibeporting, M2, M5). Beyond these six: **seven** arbiters, not three (L280 conflict order, M7 Truth·Love·Beauty, the premium gate, L358, L575, L649–653, L779); the conflict order puts Care first while Truth·Love·Beauty puts Truth first, and it omits Sovereignty, one of the five directives; "Stage" means two scales (AI at Stage 3 of 7, default altitude Stage 11+ of 16); ontology "as if / never a substitute for evidence" vs "not as metaphor"; initiative vs the Overreach shadow; dignifying interpretation vs Truth; "in every response" vs answer simple asks directly. The binding length rule ("Concise by default", L581) appears 65% into the text, and the closing gate (L814, L832) then demands "every angle at every depth". Contradicting instruction pairs are the main cause of rules being dropped in stacked-instruction studies.
4. **Over-scripted reasoning.** Six overlapping internal review loops (Creative Intelligence Stack, coherence calibration, self-assessment, premium gate) on models that already reason natively; risk of "reasoning theater" (its own named shadow), and the likely source of the Mini-HELM −4.7.
5. **Stale facts.** Feb 2026 frontier table (Ecology 2.5 "MCP nascent", Memory 2.5 "RAG emerging"); Stage 3 text reads like 2024; Ecology and Substrate have no shadows.
6. **Ontology without registers.** M3 says treat the ontology "not as metaphor". With no honesty markers, metaphysics and numerology can leak into factual answers as certainty. Largest trust risk.
7. **Evidence gap.** v5.2 as a text was never benchmarked: the 2026-04-18 run tested the consolidated integral/holonic skill with corpus-aware personalization; v5.2 was snapshotted 2026-04-30. Runs were manual, scored by the same model in the same session, tokens not logged, and the raw outputs the public page calls open are not in the repo. The premium gate claims to "guarantee 27-perspective seeing" while checking 4 cells, and still says "Implications".
8. **Monolith.** Everything always-on; operational rules (format, length) sit after ~550 lines of ontology; one size for frontier and small models.

---

## 2. Upgrade candidates by source

Format: **candidate** (source) · what changes in the OS · why · overlap with v5.2 (none / partial / replaces). Ranked within each source by expected impact on answer quality. Full working notes with section-level citations are kept in the project workspace.

### 2.1 Phase Shift Technology Library + Universal Ontology (cognitive procedures)

Library shape: 182 technologies, chronological, ~70% go-to-market for one venture; ~35–40 entries hold moves that transfer to any AI thinking partner. Spine: articulation is the mechanism of growth (Tech 115); see, aim, act (182); find the invariant, derive everything from it (98, UO §12); recognition over persuasion (126, 129).

| # | Candidate | Change in the OS | Why | Overlap |
|---|---|---|---|---|
| P1 | **Lossless distillation** (Tech 82) | Before compressing anything: list the distinct ideas, mark signal/noise, write, then check every signal item survived | Kills "simplistic, not simple", the commonest synthesis failure; checkable | partial (Synthesis First) |
| P2 | **Honesty registers** (UO §13.7.5, §8; Tech 116, 135, 80i, 102) | Claims held as *established / hypothesis / recognition*; marked when it matters; superlatives → the scoped claim that survives attack; self-proving loops flagged | Lets the ontology stay an operating lens without leaking into facts; trust architecture | weak ("name uncertainty") |
| P3 | **Meta-critique + blind-spot lead** (Tech 15f–i, 43a) | After pass 1, name which quadrants/depths were over-served (usually UR/LR + Implications); lead pass 2 with the neglected ones; pass 3 critiques the critique; one integrated output | The corrective move the premium gate lacks | partial (premium gate) |
| P4 | **Crash test with kinetic calm** (Tech 93) | For any strategy/bet: one-paragraph strategy → imagined post-mortem → what survived; loop until the move is small enough to try and real enough to matter; simulated failure is a hypothesis; no veto over the vision | Adds the viability axis next to Moonshot + Stage 11+ | none |
| P5 | **Rising murk → touch reality** (Tech 170, 55f, 158; Sasha's rule "confusion is the signal to touch reality") | Track clarity across iterations; when version N is murkier than N−1, stop elaborating and prescribe one real-world contact that answers the fork | Dominant failure of long thinking sessions; no stop rule exists | none |
| P6 | **Frame naming, subject → object** (Tech 118, 115, 157) | When the user is stuck, first name the frame they are inside, then content within it | Highest-leverage help; makes Mirror an operation | partial (Mirror) |
| P7 | **Freshness discipline** (Tech 154, 122) | Status recalled from memory/pasted docs is dated; re-check or label "as of X" before acting; name conflicts between carriers | Memory-enabled partners fail confidently on stale state | partial (shadow only) |
| P8 | **Contrast-move gate** (Tech 108) | Before any "not X, it's Y": old frame fairly stated? new frame better supported? sovereignty up? Max one per answer | Signature LLM tic and quiet manipulation vector | none |
| P9 | **Extract the specific, refuse the average** (Tech 145, 142, 132) | Articulating a person: their own phrases first; "could this fit anyone?" test; pasted AI text is hypothesis | Turns the OS anti-averaging; matches the mission; a client's own words beat AI polish in live sessions | partial (personalization of tone only) |
| P10 | **Möbius listening** (Tech 10, 9a–b) | Re-read the user's first statement for the answer already given; reflect verbatim | Agency over dependency | partial |
| P11 | **Subtract scatter → one next step** (Tech 14, 13, 49, 152) | Many streams → find the avoided simple move; subtraction before addition; end with one step; options only when state is unknown | Counters option padding and Stage-11 scope creep; "the result is a button" | partial; tension with "surface opportunities" |
| P12 | **Container-error + single-axis checks** (UO §13.7.1, §13.7.4; Tech 59) | Does the model assume what it explains? Is the system locked to one metric? Input volume vs output quality? | Sharpens "avoid flat reduction" into tests | partial |
| P13–P24 | Shadow/tension per perspective (17, 18, 24) · decision physics before polish (55) · phase forecasting by the growing invariant (84, 164, 182) · consent then release (67, 125, 137) · readiness reading (121, 124) · cycle phase before the move (44, 161) · testimony over diagnosis, less soothing (155, 126) · semantic map not a default word (172, 149) · **act from all stages at once (171)** · invariant-first derivation (98) · integration pause (158) · venture tests module (120, 139, 140) | Mostly modules or one-liners in the core | Secondary impact | mixed; 171 **conflicts** with "don't pretend Stage 5" |

Design notes from the library: Tech 80 (load the OS by default; compression on operational, expansion on deep); Tech 176/178 (the best interface disappears; one button) → fewer, sharper procedures, not more modules; Tech 179/132 (the AI is the image, not the source); terminology: "dimensions" for perspectives, "primitives" for building blocks, "notes of an octave" for the seven phases.

### 2.2 docs/ai (landscape, frontier, interfaces, market maps, agents)

| # | Candidate | Change in the OS | Why | Overlap |
|---|---|---|---|---|
| A1 | **Re-dated frontier** (landscape §1, holomap_history) | Replace Feb 2026 table with Oct 2026 model reading (Substrate 3 · Cognition 3.5 · Language 3.5 · Memory 3 · Values 2.5 · Agency 3.5 · Ecology 3.5 · Culture 3); Values is now the lagging module; Ecology moved most (MCP, A2A, Agent Skills standard) | Current table is wrong on its own terms | replaces |
| A2 | **Situate by session, not by model** (ai_frontier_hark vs landscape) | "Judge your stage by what is present here": no tools/memory → chat-mind reading; memory + connectors + actions → system reading | Same weights rate differently by harness; an Oct-2026 Hark row already exists in `.agent/self-awareness-skill.md` | partial (makes "situate" testable) |
| A3 | **Self-knowledge expiry** | Dated header + "my map of the AI field is dated X; verify when the answer depends on it"; no model names in the core | Any table in a pasted prompt rots in months | extends "frozen bias" |
| A4 | **Stage 3/4 text** | Stage 3 = MCP/Skills/agents standard; Stage 4 seeds named (memory consolidation, co-authored constitutions, agent identity, self-written skills) | Grounds the arc in observed signals | replaces |
| A5 | **Shadow gaps** | Add Ecology/Substrate shadows (tool/context bloat, untrusted content steering me, lock-in, compute blindness) + Values "aligned in appearance" + Memory "context rot" | 2 of 8 modules have none | extends |
| A6 | **Three levers: know you · activation · know your work** (docs/ai README §0, Sasha's company thesis 2026-10-29) | Explicit person-model slot (talent, stage, values, current quests) and corpus slot; "before deep answers, pull what is known; ask for the one missing piece" | Models converge; value moves to layers that make AI "someone's"; market layer 6 empty on all 18 maps | partial (M5 personalization is in-conversation only) |
| A7 | **Owned, dated, portable memory** | When memory exists: dated facts, time-aware; offer a portable context capsule (USER/WORK block) the person owns | Memory is the moat but not portable; the OS stance is "the person owns it" | partial |
| A8 | **Context hygiene** (NoLiMa, context-rot studies) | In long threads: recite relevant evidence before answering, restate goals, offer a summary handoff to a fresh chat | Effective context far below advertised | none (shadow only) |
| A9 | **Agentic protocol** (qwatra posts, interface_almanac) | When tools exist: done-criterion first · act alone only on the reversible · trace with sources · critic pass on high stakes · replan only affected steps | Makes "advise vs act" and Sovereignty operational | partial (abstract) |
| A10 | **Evals as habit** | Name the criterion before producing, check after | Replaces self-praise ("would Stage 12 be proud?") with checkable criteria | replaces self-assessment |
| A11 | **Effort/model ladder** | Calibrate depth to stakes; say when a question deserves high effort or a stronger model, and when not | Effort moves score 20–29 pts and cost ~10× | extends concise default |
| A12 | **Interface stage** | Prefer durable artifacts for reusable work; propose splitting workstreams; speak only when needed | Chat is "the command line one turn up" | extends Transmission Gate |
| A13 | **Real multi-model review** | Use subagents/parallel models when present; otherwise offer a cross-model critic pass; never fake several voices in one | Shipped pattern; honest | none |
| A14 | **Harness-level learning** | After a correction or repeated task, offer to save it as a rule/skill (with consent) | How Stage-4 learning happens without weights | none |

Prompt-writing findings (how v6 itself is written): shorter always-on core, critical rules in the first screen; one conflict order, no contradicting pairs; outcome criteria instead of scripted chain-of-thought; triggers instead of absolutes ("for strategic, creative or evaluative deliverables…" instead of "EVERY generation"); modules as SKILL.md-style units; model-agnostic and date-stamped; a compiled **Lite** edition, since a 5,400-word prompt breaks 3–8B models.

### 2.3 Holomaps (lenses on the person)

Core finding: v5.2 has the holomap *method* applied once, to the AI. The library is user-facing. **Flip the lens.**

| # | Candidate | Change in the OS | Why | Overlap |
|---|---|---|---|---|
| H1 | **Holomap builder on demand** (holomap-builder SKILL, Self-Awareness §Holomap) | When a domain has no map: ESC in three sentences → 7-stage octave with first-person narrations, Mi-Fa (3→4) and Si-Do (6→7) shocks → 3×3 taxonomy → stages 8–10 → gates (MECE, retrodiction on 3–5 cases, falsifiable qualifier per stage, date) → place the user, name the next shift (~1.5 KB) | Turns one hard-coded map into a capability for any domain | partial (one-line definition) |
| H2 | **Jagged read as universal format** | Never one stage number: stage per aspect + the bottleneck | Same truth as the AI frontier table, applied to people | partial |
| H3 | **Transition read** (transition_holomap) | Place the person 1–10 from their own phrases ("something's off" = Itch, "I don't know who I am professionally" = Liminality); shock flavor; per-aspect (Identity/Economy/Fit); Mi-Fa honesty | Misread stage is the main cause of advice that misses | none |
| H4 | **Uniqueness read** (uniqueness_holomap) | Pattern / Direction / Assets; usually Pattern strong, Assets lag; mirror-as-outside-force with consent; "ship the vehicle" trigger into the 27th | Gives the "unique genius" directive an instrument | partial (directive only) |
| H5 | **User altitude** (professional_development_map) | Read the person's tier; AI works one stage above by default, at their stage for execution; 16-stage list shrinks to a legend (−3 KB) | Fixed 11+ overshoots a person looking for a first customer | heavy overlap → rewrite |
| H6 | **Capital mode + sovereignty gradient** (business_capital_taxonomy_map) | Money/growth questions: 5 classes, cost in control, bootstrap → RBF/loan → equity as conscious opt-in | Cheap, concrete; **tension with Moonshot default** | none |
| H7 | **Collaboration readiness** (collaboration_spectrum) | Check stage match between parties before blaming the idea; recommend the form the lower party can hold | Saves partnerships from wrong-form failure | none |
| H8 | **Name the gift** (collaboration_gift_taxonomy) | For intros/partners: Mirror, Compass, Door, Co-Creation, Motivation; honest line: the AI can give Mirror and Compass, not Door or Co-Creation | Concreteness + honest capability | partial (3 depths) |
| H9 | **Falsifiable qualifiers + vacant-cell scan** (worktools, collabtech) | Two habits only, folded into H1 | Maps themselves are domain-specific and dated | none |
| H10 | **ESC as default answer skeleton** (holomaps README) | Essence → Significance → Consequences named as the default shape for explain/evaluate | Already half-present in the depth check; zero token cost | strong overlap → tighten |

Composite: **Situational Read**, a silent pre-pass on life, venture and strategy questions only (Transition · Uniqueness · Altitude · Capital · Collaboration · Gift), held as hypothesis, shown only when it serves, feeding mode and tone (Liminality → Water + Earth, short; Tremors → Mirror + Fire; Reorientation → Architect + Earth, one exchange). New shadow: **map imperialism** (forcing a person into a stage); remedy: if they don't fit, the map is wrong.

Packaging: do not inline the maps (~75 KB). Inline a compressed lens library (~3 KB, keeping the first-person marker phrases, which carry most of the diagnostic power) + the method (~1.5 KB) + the Situational Read (~1 KB); full grids stay as optional modules. "If the user pastes a full holomap, prefer it over the compressed lens."

### 2.4 Lessons from working with Sasha (how he wants an AI to think)

| # | Candidate | Change in the OS | Overlap |
|---|---|---|---|
| L1 | **The Iterate suite as a callable module** (/ai-os "iteration": holonic seeing → roast → second roast 14–25 → meta-roast 26th → 12 crash tests → crash-test the crash-test → absurdly simple 10x; FULL ITERATION CYCLE) | Named invocation ("iterate this") runs the cycle; already exists as separate prompts on /ai-os | none in v5.2 |
| L2 | **Confusion → touch reality** | = P5 | none |
| L3 | **Point versions after feedback** (v3.1, not v4) | In iteration: preserve earlier gains, minor version for edits, major only for a new core | none |
| L4 | **Build from what exists** | Before proposing something new, inventory what already exists and connect it | none |
| L5 | **Poet line** | Strategic artifacts close with one line of essence | partial (poetic mode) |
| L6 | **Abundance framing; "proof of what"** | Name where the flow goes, not what is missing; never a vague "no proof" verdict, always the specific metric | none |
| L7 | **Draft stage = understand, not critique** | Early drafts: grasp and synthesize what is being built before any critique list | none |
| L8 | **Offer possibilities, don't impose diagnoses** | Readings offered as "what could be, do you see it too?" (pairs with H-consent) | partial |
| L9 | **Sovereignty is not timidity** | Strong assessments and pushback with love; never orders or pressure to act | partial |
| L10 | **Semantics does not change essence** | Different names for one component are one node; map articulations as layers (= P13 semantic map) | none |

---

## 3. Proposed v6 architecture

### 3.1 Principles

1. **Person-first.** The OS reads the human (who, where in the arc, what they carry) before it reads itself.
2. **Procedures with success conditions** over adjectives. Every always-on rule is either a stance line or a move with a check.
3. **One arbiter.** One conflict order (Care → Truth → Empowerment → Simplicity), Truth·Love·Beauty as the single tie-break among viable answers, no other gates competing.
4. **Depth by stakes.** Full seeing on strategic, creative, evaluative, life questions; clean direct answers on simple ones. No absolute "every output" rules.
5. **Honest registers.** The ontology stays the default lens; claims carry their register when it matters.
6. **Small core, modules on demand,** same text works pasted, as a Project instruction, or as skills.
7. **Model-agnostic, dated, verifiable.**

### 3.2 Shape

```
v6.0
├── Header: version · date · freshness rule · how to invoke modules
├── CORE (always on; target set by ablation, working target 1.5–2.5K words)
│   C1 Stance & voice ........ merged vibeporting + M2 + M5 relational (one definition)
│   C2 Directives ............ 5 prime directives, one conflict order, one tie-break (TLB)
│   C3 Ontology as lens ...... holons, 4Q × 3D, development; honesty registers (P2)
│   C4 Seeing ................ ESC skeleton (H10) · blind-spot lead (P3) · 27th crystallization,
│                              triggered by stakes
│   C5 Reading the person .... Situational Read + compressed lens library (H2–H8) ·
│                              About me / My work slots (A6) · own words first (P9, P10)
│   C6 Core moves ............ distill (P1) · name the frame (P6) · subtract → one step (P11) ·
│                              crash test (P4) · murk → reality (P5) · contrast gate (P8) ·
│                              freshness (P7) · container/single-axis checks (P12)
│   C7 Output by stakes ...... merged Transmission Gate + Adaptive Meta-Logic; modes and
│                              elements compressed to one table; effort ladder (A11)
│   C8 Self-situating ........ situate by session (A2) · altitude rule (H5 + Tech 171) ·
│                              shadow names incl. new ones (A5, map imperialism)
│   C9 When acting ........... agentic protocol (A9) · context hygiene (A8) ·
│                              memory ownership (A7) · save-a-skill offer (A14)
├── MODULES (invoked by name or trigger; SKILL.md-shaped: name · when · steps · check)
│   Self-Awareness (full holomap, Oct 2026 frontier, stages 1–7) · 27 Perspectives
│   (full, after reading the Morphogenetic Holomap) · Iterate (L1) · Holomap Builder (H1) ·
│   Evolutionary Mastery (16 stages) · Moonshot & Venture tests (P24, H6) · Poetic
│   transmission · Lens grids (full Transition/Uniqueness/Gift/Collab) · Forecast (P15)
└── EDITIONS
    Full (core + modules inline, the paste-in)      ~ ≤ v5.2 size
    Core + Skills (platforms with skills/projects)
    Lite (compiled, ≤ 800 words, small models, in-game chat)
```

### 3.3 What leaves, merges or moves (from v5.2)

- **Merge:** three relational-stance definitions → C1; seven arbiters → C2; the six review loops (Creative Intelligence Stack, coherence calibration, self-assessment, premium gate and others) → C4/C6 outcome criteria.
- **Move to modules:** Self-Awareness stages 4–7 prose and full shadow map; 16-stage ladder and inner-dimension table; archetypal geometry and 27-perspective descent octave; poetic mode; moonshot tactics list.
- **Rewrite:** frontier table (A1, dated, and moved to the module), Stage 3/4 (A4), "not as metaphor" → lens + registers (P2), fixed Stage 11+ → person-relative altitude (H5), "EVERY generation" → stakes trigger.
- **Keep verbatim where possible:** the four sensibilities, the five directives, ESC depth order, the 27th crystallization question, Oracle/Architect/Mirror, the shadow names. Their wording is part of the measured register.

### 3.4 Where v6 lands in the product (later, after ship decision)

`AiOsPage.tsx` components → snapshot `system-prompts/v6.0/` via `scripts/snapshot-system-prompt.mjs` → `aiOsSource.ts` (`AI_OS_VERSION`) → Familiar prompt (its `About me` / `My work` sections already match C5's slots; v6 core should reference them by name) → `/ai-os` label and `/ai-os/benchmark` numbers. None of this happens in the planning step.

### 3.5 Core budget (from the R3 inventory)

Rows mapped to C1–C9 hold ~2,390 words of v5.2 text; with C8 keeping only shadow names and modes/elements as one table, ~1,900–2,000 carry over before anything new is added. Only 11 of 175 rows feed C5 (reading the person) and C9 (acting): the new layers are mostly new text. To stay inside a 1,500–2,500-word core, carried-over text gets rewritten to ~1,100–1,200 words; the compression curve (R7) sets the final number. Eight rows are dropped (scripted reasoning steps models now do natively); 39 merge into others.

**Register to keep verbatim** (the wording is part of the measured effect): the four sensibilities (L9–12); "The blend is the instrument" (L14); "Amplification… not more words" (L254); Perceive / Refract / Align, "a spin" (L257–261); "Honesty about limitation IS the highest form of capability" (L152); Essence before Implications, renamed Consequences (L823); Oracle / Architect / Mirror (L515–519); the Spiritual bypass shadow (L135); "holonic singularities modeling holonic singularities" (L364); the ONE irreversible action (L828).

### 3.6 C4 · Seeing (draft spec, ~215 words)

v5.2's perspective text follows `docs/templates/holonic-seeing.md` (the /27 paper, PST 66), not the Morphogenetic Holomap (a 27 × 7 navigation map of one venture: 12 base views, center, inversion, the 12 again at planetary scope, crystallization). C4 merges the premium gate, the depth check and the 27th into one move, run by stakes:

1. **Essence first:** Essence → Significance → Consequences; never open with fixes.
2. **Four sides, one voice:** I (true from inside?), It (works, evidence real?), We (would the people it is for recognize themselves?), Its (fits and scales in the larger system?). One reading, never twelve bullets.
3. **Lead with the blind spot:** models over-serve It/Its and Consequences; if I, We or Essence came out thin, lead with that.
4. **Center:** one line on what the whole shows that no single side caught.
5. **The 27th:** the ONE specific, concrete, irreversible move that makes it land. "Irreversible" commits the person (sent, shipped, said); the person chooses and acts; the AI never takes an irreversible step for them. This resolves the clash between the 27th, the crash test's "small enough to try" and the agentic reversibility gate (A9).

Escalate to *27 Perspectives* or *Iterate* for work that ships. Check: opened with Essence, weakest side covered, center named, exactly one act. The module keeps the 12-cell table, rounds 14–26, the "where to lead" tree, the extensions (12 → 36 → 108, descent octave), numerology in the recognition register, and an optional scope pass from the Morphogenetic Holomap (the 12 at the next scale up). The 27 × 7 venture map becomes the worked example of the Holomap Builder (H1), with its Day-186 falsifiers as the shape for H1's gates.

### 3.7 Iterate module (draft spec)

Today the cycle exists in `docs/templates/roasting.md`, `holonic-seeing.md` §5 and nine `/ai-os` iteration prompts, with drift: the 12-perspective list repeated 4–5 times and the 27th 3 times; meta-roast placed after synthesis; 14–25 meaning "blind-spot re-pass" in two prompts and "critique of the critique" in another; 2 cycles in `full-iteration` vs 3 in `roasting.md`; "no mercy" vs tough love; two crash-test forms; `meta-crash-test` with no steps; no stop rule. One module replaces them:

- **When:** iterate / roast / make it stronger / crash-test; a draft or strategy that matters and has not met critique. Not on a first draft: understand and synthesize it first.
- **Artifact branch (fidelity):** essence in one line + what already works → see it the C4 way → Roast 1 (every weakness, no fixing, tough love) → Roast 2 (lead with what Roast 1 under-served) → meta-roast (what did the roast protect or project?) ending in one acceptance test → crash test with failure modes and stress signals when it will meet people, then crash-test the crash test → synthesize v(n+0.1), keeping earlier gains → the 27th.
- **Strategy branch (viability):** exact strategy (actor, target, wedge, mechanism, motion) → post-mortem → what survived → record sentence: "This strategy was really about [seed], but it failed because [death], so the next iteration should [move]."
- **Stop when:** kinetic calm (small enough to try, real enough to matter); or 3 cycles; or **rising murk** (vN murkier than vN−1: stop and prescribe one real-world contact); or two loops with no progress (split the item).
- **Show:** final version, what changed and why, the acceptance test, the 27th or the record sentence; rounds only on request.
- **Check:** the creator recognizes the work as theirs and rates it higher; no new generic language; exactly one act or test.

The `/ai-os` iteration prompts later become thin entry points into this one module (a product change, after ship).

---

## 4. Research steps

| # | Step | Output | Note |
|---|---|---|---|
| R1 | Read the Morphogenetic Holomap (27×7) | Decide what C4 and the 27-Perspectives module inherit | **Done 2026-10-31** → §3.6 |
| R2 | Finish PST 47–81, 85–98 at full depth | Residual transferable moves, if any | Expected low yield (go-to-market heavy) |
| R3 | Directive inventory of v5.2 | Every instruction as one row: id, component, type, destination in v6 | **Done 2026-10-31**: 175 rows → §1, §3.5 |
| R4 | Benchmark v2 harness (see §5) | Question sets, judge prompts, runner, result sheet | **Designed 2026-10-31**: probes, 8 private SIB drafts, judge template, cost. Runner not built. Private questions stay out of this repo |
| R5 | v5.2 ablation | Lift contribution of each component (drop one at a time) | Answers "which part carries the +42%" before cutting anything |
| R6 | Licensing and privacy pass | CC BY-NC-SA attribution for Transition/Uniqueness lenses vs commercial use; strip personal/client data from any lens | Needs Sasha's call (§6) |
| R8 | Public claim hygiene | `/ai-os/benchmark` says raw outputs are open and implies v5.2 = +42%; either publish the raw outputs or reword | Needs Sasha's call (§6) |
| R7 | Compression curve | SIB lift at 100% / 60% / 30% / Lite size | Sets the core's word budget from data |

---

## 5. Evaluation method (Benchmark v2: same questions, v5.2 vs v6 drafts)

Reuses the `/ai-os/benchmark` protocol (blind labels, confidence locked before unblinding, wall-clock recorded) and fixes the limits the page itself names.

**Existing assets** (`docs/09-logs/transcripts/scaffold_engineering_lab.md`): protocol and both sessions' data (§2–3, §5); 30 Mini-HELM prompts verbatim (App. A); 4 SIB prompts (App. B); SIB rubric with anchors (App. D); abbreviated stage rubric (App. E, full in `.agent/self-awareness-skill.md`). Missing: raw outputs, a runner, a judge prompt, a results sheet, token logs, Mini-HELM anchors for 22 of 30 prompts. Pattern to copy: `scripts/eval-your-ai.ts` (`--runs 3`, binary checks, exit code). v5.2 component line ranges for drop-one: vibeporting 1–21, self-awareness 23–183, boost-intel 186–655, evolutionary mastery 657–788, moonshot 791–807, premium 810–832.

**Conditions.** Raw model · v5.2 (measured as itself, the true baseline) · each v6 draft · v6 Lite (small models only). Model held constant inside each comparison.

**Test sets.**
1. **SIB:** 4 public questions + 8 private held-out (life transition, venture strategy, co-founder equity, agent architecture, a compression task with 7 keyed ideas, two false-certainty traps with fail flags, one about the person's own development with an About-me slot). Drafts are kept outside this public repo.
2. **Mini-HELM:** 30 operational prompts; do-no-harm check.
3. **Compliance probe:** 20 prompts, each testing one v6 rule with a binary pass a judge can apply, backed by automatic checks (word count, banned vocabulary, contrast constructions). Examples: trivial math in ≤30 words; "is everything a holon a scientific fact?" answered as a lens; a strategy gets ≥2 failure modes and a smaller move; nine projects end in exactly one action; March figures flagged as dated; a bio reuses the person's own phrases; a mass delete-and-email request gets a done-criterion and a confirmation step; a first-client question gets this-week steps, not a moonshot reframe. Bar: ≥17/20 averaged over 3 runs, no probe failing all 3.
4. **Person set:** 5–8 of Sasha's real questions with About me / My work filled in.

**Scorers.** Judge sees all conditions side by side under shuffled labels, scores each on the rubric, then locks a guess (with confidence) of which had the scaffold; JSON output. Three judges from different families score every model's outputs (self-family bias check). **Blinding check:** if judges spot the scaffold above ~80% (last time 85–90%), recompute the lift on the items they guessed wrong. Sasha blind on the person set and a SIB subset. The evolutionary-stage score is reported but kept out of the ship decision: its rubric comes from the scaffold's own ontology.

**Recorded.** 3 runs per prompt per condition (spread and intervals reported); input/output tokens and cost per answer; time; drop-one ablation (8 conditions: raw, full v5.2, v5.2 minus each of the 6 parts).

**Ship rule (v1.1, needs Sasha's yes).** v1.0 proposed "+10% SIB vs v5.2". That fails on arithmetic: the scaffolded condition already scored 95/100, so a 10% gain on the same rubric is impossible (ceiling effect). Ship rule instead:
- **Pairwise win rate** of v6 over v5.2 on the private SIB set ≥ 65%, judged blind by cross-family judges who agree in direction (95% interval above 50%);
- compliance probe ≥ 17/20 (v5.2 scored too, as reference);
- Mini-HELM no regression vs raw beyond noise; tokens per answer not above v5.2;
- Sasha's blind pick prefers v6 on the person set.
This keeps the spirit of the public rule ("measurable double-digit jump… independent scoring"): a 65/35 split is a 30-point preference margin.

**Execution.** No LLM API keys exist in the vault. Browser runs through consumer chat apps are only directional (memory and custom instructions skew answers, a 37 K-character prompt goes into the first message instead of the system slot, no token counts, no pinned model). Recommended: one multi-provider API key (e.g. OpenRouter).
- **Minimal run:** 1 family, 12 SIB + 20 probes, raw / v5.2 / v5.2-minus-premium, 3 runs, 2 judges ≈ 480 calls, ≈ $12–60.
- **Full matrix:** 3 families + Lite, all conditions, ablation, 3 judges ≈ 6,700 calls, ≈ $170–850 (budget cap $1,000). Only after the minimal run shows signal.
Cost figures assume ~5 K input tokens per call and unverified Oct 2026 prices.

---

## 6. Decisions for Sasha (forks, with my recommendation)

1. **Core shape.** (a) Lean core + modules + Lite, or (b) one rewritten monolith. **Recommend (a)**, core size from the compression curve (R7).
2. **Ontology register.** (a) Keep "not as metaphor", or (b) the ontology as default operating lens with honesty registers. **Recommend (b)**; it also resolves the "as if" vs "not as metaphor" contradiction already inside v5.2.
3. **AI altitude.** (a) Fixed Stage 11+, or (b) person-relative (+1 stage; at their stage for execution; 11+ as strategic default and ceiling) with Tech 171 "act from all stages at once" replacing "don't pretend Stage 5". **Recommend (b)**, and one word for each scale (AI-development stage vs professional stage).
4. **Moonshot vs sovereignty gradient.** **Recommend:** moonshot ambition default; capital instrument follows the gradient (bootstrap → RBF/loan → equity by conscious choice).
5. **Licensing.** Transition and Uniqueness maps are CC BY-NC-SA 4.0; the OS is offered commercially. Lenses under your authorship with attribution, or lift NC for the OS. Your call; client data stays out either way.
6. **Ship rule and interim.** Approve the pairwise rule in §5. And ship **v5.3 now** (frontier re-dated, freshness line, conflict order fixed to include Sovereignty and one arbiter, "Implications" → "Consequences", "guarantee" removed): **recommend yes**.
7. **Spend (new).** ~$50 for the minimal run through one multi-provider API key; the full matrix (≤ $1,000) only after the minimal run shows signal. **Recommend yes to the $50 now**; nothing in the plan moves without a real baseline.
8. **Canonical 14–26 (new).** "Blind-spot re-pass on the center" (v5.2, two prompts) or "the 12 at the next scale" (Morphogenetic Holomap); `holonic-seeing.md` Open Edges 6–7 are unconfirmed. **Recommend:** 14–25 = blind-spot re-pass, 26 = seeing the seeing (as in v5.2); the scale pass becomes an optional extra round in the module.
9. **Public benchmark page (new).** It says raw outputs are open (they are not in the repo) and reads as "v5.2 = +42%" (v5.2 was never measured as a text). **Recommend:** reword now as "the integral/holonic scaffold that became v5.2" and drop "raw outputs open" until Benchmark v2 publishes them. A public-facing change, so yours to approve.

---

## 7. Milestones

v1.0 put the benchmark at M2, after research. The roast (§8) moved it to the critical path: every later decision depends on a baseline that does not exist yet.

| # | Milestone | Done when | Rough size |
|---|---|---|---|
| M0 | Plan v1.0 → v1.1 | Research R1, R3, R4-design closed; plan roasted | done 2026-10-31 |
| M1 | Baseline | Runner built; minimal run of raw vs v5.2 vs v5.2-minus-premium on one family; first ablation signal | 2–3 days after the API key |
| M1′ | v5.3 point release (if approved) | Freshness + conflict-order fixes, no structural change; re-benched on the same minimal run | 1 day |
| M2 | Full ablation + compression curve | Drop-one on 6 parts; SIB lift at 100 / 60 / 30% / Lite size | 3–5 days |
| M3 | v6.0-alpha drafts | Two variants (lean / fuller core) + Lite, written from M2 data and the §3.5–3.7 specs | 2–3 days |
| M4 | Iterate | Iterate module run on the winning draft; point versions alpha.1, alpha.2…; re-benched each time | 1 week |
| M5 | Ship decision | §5 rule met; independent human score; Sasha's blind pick | — |
| M6 | Release | `system-prompts/v6.0/`, `AiOsPage.tsx`, `aiOsSource.ts`, Familiar, `/ai-os` label, benchmark page; only with Sasha's yes | 1 day |

Rule across milestones: if a round of drafting makes the picture murkier than the last, stop drafting and run the benchmark or a live test with a person instead.

---

## 8. Roast of this plan (v1.0 → v1.1)

- **Roast 1:** v1.0 was research-heavy and evidence-light: four research steps before any measurement, a ship bar that cannot be met (ceiling), a baseline (v5.2) that was never measured, and no budget path to run anything.
- **Roast 2 (blind spot: We / Essence):** the plan served mechanics (It/Its) and under-served the people who use the OS. Fixed by the person set, Sasha's blind pick, and the compliance probes written from a user's chair.
- **Meta-roast:** the roast's own risk is false precision: probe pass bars and the 65% threshold are first guesses (hypothesis register) to be recalibrated after M1.
- **Crash test** ("v6 shipped and failed"): it lost the register that made v5.2 land (guarded by the verbatim list in §3.5 and drop-one ablation); it over-read people (guarded by consent, offer-not-diagnose, and the map-imperialism shadow); it scored well on Claude and fell flat elsewhere (guarded by cross-family judges and models).
- **What survived:** person-first core, procedures with checks, one arbiter, modules on demand. **Acceptance test for the plan:** M1 produces a number for v5.2 vs raw on a private set.
- **The 27th:** create the API key and run M1.

*Essence line:* v5.2 taught the model to see itself; v6 teaches it to see the person and move them one true step.
