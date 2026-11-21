# mm-01 · Brief like a colleague

- **Wizard:** [Level 1 · One chat](./wizard.md) · unit 1 of 5 (proposed)
- **Status:** drafted, **unsigned** (spec §8 stage 3 done; stage 4 authorship gate waits on Sasha). Date 2026-11-21.
- **Form:** [your_ai_wizards_spec_v0.1.md §5](../../your_ai_wizards_spec_v0.1.md#5-the-micro-module-unit-the-form-every-micro-module-fills), all 10 fields, run as is.

## The 10 fields

| # | Field | Content |
|---|---|---|
| 1 | **Result in one line** | **Brief your AI, get an answer about your situation** |
| 2 | **Who it's for** | A founder with access to any chat model who asked it something real in the last week and got a generic answer. Previous micro-module: **none** (first unit of Level 1; Level 0 wizard recommended, not required). |
| 3 | **Input materials** | Private (Hark project workspace, not in repo): client workshop A, session 1 deck, part 3 "How we interact with AI" (input quality defines output quality; the Genie and the People-pleaser aspects) and session 2 deck, part 3 "Prompting as briefing" (context checklist slide is a stub: title only); client workshop B deck, part 2 "Creating with AI" (prompt engineering → context engineering; prompting as bringing someone up to speed; live demo "what does the AI say?"; closing principles); client workshop B debrief call, Jan 2026 (what landed: basic, one structure, daily-work examples). Public: [lite.md](../../../../../system-prompts/v6.0/lite.md) (rule 6, clarifying questions), [PISP Stage 1](../../../../03-playbooks/personal_intelligence_setup_playbook.md#stage-1-orchestrator-one-chat-20-min) ("say who you are in the first chat"). |
| 4 | **One step** | Take one question you really asked an AI last week. Open a fresh chat and ask it again, starting with the four-line **briefing card** (field 6). |
| 5 | **Visible check** | Put the old answer and the new one side by side. **Pass** when the new answer (a) uses at least two facts from your briefing and (b) gives one concrete thing you could do this week that the old answer did not. **Fail** → find which line of the card was thin, add one sentence to it, ask again. |
| 6 | **Setup piece handed over** | **Briefing card**, a four-line fill-in to keep as a note or keyboard snippet. Proposed path: `wizards/level-1-one-chat/prompts/briefing-card.md` (**not created yet**, spec §8 stage 7). Draft text below. |
| 7 | **Infographic brief** | Title: *Garbage in, garbage out → clear in, powerful out.* Subtitle: the AI answers at the level you speak to it. Prism: **2 · poles**. Scheme: left pole, a one-line question → foggy generic answer; right pole, the same question under a four-line briefing → a sharp answer that names the founder's situation. Keys: (1) *Who I am*, role and business in one line; (2) *What I want*, the goal or decision; (3) *What matters*, context, constraints, what I already tried; (4) *What I want back*, format and length. Tags: audience public · face product · privacy public. Status: idea. Home: `wizards/level-1-one-chat/cards/` (spec §11 Q4 default). |
| 8 | **NotebookLM video brief** | Source text: the "Video source" section below (one notebook, code `L1-01`). Focus line: "Prompting is bringing a colleague up to speed: the AI answers at the level you speak to it, so four lines of context beat any clever wording." Course look (proposed for the whole Level 1 wizard, from Sasha's own workshop metaphor "surfing the tsunami"): a surfer finding the line on a big wave at dawn; deep teal, warm gold, foam white; painted-canvas texture; slow swell motion; never robots, never stock faces, no text clutter. Episode scene: a fogged, shapeless wave that sharpens into one clean crest as four lines light up one by one. Explainer 16:9, 90–120 s; end the Custom topic with "Total video length must stay under 2 minutes." |
| 9 | **System prompt / skill it installs** | The **briefing card** (field 6), saved where the founder can paste it in one tap. It keeps producing the result after the unit because every new question starts from it. Product law: must exist as a file before ship (**open**). Level 1's lasting prompt, AI OS Lite, arrives at mm-05; Lite rule 6 then asks for missing context only when it would change the answer a lot. |
| 10 | **Done criteria** | See the checklist below. |

## Setup piece: briefing card (draft text)

```
Who I am: <role, business, one line>
What I want: <the goal or the decision in front of me>
What matters here: <context, constraints, what I already tried>
What I want back: <format and length, e.g. "3 options, 5 lines each, your pick marked">
```

## Video source (L1-01, ~250 words, Sasha's voice, English)

Most people ask AI the way they type into a search box: one short line. And they get a search-box answer: generic, safe, true for everyone and useful to no one.

Here is the thing. The quality of the input defines the quality of the output. Garbage in, garbage out. Clear in, powerful out. The AI always answers at the level you speak to it.

So stop thinking "prompt engineering". Think of it as bringing a colleague up to speed. If a smart new colleague joined your team today, you wouldn't hand them one line. You'd tell them who you are, what you're trying to do, what matters here, and what you need back from them.

That's the whole skill. Four lines. Who I am. What I want. What matters here. What I want back.

Try it now. Take a question you asked an AI last week. Ask it again, with the four lines on top. Put the two answers side by side. If the new one uses your facts and gives you one thing you could actually do this week, you passed. If not, look at which line was thin, add one sentence, ask again.

You don't need to be an expert to start. You need a clear mind and a clear brief. The tools will change every month. This principle stays: define the goal, describe the context, refine in cycles.

## Sasha's own lines this unit is built on (his workshop slides, Spanish)

- «La calidad del input define la calidad del output.» · «Entrada basura = salida basura. Entrada clara = salida poderosa.»
- «Prompting como poner a alguien al corriente.» · «Prompt engineering → context engineering.»
- «Prompt engineering → poner al corriente + saber qué buscas.»
- «La IA siempre te responde en el mismo nivel que tú le hablas.»
- «El genio obedece tus deseos, pero según la claridad con la que los expreses.»
- «No hay que ser ningún experto para empezar a usarla: solo tener una mente abierta y clara.»

The four card lines are Hark's synthesis: the context-checklist slide in the source decks is a title without content, so the exact checklist Sasha used live is unknown. **Sasha to confirm or replace.**

## Done criteria (spec §5 field 10)

| Criterion | Evidence | Status |
|---|---|---|
| Fields 1–9 filled | this file | ✅ |
| Sasha signed the text | mark in [tracker.md](./tracker.md) | ❌ |
| Prompt file exists (product law) | `prompts/briefing-card.md` | ❌ |
| Infographic card exists | `cards/` path | ❌ |
| NotebookLM video exists | unlisted YouTube URL in tracker (needs Sasha's yes per batch) | ❌ |
| Check tested on one real founder | observed pass/fail note in tracker | ❌ |
