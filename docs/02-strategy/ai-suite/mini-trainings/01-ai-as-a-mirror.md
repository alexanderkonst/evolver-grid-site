# Mini-training 1 · AI as a Mirror

> Mini-training constructor (`docs/templates/course-from-source.md`), steps 1–2. Ladder of five (Sasha's yes, 2026-11-22): **1 AI as a Mirror** · 2 AI That Knows You · 3 AI in Your Business · 4 Your Harness · 5 AI Company. Rungs 2–5 are planned in [00-ladder.md](./00-ladder.md) (steps 1–2). Line between rungs 1 and 2: here **the game** knows the person; in rung 2 they make **any AI** know them, and learn to talk to it (goal · context · cycles, roast → next version). So nothing in rung 1 teaches prompting.
> Format (Sasha, 2026-11-22): 40 minutes at most · each micro-module = one idea, a **90 s** video, an **«Ask AI» button**.
> Status: **v0.6** (2026-11-22, after the first button test on real profiles). For Sasha to edit. No production (NotebookLM, YouTube) without his yes.

## Who it is for

**Players who have done the Top Talent reveal.** They already have a profile (talents, archetype, mission, life areas) and have already pasted one prompt into an AI. For them AI is not scary; it is a random helper. This mini-training turns it into a partner.

People who fear AI and have no profile are not the audience here: the workshops serve them. A person who opens this without a profile is invited to do the reveal first.

## Step 1 · Result

**In about 30 minutes AI turns from a random helper into your partner: it knows your talents and mission, and you know how to talk to it and when not to believe it.**

Done when the person has (1) a three-step plan for their mission, made together with AI and **saved**, and (2) caught, with their own eyes, one line AI said about them that would fit anyone.

**Setup piece handed over:** this Your AI chat, with their profile and the saved plan. In rung 2 the plan becomes their 90-day goals; in rung 3 it goes into their business document.

## The «Ask AI» button

### Why it exists
The video names the idea; the button lets the person **live** it. Each button does three things: **feel** the idea (not hear it again), **practice** one rep of talking to AI, and be **about them**.

### How it works (Sasha, 2026-11-22)
- **No typing.** A card with a ready prompt; the person presses **Send**. One tap.
- **Edit if you want.** The prompt is editable on the card, or press the microphone and say it your own way.
- **Built from the profile.** The prompt is filled with the person's talents, archetype, mission and life areas. They see exactly what goes in before sending.
- **One conversation.** All buttons go into one chat with Your AI, so later buttons can refer to earlier answers (micro-modules 6 and 8 depend on it).
- **Short answers.** Every prompt ends with «Up to 5 lines, no emojis.», so a button takes about 90 s. (Test: without the emoji ban, answers came with emojis; even with the line cap, follow-up turns ran 6–10 lines.)
- **Copy** works in any AI (ChatGPT, Claude, Gemini).
- **Rule:** whatever the AI answers, it cannot refute the video. Never ask AI to lecture about itself.
- **Order (hypothesis, test on people):** button first, then the 90 s video.

### Filling rule (fixes broken grammar)
Profile data always goes **after a colon, as a label and its value**: «My weakest life area: health.» Never inside a sentence that needs a grammatical case («for {area}»), which breaks in Russian and Spanish.

**Empty field: drop the whole label, never a stand-in.** Test: stand-ins gave «My most important life area: my most important life area.» and «What I do best: my main work.» In real profiles empty fields are common (3 of 4 had at least one). A button whose only profile field is empty uses the next field it has (e.g. #2 without `{mastery_action}` uses `{top_talents}`).

**Weakest area tie:** when several areas share the lowest stage, leave `{weakest_area}` out (test: one profile had six areas at stage 1).

Strip a trailing period from a value before adding the label's period.

### Privacy rule
Life-area levels are private in the game (visible only to the player). Inside Your AI they are used as is. On **Copy** to an outside AI, `{weakest_area}` becomes «[an area of my life]» and the person can type it in themselves.

### Profile fields used
| Placeholder | Where it lives | If empty |
|---|---|---|
| `{first_name}` | game_profiles.first_name | label dropped |
| `{top_talents}` | zog_snapshots.top_three_talents | invite to the reveal |
| `{archetype}` | zog_snapshots.archetype_title (a phrase like «Experience-to-Direction Turning», not a name) | label dropped |
| `{mastery_action}` | zog_snapshots.mastery_action (an action phrase, not an idea) | label dropped; #2 and #3 use `{top_talents}` |
| `{mission}` | game_profiles.mission_statement (sometimes written as «Dedicate your life…»; used as is) | label dropped; microphone invites the person to say it |
| `{priority_area}` | game_profiles.qol_priorities (first) | label dropped |
| `{weakest_area}` | qol_snapshots: lowest stage of the 8 life areas | label dropped (also on a tie) |

## Step 2 · Structure (8 micro-modules, ≈ 30 min)

| # | Micro-module | One idea | Promise line | Button (one tap, editable) | What they feel | Source |
|---|---|---|---|---|---|---|
| 1 | Nothing unnatural | There is one intelligence; AI is a new form of it, not something alien. | You stop seeing AI as a stranger. | «My name: {first_name}. My top talents: {top_talents}. My mission: {mission}. In up to 5 lines: what do you see in me that I may not see myself? Last line: what you are least sure of.» | Seen by something that isn't human, and it doesn't feel alien. | Training 5 (mindset shift); workshop A |
| 2 | Artificial = made with art | «Artificial» comes from *art*: made by skill, not fake. | You stop calling it a fake. | «What I do best: {mastery_action}. Write a four-line motto for it. Then two lines: what in it is your craft, and what came from me?» | Real craft, made from your own material. | Workshops A, B; Technology 179 |
| 3 | We choose where it goes | People choose where AI goes, step by step; your part starts today. (In the video, the myths are only examples: «it will destroy us», «a magic AGI day», «learn first».) | You see your own part, today. | «What I do best: {mastery_action}. My talents: {top_talents}. Up to 5 lines: what can AI do in my work better than me, and what stays only mine?» | Fear and waiting turn into a clear line: its part, my part. | Workshops A, B (utopia / dystopia, myths) |
| 4 | Not a tool: a synthetic brain | A brain trained on human language; unlike a hammer, it adapts to you. | You can explain AI in two sentences. | One button: «AI is a synthetic brain trained on human language. Unlike a hammer, it adapts to the person. My talents: {top_talents}. My archetype: {archetype}. Show me in up to 5 lines how you adapt to me, without explaining how AI works. No emojis.» | It changes for you; a tool never does. | Training 5 (tool vs technology vs AI); workshop A |
| 5 | A partner, not a search box | AI is a whole (voice, memory, hands, mirror of culture…) and today it can work with you. | You make your first plan together. | «My mission: {mission}. My most important life area: {priority_area}. Be my partner: three steps for this week, then ask me which one we start with. Up to 5 lines.» Then a **Save plan** button (pins the three steps in this chat). | It doesn't just answer; it works with you. | AI holomap (full map in rung 4) |
| 6 | AI's shadows | AI tends to please and to make things up; you judge, not it. | You catch AI flattering you, in your own chat. | No AI call first: the card shows the 5 lines AI said about the person in #1 and asks **them**: «Which line would fit almost anyone?» They tap it. Then one button: «This line would fit anyone: [tapped line]. Say it again so it fits only me, or tell me you don't know. Up to 3 lines.» | I caught it myself; AI didn't confess on demand. | Workshop A (quirks + antidotes); shadow map |
| 7 | The mirror | AI answers at the level you speak to it. | You see your own words change the answer. | Two buttons: «Help me with my life.» Then: «My name: {first_name}. My archetype: {archetype}. My weakest life area now: {weakest_area}. My talents: {top_talents}. Three moves that use my talents. Up to 5 lines.» | Your clarity is its clarity. | Workshops A, B; Training 5 (AI as mirror) |
| 8 | A real conversation (~5 min, by voice) | From tool to relationship: speak to it like to a colleague. | You have a partner, not an app. | «You know my plan from this conversation. Ask me three questions, one at a time, to understand what I want most right now. Then tell me which of the three steps we start with tomorrow.» Then answer by voice. Last line of the prompt: «Your final answer: up to 5 lines, no emojis.» Then **Save plan** again (the plan from #5 gets sharper here; test: it did in both runs). Closing card: «This chat is yours; it remembers your plan.» Once rung 2 exists, one more line: «Next: make any AI know you.» | A relationship begins, and it continues tomorrow. | Training 5 (horizontal collaboration); workshop B |

Timing: 7 × (≈ 90 s button + 90 s video) ≈ 21 min, plus micro-module 8 (≈ 5 min + video) and a short opening and closing ≈ 30 min. Room under 40.

## Button test 1 (2026-11-22)

Two real profiles, anonymized (no names), all buttons in one chat each, ChatGPT «Instant». The decided platform model is the cheapest Lovable chat model (Gemini 3.1 Flash Lite / GPT-6 Luna); rerun there once the card is built.

- **Worked:** #1 (insight + an honest «least sure of»), #2, #3 (clear «its part / my part»), #5 (a concrete three-step plan, even with no mission), #6 (AI rewrote the generic line and said what it doesn't know), #8 (three questions, then a sharper plan for tomorrow). Nothing argued with the video.
- **Broke:** stand-ins for empty fields read as nonsense; «What is a synthetic brain?» got a lecture on neuromorphic computing (AI explaining itself); «Talk to me as to: {archetype}» made AI greet the person by a phrase («Experience-to-Direction Turning, …»); emojis; follow-up turns ran past 5 lines.
- **Weak:** #7 «Help me with my life» is no longer vague inside one chat: AI already knows the person, so it asked a good question instead of giving a generic answer. The contrast still shows (a question vs three moves), but softer. Keep; watch on people.
- **#6 is hard for people:** picking «the line that fits anyone» from five tailored lines is not obvious. Keep; watch on people.

## What changed from v0.5 → v0.6 (2026-11-22)

- Empty field: drop the label, never a stand-in; tie in weakest area: leave it out.
- «Up to 5 lines, no emojis» on every prompt, #8 final answer included.
- #4 one button: the idea stated, AI shows how it adapts, no lecture.
- Archetype as a label, not as a way to address the person.
- Save plan again after #8.

## What changed from v0.4 (2026-11-22)

- **Line between rungs:** nothing here teaches prompting; that is rung 2 (see 00-ladder.md).
- **#3 one idea:** «we choose where it goes»; the three myths are only examples in the video.
- **#5 Save plan:** the three steps are pinned in the chat and carry into rungs 2 and 3.
- **#6 the person judges:** AI is not asked to find its own flattery (a pleaser confesses on demand, which is flattery again). The person taps the line from #1 that would fit anyone; AI rewrites it or says it doesn't know. The «Ask AI» call happens after the person's own judgment.
- **#8 handover:** the chat stays theirs; a bridge line to rung 2 appears only once rung 2 exists.

## What changed from v0.3 → v0.4 (2026-11-22)

- **Audience named: after the Top Talent reveal.** Result rewritten from «without fear, first conversation» (they already talked to AI) to «AI becomes your partner». Done = a three-step plan + one flattery caught.
- **Myths: three in one micro-module** (#3). 9 → 8 micro-modules, ≈ 30 min.
- **One idea per micro-module again:** «artificial = art» (#2) is separate from the myths.
- **Flattery became the lesson:** #1 ends with «what you are least sure of»; #6 asks AI to find its own flattery in #1, then argue against the plan from #5. The one chat now matters.
- **Filling rule:** data always after a colon (no grammatical cases); check against 3 real profiles.
- **Privacy rule:** weakest life area is masked on Copy.

## Open for Sasha

- **Money: decided** (Sasha, 2026-11-22): buttons inside the platform run on the **cheapest chat model the Lovable AI connector offers** (today Gemini 3.1 Flash Lite or GPT-6 Luna, per docs.lovable.dev/integrations/ai). ≈ 12 calls per person. Copy into your own AI stays available.
- To check before signing: rerun on the platform model once the card is built, and with 2–3 live people (the test above used a browser playing the person).
- Building the button card (Send · Edit · Microphone · Copy · Save plan · tap-a-line in #6) is platform work: through a @claude issue, no Lovable credits without your yes.
- **Academy level:** levels confirmed (Human Development Academy · Soul University · Mystery School); which level this mini-training sits on is not set yet.
- Not used here, kept for later rungs: lineage of AI's makers, the eight model types and eight harness layers, «not a genie but a genius» (rung 2).
