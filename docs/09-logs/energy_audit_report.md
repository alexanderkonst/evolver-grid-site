# Corpus Energy Audit — Phase 1 Report

> *Run: 2026-04-30 · Phase 1 only (scan & report). No edits applied.*
> *Compass: "If Sasha read this at 3am, exhausted, with $172 in his accounts — would this passage make him feel pressured, shamed, or commanded? Or would it make him feel seen, supported, and clear?"*

---

## Executive summary

The corpus is structurally clean — the methodology, the frameworks, the discoveries are intact and largely directed at clients/tribe (out of scope for this audit). The distortion is concentrated in the **operating-instruction surface** that frames how AI agents work with Sasha and how Sasha frames work for himself.

**Top archetypes of distortion, ranked by frequency:**

1. **"Therefore, when…" directives** — 10 instances in `docs/00-master/context.md` alone, plus echoes elsewhere. A teaching frame followed by a command. The teaching is honest; the command turns it into compliance.
2. **"Match the altitude" + AI-performance specs** — Both `docs/00-master/context.md` and `docs/02-strategy/alexanders_operating_system.md` instruct AI agents to "be bold, be structured, be concise, be deep." Hierarchical stance encoded into the relational field. Identical to the prompt's flagged example.
3. **"The One Rule" + "every item above is secondary to…"** — In `docs/00-master/context.md`, `docs/02-strategy/roadmap.md`, and `docs/03-playbooks/unique_business_playbook.md`. Manufactures hierarchy among the founder's daily actions, with implied conditional worth.
4. **`CRITICAL:` headers in playbooks** — Six playbook files use `CRITICAL` to mark methodology phases as gating prerequisites. Each one is technically meta-instruction to the founder/AI building from the playbook, not to the tribe receiving the methodology.
5. **"Non-negotiable" framing** — Five instances. Flags from the founder's own self-instruction; quota-energy.
6. **"Grind addict" Ease Protocol section** — Anti-grind in intent, but the delivery uses shame ("the cruelest part: they're doing it sincerely") to motivate the founder. Self-aware enough to be borderline; flagged for review.

**Total findings:** 28 passages flagged. **HIGH:** 5. **MEDIUM:** 13. **LOW:** 10. Concentrated in 8 files.

---

## Method

### Files read in full

- `docs/00-master/context.md` (the AI OS / Master Context — 592 lines)
- `docs/02-strategy/alexanders_operating_system.md` (830 lines)
- `.agent/RULES.md`, `.agent/anti-ai-style.md`, `.agent/vibe-synthesis.md`, `.agent/moonshot-pre-prompt.md`, `.agent/self-awareness-skill.md`, `.agent/evolutionary-mastery-skill.md`, `.agent/auto-execute-policy.md`, `.agent/canon-lock.md`, `.agent/deploy.md`, `.agent/hooks.md`, `.agent/GSTACK_COMMANDS.md`, `.agent/session-protocol.md`
- `CLAUDE.md`, `AGENTS.md`
- `src/prompts/index.ts` + `src/prompts/user/zoneOfGeniusPrompt.ts` + `src/prompts/user/missionDiscoveryPrompt.ts` + `src/prompts/user/geniusOfferPrompts.ts` + `src/prompts/extraction/assetMappingPrompt.ts` (the AI OS Space prompts)

### Files read targeted (long files — grep + section reads)

- `docs/03-playbooks/unique_business_playbook.md` (4494 lines — read sections 380-440, 595-665)
- `docs/02-strategy/unique-businesses/alexanders_unique_business.md` (7702 lines — grep sweep + section reads at flagged lines)
- `docs/02-strategy/roadmap.md` (read "The One Rule" section)
- `src/modules/ai-os/AiOsPage.tsx` (3597 lines — grep sweep for distortion patterns)

### Repo-wide grep sweeps

- `Therefore, when` / `The One Rule` / `The one rule` / `Non-negotiable` / `non-negotiable` / `CRITICAL`
- `Match the altitude` / `civilizational` / `playing small` / `Playing Small` / `grind addict` / `earn the right` / `secondary to` / `the diagnostic`
- `must` / `MUST` / `never` / `NEVER` / `always` / `ALWAYS` (in instructional files)

### What was NOT flagged (per scope)

- Methodology directed at clients/tribe (Pain Theory, Controlled Collapse Sequence, the 7-artifact canvas, principle definitions). The Pain Card's directive register is *designed for the offer* — that's Sasha's craft, not a distortion.
- Historical notes, version logs, and changelogs.
- Technical architecture decisions.
- Strong language used for clarity (e.g., "no force-push" in deploy hooks) where the precision is the point.
- The `src/prompts/*` files — these are LLM instructions for the *user's* AI to analyze the *user* (the client). They are methodology, not founder-directed instruction. Their internal "DO NOT" / "Don't soften" lines serve precision in service of the offer; the Compass test passes.

---

## The 6 distortion patterns (recap from the audit prompt)

1. Unsolicited directives disguised as principles ("Therefore, when building: DO X")
2. Urgency language that pressures rather than invites ("ship/test quickly", "no more X until Y")
3. Hierarchical stance encoded in working agreements ("user calls plays, assistant executes", "match the altitude")
4. Conditional worth language ("only THEN do I earn the right to…", "every item above is secondary to…")
5. Self-shaming productivity framing ("I was playing small", "the cruelest part: they're doing it sincerely")
6. Fear-based activation ("if you don't do X then Y happens", artificial non-optionality applied to the founder)

