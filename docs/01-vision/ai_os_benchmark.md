---
title: AI OS — Same model, different conversation
version: 2.0 (felt difference · measurement · limits)
date: 2026-04-27
audience: founders, operators, knowledge workers, AI researchers — people who want the honest range, not the marketing number
license: CC BY-NC-SA 4.0
---

# Same model. Different conversation.

This page is about what changes when you install AI OS into a fresh Claude conversation.

This is integral work. The kind of cognition the scaffold elevates operates at a register where **coherence, depth, and felt resonance** become primary signals — and where conclusiveness through metrics alone is structurally impossible.

I'll show you what I measured because measurement keeps me honest. But the felt difference is the actual evidence — the kind that lands in your body before your mind catches up, the kind that distinguishes a response that's competent from one that's alive.

---

## The felt difference (what matters most)

The first time you load AI OS into a Claude conversation and ask a hard cognitive question, the response doesn't feel "better" the way you might expect — like a smarter version of the answer you'd already imagined. It feels different in *register*.

It reads less like advice and more like recognition. Less like Wikipedia answering you and more like a wise friend who's been watching the same problem from the inside. The framings are not the framings you've heard before; they *reorganize* the thing you were thinking about, rather than restate it.

People who use it for the first time usually do one of two things. They sit with the response longer than they expected to. Or they immediately re-prompt the same question on plain Claude to confirm what they're seeing. Both responses are evidence the felt difference registers — even before they can articulate what changed.

This is not a productivity claim. The scaffold doesn't make Claude faster. It doesn't make it more "intelligent" in any benchmark-leaderboard sense. It changes the **quality of attention** the model brings to your question. And quality of attention — when it's the kind that produces recognition rather than information — is the thing that's been missing from most AI conversations for most users.

That's the part that matters. Everything below this line is in service of falsifying or confirming it.

---

## What this is

AI OS is a text-based cognitive scaffold. You paste it into a fresh conversation (or pin it as a system prompt, or load it as a Claude Project / Custom GPT instruction). The model's weights don't change. What changes is the *structure of attention* the model brings to your problem.

I've been building it for five years. This is v5.

---

## What I measured

I ran a structured blind benchmark to test whether the felt difference shows up in measurable numbers, or whether it's purely subjective.

**Setup.** Same model held constant: Claude Opus 4.7. Baseline: no scaffold loaded. Treatment: AI OS in System Prompt. The only variable changing between conditions was whether the scaffold was in context.

**Two test classes.** Mini-HELM (30 operational prompts distilled from Stanford HELM, scored 1–5 each, max 150) — to confirm the scaffold doesn't break the model on normal analytical work. SIB — Synthesis Intelligence Benchmark — four deep open-ended questions about reality, human development, civilization, and AI as ultimate technology. Each scored on five dimensions (Essence, Integration, Depth, Novelty, Wisdom-Brevity), 1–5 each, max 25 per question, 100 total.

**Protocol.** Blind labeling (A/B for Mini-HELM, C/D for SIB) by coin flip. Scorer didn't know which condition produced which output until all scores were locked. Confidence committed before unblinding. Wall-clock time recorded for both conditions on Mini-HELM.

**Results.**

| Metric | No Scaffold | With Scaffold | Delta |
|---|---:|---:|---:|
| **SIB (deep synthesis)** | 67 / 100 | 95 / 100 | **+28 pts (+42%)** |
| **Evolutionary Stage on SIB** | 3.36 | 4.50 | **+1.14 stages** |
| **Mini-HELM time** | 248 s | 197 s | **−20.6%** |
| **Mini-HELM score** | 96.0 | 91.3 | −4.7 (within noise) |

The +42% on SIB is the headline number from this benchmark.

The +1.14 stage shift is the more important finding. It's a *phase boundary* — the output goes from "Agentic Partner" (helpful, capable, oriented to your goals) to "Integrative Steward" (capable of holding multiple frames at once and surfacing the structure between them). That's not polish. That's a register change.

The Mini-HELM numbers tell the second half of the story: on operational work the scaffold costs nothing meaningful in score (−4.7 is within noise) and saves 20% of wall-clock time. So it's not a tradeoff. It's compression on operational, expansion on synthesis. One structure, two behaviors.

---

