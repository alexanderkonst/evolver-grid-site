# Mini-training 1 · AI as a Mirror

> Mini-training constructor (`docs/templates/course-from-source.md`), steps 1–2. Ladder of five (Sasha's yes, 2026-11-22): **1 AI as a Mirror** · 2 AI That Knows You · 3 AI in Your Business · 4 Your Harness · 5 AI Company. Only #1 is built now; 2–5 stay one line until #1 is done and the template is updated.
> Format (Sasha, 2026-11-22): 40 minutes at most · each micro-module = one idea, a **90 s** video, an **«Ask AI» button**.
> Status: **v0.3** (2026-11-22, after the roast of v0.2 and Sasha's «now we're talking»: buttons built from what the game already knows about the person, one tap to send). For Sasha to edit. No production (NotebookLM, YouTube) without his yes.

## Step 1 · Result

**After 40 minutes you see AI clearly, without fear and without hype, and you have had your first real conversation with it, by voice.**

Done when: the person has spoken to an AI by voice and answered its questions about what they want most right now.

## The «Ask AI» button

### Why it exists
The video names the idea; the button lets the person **live** it. Each button does three things: **feel** the idea (not hear it again), **practice** one rep of talking to AI, and be **about them**.

### How it works (Sasha, 2026-11-22)
- **No typing.** The person sees a card with a ready, well-made prompt and presses **Send**. One tap.
- **Edit if you want.** The prompt is editable on the card; or press the microphone and say it your own way.
- **Built from the profile.** The game already knows the person: top talents, archetype, mission, life areas, uniqueness. The prompt is filled with it, so every question is about *their* talent and *their* mission. The person sees exactly what goes in before sending.
- **One conversation.** All buttons go into one chat with Your AI. The whole mini-training becomes one real conversation; the result grows along the way.
- **Short answers.** Every prompt asks for an answer of up to 5 lines, so each button takes about 90 s.
- **Works anywhere.** Because the profile is written into the prompt, a **Copy** button works in any AI (ChatGPT, Claude, Gemini) too.
- **Rule:** whatever the AI answers, it cannot refute the video. Never ask AI to lecture about itself.
- **Order (hypothesis, test on people):** button first, then the 90 s video: feel, then get the name.

### Profile fields used (from the platform's data)
| Placeholder | Where it lives | If empty |
|---|---|---|
| `{first_name}` | game_profiles.first_name | left out |
| `{top_talents}` | zog_snapshots.top_three_talents | «what I'm best at» + microphone |
| `{archetype}` | zog_snapshots.archetype_title | left out |
| `{mastery_action}` | zog_snapshots.mastery_action | «my main work» |
| `{mission}` | game_profiles.mission_statement | «what I want to give the world» + microphone |
| `{priority_area}` | game_profiles.qol_priorities (first) | «my most important life area» |
| `{weakest_area}` | qol_snapshots: lowest stage of the 8 life areas | «the area of life that's hardest now» |
| `{uniqueness}` | canvas_snapshots.uniqueness (founders only) | not used |

A person with an empty profile still gets a working button (generic wording + microphone). Hypothesis: the mini-training invites them to do the Top Talent reveal first.

## Step 2 · Structure (9 micro-modules, ≈ 33 min)

| # | Micro-module | One idea | Promise line | Button (one tap, editable) | What they feel | Source |
|---|---|---|---|---|---|---|
| 1 | Nothing unnatural | There is one intelligence; AI is a new form of it, not something alien. | You stop seeing AI as a stranger. | «I'm {first_name}. My top talents: {top_talents}. My mission: {mission}. In up to 5 lines: what do you see in me that I may not see myself?» | Seen by something that isn't human, and it doesn't feel alien. | Training 5 (mindset shift); workshop A |
| 2 | Artificial, and not «someday» | «Artificial» comes from *art*, made by skill; AI grows step by step, there's no magic AGI day. | You stop fearing a fake and waiting for a day that won't come. | «Write a four-line motto for my work: {mastery_action}, in service of {mission}. Then, in two lines: what in it is your craft, and what came from me?» | Real craft, made from your own material. | Workshops A, B (myths); Technology 179 |
| 3 | Myth: it will destroy us | People choose where AI leads. | You see your own part in where AI goes. | «My work: {mastery_action}. My talents: {top_talents}. Up to 5 lines: what can AI do in my work better than me, and what stays only mine?» | Fear turns into a clear line: its part, my part. | Workshops A, B (utopia / dystopia) |
| 4 | Myth: first I must learn | The easiest technology ever: you just speak. | You stop putting it off. | Microphone button, with a suggestion on the card: «Say: what's one small step this week for {priority_area}?» | You already can. | Workshops A, B; «only an open, clear mind» |
| 5 | Not a tool: a synthetic brain | A synthetic brain trained on human language, and unlike a hammer, it adapts to you. | You can explain AI in two sentences. | Two buttons: «What is a synthetic brain? Up to 5 lines.» Then: «Now explain it again through my talent, {top_talents}, the way a {archetype} would get it.» | It changes for you; a tool never does. | Training 5 (tool vs technology vs AI); workshop A (LLM = synthetic brain) |
| 6 | Many parts, one partner | AI is a whole (voice, memory, hands, mirror of culture…) and today it has grown into a partner. | You see AI as a partner, not a search box. | «This week I want to move my mission forward: {mission}. Be my partner: three steps, then ask me where we start. Up to 5 lines.» | It doesn't just answer; it works with you. | AI holomap (8 parts, 7 stages; full map in rung 4) |
| 7 | AI's shadows | AI tends to please and to make things up; each shadow has an antidote. | You know what to watch for and what to say. | Two buttons: «Praise this idea of mine: {mastery_action}.» Then: «Now honestly: the strongest argument against it. Up to 5 lines.» | The flattery, then the cure, seen with your own eyes. | Workshop A (quirks + antidotes); shadow map |
| 8 | The mirror | AI answers at the level you speak to it. | You see your own words change the answer. | Two buttons: «Help me with my life.» Then: «I'm {first_name}, a {archetype}. My weakest area now is {weakest_area}. Give me three moves that use my talents: {top_talents}. Up to 5 lines.» | Your clarity is its clarity. | Workshops A, B; Training 5 (AI as mirror) |
| 9 | First real conversation (~5 min, by voice) | From tool to relationship: speak to it like to a colleague. | You have had your first real conversation with AI. | «You already know a lot about me from this conversation. Ask me three questions, one at a time, to understand what I want most right now.» Then answer by voice. | A relationship begins. | Training 5 (horizontal collaboration); workshop B |

Timing: 8 × (≈ 90 s button + 90 s video) ≈ 24 min, plus micro-module 9 (≈ 5 min + video) and a short opening and closing ≈ 33 min. Room to spare under 40.

## What changed from v0.2 (2026-11-22)

- **Personalized from the profile** (Sasha): every prompt is filled with the person's talents, archetype, mission and life areas. One tap to send, editable, microphone as an option. No blanks to type.
- **One chat** for the whole mini-training, so AI remembers the person from button to button.
- «Up to 5 lines» in every prompt, so a button takes ≈ 90 s.
- Merged: myths 2 + 3 (artificial / AGI day); «tool, technology, AI» + «how it works». 11 → 9 micro-modules, ≈ 33 min.
- Shadows button made reliable: «praise it» then «now honestly», so the difference always shows even with models that already criticize.

## Open for Sasha

- To check before signing: run all buttons with a real profile in Your AI, ChatGPT and Claude; mark any answer that argues with the video.
- Building the button card (Send · Edit · Microphone · Copy) is platform work: through a @claude issue, no Lovable credits without your yes.
- Hypothesis: Your AI already has the profile in context, so the prompts could be shorter there. Keep the full text visible anyway: seeing «it knows me» is part of the feeling.
- Overlap to watch: this already touches rung 2 (AI That Knows You). Rung 1 uses the profile lightly; rung 2 goes deep.
- Not used here, kept for later rungs: lineage of AI's makers, the eight model types and eight harness layers, «not a genie but a genius» (rung 2).