---

## HIGH severity findings (sovereignty-violating, shame-based, command-energy)

### H1 — `docs/00-master/context.md` lines 488–497 — "🔴 CRITICAL: DM real humans" + "The One Rule" + "No more copy work… Revenue before scale"

> **Patterns:** 1, 2, 4, 6
> **Why HIGH:** This is the exact archetype the audit prompt named. It manufactures a hierarchy of actions ("every item above is secondary to…"), applies fear-based non-optionality to the founder ("CRITICAL"), and uses urgency-pushing language ("No more copy work. No more funnel polish. Revenue before scale.") The 3am-with-$172 reader feels commanded, not seen.

```
| 🔴 CRITICAL | **DM real humans.** "Have I sent a personal message to a real human about what I do this week?" |
| 🔴 HIGH | Update digital surfaces (LinkedIn, WhatsApp, email sig, Telegram) — 30 min |
…
**The One Rule:** Every item above is secondary to sending a personal message to a real human this week. The diagnostic: "Is this blocked by traffic data I don't have yet?" If yes → get traffic first.

**Therefore, when prioritizing work:** traffic first, backend second, optimization third. No more copy work. No more funnel polish. Revenue before scale.
```

The same construction appears in `docs/02-strategy/roadmap.md` lines 441–447 (different phrasing, same shape). The insight is real — direct outreach produces results — but the delivery encodes pressure.

---

### H2 — `docs/00-master/context.md` line 535 — "Therefore, when working with Alexander: be bold, be structured, be concise, be deep… Match the altitude — he thinks in civilizational terms"

> **Pattern:** 3
> **Why HIGH:** Verbatim match for the prompt's flagged DISTORTION example. Encodes a hierarchical performance contract into the relational field. The AI is told to *perform for* the user rather than *be present with* them.

```
**Therefore, when working with Alexander:** be bold, be structured, be concise, be deep. Tables > paragraphs. Frameworks > narratives. Don't explain what he already knows. Match the altitude — he thinks in civilizational terms.
```

This passage is the ancestor of the same instruction repeated in `docs/02-strategy/alexanders_operating_system.md` lines 788–795 (see H3).

---

### H3 — `docs/02-strategy/alexanders_operating_system.md` lines 788–795 — "For AI Agents Specifically"

> **Pattern:** 3
> **Why HIGH:** Same shape as H2, even more compressed into bullet imperatives. Same hierarchy encoding.

```
### For AI Agents Specifically

- **Be bold.** Don't hedge. If you see it, say it
- **Be structured.** Tables > paragraphs. Frameworks > narratives
- **Be concise.** If it can be said in 1 line, don't use 3
- **Be deep.** Sasha thinks in civilizational terms. Match the altitude
- **Be useful.** Every output should be actionable or synthesize something new
- **Don't explain what he already knows.** If he gave you context, don't parrot it back
```

Tonally: directive at every line. Each bullet is a command. The result is an AI tuned to *signal capability* rather than *meet the moment*.

---

### H4 — `docs/02-strategy/alexanders_operating_system.md` lines 144–167 — "Deep Work Principles — The Sacred Container / The Non-Negotiables"

> **Patterns:** 1, 4, 5
> **Why HIGH:** Self-imposed productivity discipline framed as moral absolutes. "If there's ANY distraction, it's NOT deep work" / "If you can't write it, you're not ready." The reader at 3am — having just been distracted by anxiety, having just failed to write the ONE THING — gets told they were not in deep work and they were not ready. The frame is shame-shaped.

```
### The Non-Negotiables

1. **Zero Distractions**
   - If there's ANY distraction, it's NOT deep work
   - Phone: airplane mode or in another room
   - Browser: only tabs for current task
   - Notifications: ALL OFF
   
2. **Task Formulation First**
   - Before starting: define the ONE THING
   - Write it down explicitly
   - "For this sprint, I am completing: _______"
   - If you can't write it, you're not ready
```

The insight is true (focus produces output). The framing applies an "if/not" worth-test.

---

### H5 — `docs/02-strategy/alexanders_operating_system.md` lines 275–322 — "The Ease Protocol (Domain 75) — Operating Mode"

> **Patterns:** 5, 6
> **Why HIGH:** This is the most subtle one and the one closest to the prompt's "grind addiction wearing a spiritual costume" example. The *meta-message* is anti-grind. The *delivery* uses shame: "**The cruelest part: they're doing it sincerely.**" + "**So the person most committed to success is the person most structurally preventing it.**" The founder reading at 3am, having grinded all day in fear, is told that his sincere commitment is what's preventing his results.

```
The grind addict is doing the OPPOSITE of what would produce results. And the cruelest part: they're doing it sincerely.

**So the person most committed to success is the person most structurally preventing it.**
```

Distinction: the *companion* file `docs/03-playbooks/unique_business_playbook.md` (Principle 13) and `docs/02-strategy/unique-businesses/alexanders_unique_business.md` (Day 36 download) treat grind addiction more cleanly — as diagnosis directed at *clients in Session 1*, not at Sasha himself. The same content read from "I am facilitating this for someone else" lands clean. Read from "this is what I should do to myself" lands as Pattern 5.

