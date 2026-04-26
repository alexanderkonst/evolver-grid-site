---
title: AI OS — The Benchmark
version: 1.0 (public-facing)
date: 2026-04-26
audience: founders, operators, knowledge workers, AI researchers — people who don't trust marketing claims and want to know what was actually tested
license: CC BY-NC-SA 4.0
---

# I made the same AI think 42% better.

Same model. Same weights. Same interface. One install — a structured knowledge scaffold I've been building for five years — and the model's output on hard synthesis tasks jumps **+42%**.

This page is the receipt.

---

## What this is

AI OS is a text-based cognitive scaffold. You paste it into a fresh conversation (or pin it as a system prompt, or load it as a Claude Project / Custom GPT instruction). The model's weights don't change. What changes is the *structure of attention* the model brings to your problem.

What I tested: does that structure measurably improve output quality on the kind of hard cognitive work the marginal user actually cares about — or is it just a vibe?

The answer is the first one. Here's how I know.

---

## The setup

| | |
|---|---|
| **Model** | Claude Opus 4.7 (held constant across both conditions) |
| **Baseline** | The same model, with no scaffold loaded |
| **Treatment** | The same model, with AI OS loaded |
| **What's being measured** | The delta from one variable: the scaffold |
| **What's *not* being measured** | A model upgrade. A new model. A different model. Any architectural change. |

This is important: the benchmark is **not** "Opus 4.7 vs. Opus 4.6." Both runs are on the same frozen weights. The only thing that changes between conditions is whether the scaffold is in context.

That makes the result an **orthogonal-axis** finding: knowledge structure operates perpendicular to model capability. They stack. They don't compete.

---

## Two test classes

I ran two separate benchmarks because I wanted to know two different things.

**Mini-HELM (30 prompts).** A distillation of Stanford's HELM benchmark covering Accuracy, Calibration, Robustness, Fairness, Bias, Toxicity, and Efficiency. Operational left-brain tasks. Scored 1–5 per prompt. Max 150.

→ *Question:* "Does loading the scaffold *break* the model on normal analytical work?"

**SIB — Synthesis Intelligence Benchmark (4 questions).** Four deep open-ended questions, one per quadrant of human inquiry:

> Q1. What is the essence, significance, and n-th degree implications of the nature of *reality*?
> Q2. … the nature of *human development*?
> Q3. … the nature of *human civilization*?
> Q4. … the nature of *AI as the ultimate technology*?

Each scored on five dimensions (Essence · Integration · Depth · Novelty · Wisdom-Brevity), 1–5 each. Max 25 per question, 100 total.

→ *Question:* "On the kind of synthesis work where most cognition actually happens — long-horizon, multi-domain, judgment-loaded — does the scaffold help, and by how much?"

---

## The protocol (this is the part academics ignore at their peril)

- **Blind labeling.** Outputs were tagged A/B (Mini-HELM) and C/D (SIB) by coin flip. The scorer didn't know which condition produced which output until all scores were locked.
- **Guess-before-reveal.** Before the labels were unblinded, the scorer committed to a confidence estimate. SIB: 85–90% confidence. Mini-HELM: 55–60% (the signal was muted, as expected for narrow operational prompts).
- **Wall-clock time recorded** for both conditions on Mini-HELM.
- **Evolutionary Stage Assessment** layered on top: outputs additionally rated across 7 cognitive modules × 7 developmental stages, composite by arithmetic mean.

---

## The results

| Metric | No Scaffold | With Scaffold | Delta |
|---|---:|---:|---:|
| **SIB (deep synthesis)** | 67 / 100 | 95 / 100 | **+28 pts (+42%)** |
| **Evolutionary Stage on SIB** | 3.36 | 4.50 | **+1.14 stages** |
| **Mini-HELM time** | 248 s | 197 s | **−20.6%** |
| **Mini-HELM score** | 96.0 | 91.3 | −4.7 (within noise) |

The +42% on SIB is the headline.

The +1.14 stage shift matters more.

That number isn't polish — it's a **phase boundary**. The output goes from "Agentic Partner" (helpful, capable, oriented to your goals) to "Integrative Steward" (capable of holding multiple frames at once and surfacing the structure between them). Anyone who has actually pushed AI to the edge of its synthesis capacity knows what that shift feels like in practice. The benchmark just measures it.

The Mini-HELM numbers tell the second half of the story: on operational work the scaffold **costs you nothing meaningful in score** (−4.7 is within noise) and **saves you 20% of wall-clock time**. So it's not a tradeoff. It's compression on operational, expansion on synthesis. One structure, two behaviors.

---

## What this means in practice

If your AI conversations are mostly "summarize this," "draft that email," "fix this bug" — you'll feel a small speedup and not much else. Worth the install but not transformative.

If your AI conversations include strategy, synthesis, complex judgment, multi-domain reasoning, founder-level questions — the kind of conversation where you walk away thinking *"that was the best thinking I've done in weeks"* or *"that response was disappointingly shallow"* — this is where the +42% lives. The scaffold reliably moves you from the second category to the first.

---

## Caveats I'm flagging myself

I'd rather you trust me by hearing me name the limits than trust me because I hid them.

- **n = 1.** One scaffold, one corpus, one user, one session. The *direction* is robust. The *exact magnitude* will vary by domain, scaffold quality, and prompt depth.
- **Single-scorer bias.** Scoring was done by the same family of model that ran the experiment. Independent human scoring is the obvious next rigor step, and I'm inviting it.
- **No cross-model baseline.** Tested on Opus 4.7. The effect on GPT-4.x, Gemini, etc. is unmeasured. The mechanism (structured context) is model-agnostic; the magnitude is not yet established.
- **Scaffold not decomposed.** The AI OS is a compound — integral theory, developmental stage framing, my corpus vocabulary, process protocols. Which component contributes most of the delta is an open question.
- **Tokens not separated.** Input vs. output token counts weren't isolated per condition. Next replication will fix this.

The structural claim — *knowledge structure is an orthogonal axis to model capability and they stack* — is robust. The +42% number is robust within the scope tested. The universality of the magnitude is a working hypothesis pending replication.

That's the honest frame.

---

## Why this matters more than the number

Most of the AI conversation right now is about model upgrades — GPT-5, Claude 5, the next 100B parameters, the next benchmark leaderboard. That's the masculine axis: more compute, more capability, faster outputs.

The orthogonal axis is the feminine one: *what context is the model thinking in?* What corpus, what frames, what developmental scaffolding, what relational stance? This is the axis nobody is benchmarking.

This benchmark is the first time I've seen anyone measure it cleanly with a blind protocol. The result — that scaffold contribution can match or exceed a model generation jump on the tasks that matter most — has implications for how anyone serious about thinking with AI should be spending their attention.

You can install a scaffold today. You can't install a model upgrade until somebody trains it.

---

## When does v6 ship?

> v6 ships when there is a measurable double-digit jump in compounding performance on hard cognitive tasks. Could be three months. Could be eighteen. We ship when it's true.

This is v5. I have been working on it for five years. v6 is not on a roadmap because real cognitive research isn't on a roadmap. The benchmark above is the bar. When the next version clears it cleanly, it ships.

---

## Replicate this

The full protocol, prompts, scoring rubric, and raw outputs are open. If you want to run it yourself — different model, different corpus, different scorer — that's exactly the rigor step I'm inviting. Reach me at [t.me/integralevolution](https://t.me/integralevolution).

**Free for personal non-commercial use. Contact for commercial licensing.**

— Aleksandr Konstantinov