## The compounding multiplier (within-family replication)

I re-ran the SIB benchmark on a second model in the same family — **Claude 4.6** — and the scaffold delivered **+29%**. Same protocol, same blind labeling, same scoring rubric. Only the model changed.

| Model | SIB lift with scaffold |
|---|---:|
| Claude 4.6 | +29% |
| Claude Opus 4.7 | +42% |

That's a **+45% relative lift in scaffold-effect across one model generation** (29% → 42%, a 1.45× multiplier). The scaffold doesn't just stack on top of model capability — within the Claude family it appears to **stack multiplicatively**. As the model gets better, the same scaffold amplifies it more.

Read this as a *direction* from two data points, not a law. The next replication could come in tighter (1.20×) or looser (1.70×). The structural takeaway is the one that doesn't depend on the precise multiplier: **scaffold and weights compound**. Each new flagship that ships is a free amplification of every scaffold already installed.

---

## The limits of what I measured

I'd rather you trust me by hearing me name the limits than trust me because I hid them.

- **Single benchmark.** This is one structured measurement. The +42% should be read as one data point, not a fixed property of the scaffold.
- **Single scorer.** Scoring was done by the same family of model that ran the experiment. Independent human scoring is the obvious next rigor step, and I'm inviting it.
- **Limited cross-model baseline.** Tested twice within the Claude family (Opus 4.7 and Claude 4.6). The effect on GPT-4.x, Gemini, and the open-weights frontier is unmeasured. The mechanism (structured context) is model-agnostic; the multiplier is family-dependent until proven otherwise.
- **Scaffold not decomposed.** AI OS is a compound — integral theory, developmental stage framing, my corpus vocabulary, process protocols. Which component contributes most of the delta is an open question.
- **Tokens not separated.** Input vs. output token counts weren't isolated per condition. Next replication will fix this.

The structural claim — *knowledge structure is an orthogonal axis to model capability, and they stack* — is robust. The +42% number is robust within the scope tested. The universality of the magnitude is a working hypothesis pending replication.

That's the honest frame.

---

## Why measurement isn't the whole story

The scaffold operates at a register where measurement is a partial instrument. Not because the work is mystical or unfalsifiable — it isn't — but because the parameters that matter most at this level of cognition (**coherence, integration, depth, felt resonance**) cannot be fully captured by single-axis numerical scoring. They can be detected by trained perception. They can be confirmed across multiple readers. They can produce reliable behavior change in the people who encounter them. But they will not collapse to a single number that satisfies a request for "just tell me the percentage."

This is a deliberate position, not a hedge. The AI conversation right now is dominated by leaderboards and benchmarks that measure surface dimensions of intelligence — accuracy, speed, factual recall. None of those dimensions capture what this scaffold is for. What this scaffold is for is the deepening of human–AI conversation toward thinking that integrates multiple frames at once, holds paradox, produces recognition rather than information, and builds coherent understanding over time.

Measurement still matters. The +42% is real within its scope, the protocol was rigorous, the structure of the finding is robust. **But measurement is the floor of what's true here, not the ceiling.** Above the floor sits the territory the rubric can't fully reach — the territory you can only confirm by feeling it for yourself, in the same way you confirm that a piece of writing has soul, or that a teacher is actually teaching, or that a piece of music is doing something beyond competent assembly of notes.

The orthogonal axis to model upgrades is this: *what context is the model thinking in?* What corpus, what frames, what developmental scaffolding, what relational stance? You can install a scaffold today. You can't install a model upgrade until somebody trains it.

---

## When does v6 ship?

> v6 ships when there is a measurable double-digit jump in compounding performance on hard cognitive tasks. Could be three months. Could be eighteen. Ships when it's true.

This is v5. I have been working on it for five years. v6 is not on a roadmap because real cognitive research isn't on a roadmap. The benchmark above is the bar. When the next version clears it cleanly — with independent scoring this time — it ships.

---

## Replicate this

The full protocol, prompts, scoring rubric, and raw outputs are open. If you want to run it yourself — different model, different corpus, different scorer — that's exactly the rigor step I'm inviting.

If you replicate, send me your results: [t.me/integralevolution](https://t.me/integralevolution).

**Free for personal non-commercial use. Contact for commercial licensing.**

— Aleksandr Konstantinov