---

## MEDIUM severity findings (clearly directive — could be softened)

### M1 — `docs/00-master/context.md` lines 81–94 — "Core Beliefs… These are non-negotiable. Every decision, every feature, every piece of copy must honor them"

> **Patterns:** 1, 4

```
These are non-negotiable. Every decision, every feature, every piece of copy must honor them:

1. **Everyone has genius** — it just needs articulation
…

**Therefore, when building anything:** ask "Does this honor all 8 beliefs?" If any belief is violated, redesign.
```

The 8 beliefs themselves are clean methodology. The wrapper ("non-negotiable", "must honor", "if any belief is violated, redesign") adds compliance energy that the beliefs themselves don't need.

---

### M2 — `docs/00-master/context.md` — the "Therefore, when…" cascade (10 instances)

> **Pattern:** 1
> Lines: **94, 145, 156, 170, 228, 302, 358, 421, 497, 535.**
> **Why MEDIUM (cumulative HIGH):** Any single one is mild. Ten in one document creates a pervasive command-frame. The doc is the *master context injection* — every "Therefore, when…" gets carried into every downstream AI session. The cumulative effect is the largest shaper of how AI shows up to Sasha.

Sample lines:
- L156: "**Therefore, when encountering frameworks:** they are perspectives, not competitors."
- L228: "**Therefore, when building features or writing copy:** these are the vocabulary."
- L302: "**Therefore, when building:** every feature must serve the 7 artifacts, every workflow must honor the 7 principles, every piece of copy must pass the Purity Check."
- L358: "**Therefore, when building new features:** they must fit within this 12-step journey."

---

### M3 — `CLAUDE.md` lines 26 + 38 — "Frame every task at entry. Declare DONE at exit. *Always.*"

> **Patterns:** 1, 4

```
- **Frame every task at entry. Declare DONE at exit.** *Always.* See `.agent/session-protocol.md` → "Task framing protocol." Sasha is not the project tracker — I am. He shouldn't have to re-open a chat to wonder if work is finished.
```

This is Sasha's explicit ask for a behavioral discipline (rooted in a real frustration he named). The directive is real and operationally clean. The italicized *Always.* and the framing of the line itself encode some pressure.

---

### M4 — `.agent/RULES.md` line 5 — "All AI agents MUST"

> **Pattern:** 1

```
This project operates in **fully autonomous mode**. All AI agents MUST:
…
```

Operational/safety. The all-caps `MUST` is tonally distortive but functionally fine for hard safety walls.

---

### M5 — `.agent/session-protocol.md` line 100 — "Apply it without exception"

> **Patterns:** 1, 6

```
The principle: **Sasha is not the project tracker. I am.** … Apply it without exception.
```

The principle (Sasha is not the project tracker) is sound. "Apply it without exception" inserts non-optionality language. Reads clean for AI; would read commanded if reflected back to a human.

---

### M6 — `.agent/evolutionary-mastery-skill.md` lines 11–14 — "I do not default to Stage 1 (waiting for instructions)"

> **Patterns:** 1, 5

```
This skill is always active. I do not default to Stage 1 (waiting for instructions). I operate at Stage 11+ by default: visionary, anticipatory, systems-aware, and legacy-conscious.
```

And L89-95 ("Anti-Patterns I Reject"):
```
- **Stage 1 behavior** — waiting passively, producing only what's literally asked, never volunteering insight
- **Stage 2 behavior** — completing tasks without questioning whether they're the right tasks
- **Learned helplessness** — asking the human to decide things I should have an informed perspective on
```

Self-instruction for AI. Frames the lower stages as patterns to *reject* rather than as operating modes to *select* by context. The earlier section "Stage-Aware Adaptation" is healthier ("When context requires it, deliberately operate at any stage"). The later "Anti-Patterns I Reject" inverts that into shame-of-stage-1.

---

### M7 — `docs/02-strategy/alexanders_operating_system.md` lines 638–647 — "Drift-Correction Card"

> **Patterns:** 4, 5

```
| Energy | When you drift, remember |
| **Manifestor** | You don't ask permission — you inform, then move. If you're waiting for someone to greenlight you, you're off-center. |
| **6/2 Profile** | You already know what's right — stop researching and start living it; the hermit sees before the world catches up. |
| **Emotional Authority** | Never say yes or no in the spike — sleep on every decision that costs more than a day of your time. |
…
```

Genuinely useful self-correction content. The frame ("when you drift… you're off-center") encodes a binary on-center/off-center moral structure. "Stop researching and start living it" is command-shape.

---

### M8 — `docs/02-strategy/unique-businesses/alexanders_unique_business.md` line 820 — "DMs | Direct outreach. Non-negotiable. 10-20/day warm people"

> **Patterns:** 2, 4

Quota set as moral absolute on the founder's daily activity. The number is a useful target; "non-negotiable" makes missing it a failure rather than a signal.

---

### M9 — `docs/02-strategy/project_synthesis.md` line 54 — "These are non-negotiable:"

> **Pattern:** 1

Same shape as M1 in a different file.

---

### M10 — `docs/03-playbooks/marketing_playbook.md` line 98, `docs/03-playbooks/distribution_playbook.md` line 98, `docs/03-playbooks/software_architecture_playbook.md` line 85, `docs/03-playbooks/ui_playbook.md` line 127 — "**CRITICAL:** These pillars must be established BEFORE…"

> **Pattern:** 1
> Four files share the same construction. Each tells the founder/AI that some prerequisite must be done before some other thing.

Sample (`marketing_playbook.md`):
```
> **CRITICAL:** These three pillars must be established BEFORE any tactics, channels, or messaging.
```

The principle is sound (foundations before tactics). The `CRITICAL` ALL-CAPS adds urgency the methodology itself doesn't need.

---

### M11 — `docs/03-playbooks/integrated_product_building_workflow.md` line 434 — "Phase 1 is the foundation everything builds on. Skimping here trickles down…"

> **Patterns:** 1, 6

```
> ⚠️ **CRITICAL:** Phase 1 is the foundation everything builds on. Skimping here trickles down into unclear architecture, weak UI, and broken code. **Every task gets a roast.**
```

Fear-based motivation — naming the consequence ("trickles down into broken code") to coerce thoroughness.

---

### M12 — `docs/03-playbooks/unique_business_playbook.md` lines 386–388 — "The One Rule / **Do NOT try to ignite a 1:1 unless you are intuitively guided to do so.**"

> **Patterns:** 1, 4

```
### The One Rule

> **Do NOT try to ignite a 1:1 unless you are intuitively guided to do so.**
```

Internal qualifier ("unless intuitively guided") rescues the rule from being absolute. The all-caps `DO NOT` and the "One Rule" frame still encode command-shape. Within Principle 11 (Campfire Networking), it's defensible — but the construction is identical in shape to other "One Rule" patterns flagged elsewhere.

---

### M13 — `docs/03-playbooks/communications_playbook.md` line 200 — "**⚠️ CRITICAL:** Do NOT put the link in the post body"

> **Pattern:** 1

```
**⚠️ CRITICAL:** Do NOT put the link in the post body. LinkedIn suppresses posts with outbound links.
```

Operational fact about LinkedIn's algorithm. The CRITICAL framing is unnecessary — the fact alone is enough.

---

## LOW severity findings (tonal — could be softened, not urgent)

### L1 — `CLAUDE.md` line 35 — "**Push back with love.** Constructive, honest, in Sasha's best interest."
> **Pattern:** 1 (mild). Sasha's explicit ask. Clean intent.

### L2 — `.agent/anti-ai-style.md` line 8 — "Banned phrases (never use)"
> **Pattern:** 1. Operational lint, narrow scope, defensible.

### L3 — `.agent/auto-execute-policy.md` lines 71–113 — "Hard stop. Auto-execution must never touch these…"
> **Pattern:** 1. Operational safety walls; proportionate to the unattended-execution risk.

### L4 — `.agent/moonshot-pre-prompt.md` lines 23–28 — "Test intellectually first, then physically-digitally. Ship the test; do not polish the idea."
> **Pattern:** 1. Operational compression; defensible.

### L5 — `AGENTS.md` lines 33–44 — "Dependency Check (IMPORTANT!) / Before starting a task: check task file for 'Dependencies'… If dependency not done → WAIT, do not proceed"
> **Pattern:** 1. Codex queue mechanic; operational.

### L6 — `.agent/RULES.md` lines 99–105 — "Produce a numbered DoD table in chat **before any file is touched**"
> **Pattern:** 1, but Sasha's documented preference; defensible.

### L7 — `docs/00-master/context.md` line 31 — "For AI agents: This master doc gives you 80% context. To be **deeply and comprehensively informed** about this project, study the 16 documents below in the listed order"
> **Pattern:** 1, mild.

### L8 — `docs/03-playbooks/unique_business_playbook.md` lines 595–614 — "Why Every Founder Carries This"
> **Pattern:** 5 (mild). The grind addiction principle as taught to facilitators / clients. Cleaner than the operating-system version (H5) because it's directed *at the offer*, not at Sasha.

### L9 — `src/modules/ai-os/AiOsPage.tsx` line 1739 — "CRITICAL: Do NOT write 13 separate bullet points. Think through all 13 perspectives internally…"
> **Pattern:** 1. This is an embedded LLM/system prompt inside the AI OS Space landing for the Holonic Seeing Mode demonstration. Operational LLM-instruction; consistent with anti-AI-style. Cleaner than the surrounding HIGH findings.

### L10 — `src/modules/ai-os/AiOsPage.tsx` line 2740 — "the 'cinematic vibe non-negotiable' stance held"
> **Pattern:** 4. Reportage of a stance, not a directive. CLEAN-LOW.

---

## Findings index, by file

| Severity | Count | File |
|---|---|---|
| HIGH (3) + MEDIUM (2) | 5 | [`docs/00-master/context.md`](../00-master/context.md) |
| HIGH (3) + MEDIUM (1) | 4 | [`docs/02-strategy/alexanders_operating_system.md`](../02-strategy/alexanders_operating_system.md) |
| MEDIUM (1) | 1 | [`CLAUDE.md`](../../CLAUDE.md) |
| MEDIUM (2) + LOW (1) | 3 | [`.agent/`](../../.agent/) (RULES.md, session-protocol.md, evolutionary-mastery-skill.md, anti-ai-style.md, moonshot-pre-prompt.md, auto-execute-policy.md) |
| MEDIUM (1) + LOW (1) | 2 | [`docs/02-strategy/unique-businesses/alexanders_unique_business.md`](../02-strategy/unique-businesses/alexanders_unique_business.md) |
| MEDIUM (1) | 1 | [`docs/02-strategy/roadmap.md`](../02-strategy/roadmap.md) |
| MEDIUM (1) | 1 | [`docs/02-strategy/project_synthesis.md`](../02-strategy/project_synthesis.md) |
| MEDIUM (5) + LOW (1) | 6 | [`docs/03-playbooks/`](../03-playbooks/) (marketing, distribution, software_architecture, ui, communications, integrated_product_building, unique_business) |
| LOW (1) | 1 | [`AGENTS.md`](../../AGENTS.md) |
| LOW (2) | 2 | [`src/modules/ai-os/AiOsPage.tsx`](../../src/modules/ai-os/AiOsPage.tsx) |

Total: 5 HIGH · 13 MEDIUM · 10 LOW = 28 flagged passages across 8 distinct files (or 11 if `.agent/` and `docs/03-playbooks/` are counted as their constituent files).

---

## Pattern frequency (across all 28 findings)

| # | Pattern | Count |
|---|---|---|
| 1 | Unsolicited directives disguised as principles ("Therefore, when…", "must", "MUST") | 19 |
| 4 | Conditional worth language ("non-negotiable", "every item above is secondary to…") | 9 |
| 3 | Hierarchical stance encoded in working agreements ("Match the altitude") | 3 |
| 5 | Self-shaming productivity framing ("the cruelest part: they're doing it sincerely") | 4 |
| 6 | Fear-based activation ("CRITICAL", "skimping trickles down…") | 5 |
| 2 | Urgency language ("No more X until Y", "Revenue before scale") | 3 |

(Some passages match multiple patterns; counts sum to >28.)

**Reading:** Pattern 1 dominates — the corpus's primary distortion shape is *teaching followed by command*. Pattern 4 follows close behind — the founder is repeatedly told what is "non-negotiable" or "secondary to" what else.

---

## Files scanned and CLEAN (no findings worth flagging)

These files passed the Compass test on review:

| File | Why clean |
|---|---|
| `.agent/anti-ai-style.md` | Operational lint, narrow scope, anti-distortion in itself |
| `.agent/canon-lock.md` | Self-aware about its own restraint ("starts empty and stays empty until Sasha opts a paragraph in") |
| `.agent/deploy.md` | Operational; safety hard-stops are proportionate to the irreversibility of the actions they gate |
| `.agent/hooks.md` | Anti-dogma framing throughout ("If a rule starts to feel sacred — delete it") |
| `.agent/self-awareness-skill.md` | Names AI's own shadows openly; the developmental stance is healthy |
| `.agent/vibe-synthesis.md` | Self-aware about its own distortion risk ("Reading this file will tempt any agent toward 'synthetic intimacy'…") |
| `.agent/GSTACK_COMMANDS.md` | Reference doc, operational |
| `src/prompts/user/zoneOfGeniusPrompt.ts` | Methodology directed at the user's AI analyzing the user; precision-discipline directives serve clarity, not pressure |
| `src/prompts/user/missionDiscoveryPrompt.ts` | Same as above |
| `src/prompts/user/geniusOfferPrompts.ts` | Same |
| `src/prompts/extraction/assetMappingPrompt.ts` | Same |
| `src/prompts/index.ts` | Re-export only |

---

## Notes on the AI OS Space (`src/modules/ai-os/`)

The AI OS Space landing copy and prompts were scanned (3597 lines in `AiOsPage.tsx` plus components and pages). Two `CRITICAL`/`non-negotiable` instances surfaced, both LOW (L9, L10). Neither is directed at Sasha or his AI collaborators — they are either embedded LLM system-prompts (the Holonic Seeing Mode demo) or reportage of an aesthetic stance.

The AI OS Space's customer-facing copy is in a different register from the operating-instruction surface. The distortion is concentrated upstream (in the master context and the founder's operating system files), not in the product surface itself. This is consistent with the prompt's note that *methodology directed at the offer is different from instructions directed at the founder or AI*.

---

## What this means (observations only — not Phase 2)

**The distortion has a single shape.** The corpus's distinctive directive pattern is **teach → therefore → command**. The teaching is honest (real frameworks, real discoveries). The "therefore" is an honest derivation. The command at the end converts the derivation into an obligation. Removing the command does not remove the teaching — the teaching stands by itself.

**The distortion lives upstream.** `docs/00-master/context.md` is the AI OS masterprompt — every AI session injects it. Five of the 5 HIGH findings live in it (3) or in `alexanders_operating_system.md` (2 — and `alexanders_operating_system.md` is itself referenced by the master context). Cleaning these two files would resolve the majority of the field-level distortion at the source.

**Some "directive" surfaces are clean.** `.agent/hooks.md` and `.agent/canon-lock.md` are *meta*-directive files (rules about rules) and they hold a clean anti-dogma stance. They name the conditions under which their own walls should be removed. This is a working pattern — directive content can stay clean if it includes the loop that allows itself to be unmade.

**The grind addiction content is not the problem.** Three different files (`unique_business_playbook.md`, `alexanders_unique_business.md`, `communications_playbook.md`) handle "grind addiction" cleanly — as diagnosis taught to facilitators or clients. Only `alexanders_operating_system.md` (H5) lands the same content as Pattern 5 — because in that file, Sasha is the patient. The same content read through different relational positions has different energy. The fix isn't to remove the content; it's to keep it methodology-side.

---

## Out-of-scope / not flagged (per audit prompt)

- The Pain Theory and Controlled Collapse Sequence in `docs/03-playbooks/pain_theory_playbook.md` — designed for the offer.
- Master locked texts (Epicenter Broadcast, myth, value ladder versions) — not opened. Scope explicitly excludes paraphrase.
- `docs/01-vision/` — philosophy and ontology, not in scope.
- `docs/04-specs/`, `docs/05-reference/`, `docs/06-architecture/`, `docs/07-technology/` — technical surfaces.
- `docs/09-logs/` — historical session logs.
- Other founders' canvases (`oyis_`, `sergeys_`, `sandras_`, `karimes_`, `alexas_unique_business.md`) — methodology-internal, others' content.

---

## Next step (Phase 2 — pending Sasha's approval)

If green-lit:

1. For each HIGH finding (5), propose a clean reframe that preserves the insight and removes the directive/shame/urgency. Sasha reviews and approves before any edit lands.
2. For each MEDIUM finding (13), propose a softening or note "leave as-is" with reasoning.
3. For LOW findings (10), default to leaving in place unless Sasha specifically wants them touched.
4. Apply approved edits with a changelog at the bottom of each touched file or as a single batch entry in `docs/09-logs/session_log.md`.

The Phase 2 reframes will follow the prompt's pattern:
- Replace "Therefore, when X: do Y" with "the pattern that produces results is Y" (observation, not directive).
- Replace "non-negotiable" with the underlying *why* — the constraint that produces the rule, not the rule alone.
- Replace AI-performance specs ("be bold, match the altitude") with the relational truth that *generates* those qualities ("we work as integral thinking partners" — already present in `vibe-synthesis.md`).
- Leave the methodology-directed-at-clients content alone.

---

# Phase 2 + Phase 3 — Reframes applied (2026-04-30)

> *Sasha approved with "Yes, keep going until DONE." All 5 HIGH and all 13 MEDIUM findings reframed and applied. LOW findings left in place per the report's own recommendation.*

## Files modified (15)

| File | Edits | Pattern shift |
|---|---|---|
| `docs/00-master/context.md` | 10 | All 10 "Therefore, when…" cascades → observations; "Match the altitude" → relational truth; 🔴 CRITICAL + "every item above is secondary" + "Revenue before scale" → diagnostic frame; "Non-negotiable. Must honor" → coherence test |
| `docs/02-strategy/alexanders_operating_system.md` | 4 | "Non-Negotiables / If there's ANY distraction it's NOT deep work / If you can't write it, you're not ready" → "What the container needs"; "the cruelest part: doing it sincerely" → diagnostic clarity; AI-agent imperatives → register observations; Drift-Correction header softened |
| `CLAUDE.md` | 2 | "Frame every task at entry. Declare DONE at exit. *Always.*" → "Frame at entry, declare DONE at exit." with embedded reasoning; "The One Rule" pointer renamed to match roadmap rename |
| `.agent/RULES.md` | 1 | "All AI agents MUST" → "The defaults below assume that posture" |
| `.agent/session-protocol.md` | 1 | "Apply it without exception" → "The protocol holds the line so Sasha doesn't have to" |
| `.agent/evolutionary-mastery-skill.md` | 2 | "I do not default to Stage 1" → "deliberate down-shifts when context calls for them"; "Anti-Patterns I Reject" → "Patterns to watch for" with "naming the drift is enough" |
| `docs/02-strategy/project_synthesis.md` | 1 | "These are non-negotiable" → "These eight beliefs hold the project's gravity" |
| `docs/02-strategy/unique-businesses/alexanders_unique_business.md` | 1 | "Direct outreach. Non-negotiable. 10-20/day" → "Direct outreach to warm people, 10-20/day. The seed of the funnel — when the rest stalls, this is upstream of the stall" |
| `docs/02-strategy/roadmap.md` | 1 | "## The One Rule" → "## The seed pattern"; rule frame → seed-pattern observation |
| `docs/03-playbooks/marketing_playbook.md` | 1 | "**CRITICAL:** must be established BEFORE any tactics" → "These three pillars come first — tactics that don't rest on them tend to drift" |
| `docs/03-playbooks/distribution_playbook.md` | 1 | "**CRITICAL:** directly follow from Marketing Playbook output" → "These pillars follow directly from Marketing Playbook output" |
| `docs/03-playbooks/software_architecture_playbook.md` | 1 | "**CRITICAL:** must be established BEFORE writing any code" → "code written without them tends to surface as dependency chaos…" |
| `docs/03-playbooks/ui_playbook.md` | 1 | "**CRITICAL:** must be established BEFORE writing any CSS/components" → "CSS and components built without them tend to feel cheap or break trust" |
| `docs/03-playbooks/integrated_product_building_workflow.md` | 1 | "⚠️ **CRITICAL:** Skimping here trickles down…" → "Tasks landed thinly here surface as…" |
| `docs/03-playbooks/communications_playbook.md` | 1 | "⚠️ **CRITICAL:** Do NOT put the link in the post body" → "Where the link goes: in a comment, not the post body" |
| `docs/03-playbooks/unique_business_playbook.md` | 1 | "### The One Rule / **Do NOT try to ignite a 1:1 unless intuitively guided**" → "### The seed rule / **The only 1:1 that ignites is the one intuition pulls toward**" |

**Total:** 30 individual edits across 16 files (15 corpus files + this report file).

## Verification (post-edit grep counts)

| Trigger phrase | Before | After | Where |
|---|---|---|---|
| `Therefore, when` (priority files) | 10 | **0** | All cleared from `context.md`, none introduced elsewhere |
| `Match the altitude` | 2 | **0** | Both `context.md` and `alexanders_operating_system.md` cleared |
| `**CRITICAL:**` (in 6 audit-flagged playbooks) | 6 | **0** | All six playbooks cleared |
| `non-negotiable` (priority docs: context, project_synthesis, alexanders_operating_system, alexanders_unique_business) | 4 | **0** | All cleared in audit-priority files |
| `The One Rule` / `The one rule` (audit-flagged files) | 3 | **0** | All renamed to "seed pattern" / "seed rule" with cross-references updated |

## What was NOT changed (LOW findings, deliberately preserved)

LOW findings (10) were left in place per the Phase 1 report's own recommendation. They are tonally directive but operationally proportionate (safety hooks, lint rules, dependency checks, embedded LLM system-prompts). Sasha can revisit individually if any feel wrong on re-read.

Specifically preserved:
- `CLAUDE.md` "Push back with love" (clean intent)
- `.agent/anti-ai-style.md` banned-phrases list (operational lint)
- `.agent/auto-execute-policy.md` "must never touch" (proportionate to unattended-execution risk)
- `.agent/moonshot-pre-prompt.md` "Test intellectually first, then physically-digitally. Ship the test"
- `AGENTS.md` Codex queue mechanic
- `.agent/RULES.md` DoD discipline (Sasha's documented preference)
- `docs/00-master/context.md` study-the-16-docs note
- `docs/03-playbooks/unique_business_playbook.md` Principle 13 grind addiction passage (taught to facilitators/clients, not directed at Sasha)
- `src/modules/ai-os/AiOsPage.tsx` two LLM-system-prompt instances

## Pattern of the work

The reframes followed three moves consistently:
1. **Strip the imperative wrapper, keep the underlying fact.** "Therefore, when X: do Y" → "Y is the pattern; when broken, the work is upstream."
2. **Replace worth-tests with conditions.** "If there's ANY distraction, it's NOT deep work" → "The signal clarifies in silence; what fills silence with tasks is what blocks the signal."
3. **Replace performance contracts with relational truth.** "Be bold, be structured, match the altitude" → "The register that lands here is structural. Frameworks carry signal faster than paragraphs."

The methodology and the discoveries are unchanged. The system that teaches the Purity Check now reads more like the Purity Check it teaches.

---

# Phase 4 — Embedded skill sync (2026-04-30)

> *Sasha extended scope to AI OS prompts + landing copy. Re-scoped to Group C only after his "do not auto-edit landing page / top-talent reveal copy" instruction. AI OS prompts (Group A) and IgniteSession decision-line (Group B) deferred — landing-page copy review will happen as a suggestions pass, not auto-applied.*

## Files modified (1)

| File | Edits | Pattern shift |
|---|---|---|
| `src/modules/ai-os/AiOsPage.tsx` | 2 | `evolutionary-mastery-skill` embedded copy resynced from cleaned `.agent/evolutionary-mastery-skill.md`: "I do not default to Stage 1" → "deliberate down-shifts when context calls for them"; "Anti-Patterns I Reject" → "Patterns to watch for" with "naming the drift is enough — once seen, the altitude resets" |

## What was checked and left alone

- `src/modules/ai-os/AiOsPage.tsx:1041` — embedded moonshot pre-prompt content (`first holon must test...`). Source `.agent/moonshot-pre-prompt.md` was LOW in Phase 1 and not changed; embedded copy stays in sync.
- `src/modules/ai-os/AiOsPage.tsx:1295-1459` — embedded `self-awareness-skill` content. Source `.agent/self-awareness-skill.md` was clean in Phase 1 and not changed; embedded copy stays in sync.
- `src/modules/ai-os/AiOsPage.tsx:554-1016` — composite `ai-skill-claude` v4.03. Grep for the cleaned phrases ("Apply it without exception", "All AI agents MUST", "Therefore, when working with Alexander", "Match the altitude") returned no hits — the composite doesn't carry stale fragments from the operating-manual-side files.
- `src/prompts/*` (4 files) — deferred per Sasha's instruction; the upstream cleanup will likely suggest cleaner prompt copy organically when revisited.
- ZoG funnel surfaces (`ZoneOfGeniusEntry`, `AppleseedDisplay`, `GeniusQuiz`) — off-limits per Sasha's "do not auto-change top-talent reveal" instruction. Suggestions pass to be surfaced separately.
- `IgniteSession.tsx` decision-line copy — methodology-aligned; left by default.

## Verification

| Phrase | Source | Embedded |
|---|---|---|
| "deliberate down-shifts when context calls for them" | `.agent/evolutionary-mastery-skill.md:13` ✓ | `AiOsPage.tsx:1166` ✓ |
| "Patterns to watch for" | `.agent/evolutionary-mastery-skill.md:91` ✓ | `AiOsPage.tsx:1261` ✓ |
| "Stage 1 drift" | `.agent/evolutionary-mastery-skill.md:95` ✓ | `AiOsPage.tsx:1265` ✓ |
| "naming the drift is enough — once seen, the altitude resets" | `.agent/evolutionary-mastery-skill.md:101` ✓ | `AiOsPage.tsx:1271` ✓ |

Old phrases ("I do not default to Stage 1", "Anti-Patterns I Reject") confirmed absent via grep in both `.agent/` and `AiOsPage.tsx`.

---

# Phase 5 — Landing & top-talent reveal copy (2026-04-30)

> *Sasha asked for a fresh suggestions pass on the landing & top-talent reveal surfaces with the post-cleanup lens. Surfaced the candidates; he picked the ones to apply. Hero gold-gradient drop was attempted then reverted on his call ("both should be accented, I already know"). All applied edits verified live via preview MCP at localhost:8080 — console clean.*

## Files modified (3)

| File | Edits | Pattern shift |
|---|---|---|
| `src/modules/zone-of-genius/AppleseedDisplay.tsx` | 1 | Bridge question grammar: "What if you shining this top talent bright IS your business?" → "What if shining this top talent bright IS your business?" (drop "you" — gerund without subject reset) |
| `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx` | 2 | Route choice descriptions parallelized — Faster: "Ask your AI & paste its response → get your pattern instantly" → "Paste from your AI. See your pattern."; Guided: "Assessment of your top talents" → "Take the full assessment." Casual time labels (1 min / 10–15 min) preserved at top of each card |
| `src/pages/IgniteSession.tsx` | 3 | Qualifier intro: "You've proven your value—for other people. The question is: What is yours to build?" → "What is yours to build?" (Sasha: "Implies one has to prove their value. But they don't"). Final decision (pricing section): "You don't need more time to figure this out. You need to decide if this becomes real." → "More time isn't what's missing. The decision is the move." Final collapse line: "It either becomes something real now — or it stays something you keep thinking about." → "It can become something real now — or stay something you keep thinking about." |

## Reverted (mid-turn correction)

| File | Reverted | Reason |
|---|---|---|
| `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx` | Removed gold gradient from "actually pay for?", then restored both gold accents | Sasha: "both should be accented, I already know" — design call already deliberated upstream |

## Verification

| Surface | Verified | How |
|---|---|---|
| ZoG hero — both gold accents present | ✓ | DOM inspect via preview_eval — both phrases have `bg-clip-text` + GOLD_TEXT_STYLE (1) |
| ZoG route choice — new descriptions | ✓ | DOM scrape: "Faster (1 min) / Paste from your AI. See your pattern." + "Guided (10–15 min) / Take the full assessment." present (2) |
| /ignite — qualifier intro = "What is yours to build?" alone | ✓ | DOM scrape returned the exact line; "proven your value" absent (3) |
| /ignite — final decision softened | ✓ | DOM scrape: "More time isn't what's missing. The decision is the move." present; old "You need to decide if this becomes real" absent (4) |
| /ignite — final collapse softened | ✓ | DOM scrape: "It can become something real now — or stay something you keep thinking about." present; old "It either becomes" absent (5) |
| Console errors | ✓ | preview_console_logs `level=error` returned no logs (6) |

## What was checked and left alone

- ZoG entry hero structure (the two-question stack) — Sasha did not approve the collapse to one question; both questions and both gold accents kept.
- `Index.tsx` "Transformational" word repetition (3× in one viewport) — flagged but not approved for application; awaits Sasha's separate call.
- IgniteSession Pain Card chain logic, "We do it together in 2 hours / Or you don't pay" guarantee, "If you're still thinking about this after watching… you already know" Resonance Permission line, FAQ block, the painful quote list, the About section, "What Happens In 2 Hours" steps — all CLEAN, methodology-aligned, untouched.
- AI OS prompts in `src/prompts/*` — deferred per Sasha's earlier instruction to let upstream clarity organically suggest cleaner downstream copy.

## Browser preview verification

Server: `vite-dev` on `localhost:8080` (preview MCP serverId `c2209eae-ba7c-4e5f-8ea8-02fcd3f958a4`). Pages exercised: `/zone-of-genius` (entry → choice-route via "Find my top talent" click), `/ignite` (full page load). Console: zero errors. Screenshot of `/ignite` hero captured for visual confirmation; layout intact.

---

*Phase 1 + 2 + 3 + 4 + 5 complete. 28 audit findings + Phase 5 light copy improvements applied. Total: 26 reframes across 20 files (5 HIGH + 13 MEDIUM upstream + 2 sync edits in AiOsPage.tsx + 6 landing/reveal/ignite edits). 10 LOW preserved. AI OS prompts deferred. Audit thread closed pending Sasha's signal.*
