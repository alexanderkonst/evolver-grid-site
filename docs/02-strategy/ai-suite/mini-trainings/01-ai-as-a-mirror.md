# Mini-training 1 · AI as a Mirror

> Mini-training constructor (`docs/templates/course-from-source.md`), steps 1–2. Ladder of five (Sasha's yes, 2026-11-22): **1 AI as a Mirror** · 2 AI That Knows You · 3 AI in Your Business · 4 Your Harness · 5 AI Company. Only #1 is built now; 2–5 stay one line until #1 is done and the template is updated.
> Format (Sasha, 2026-11-22): 40 minutes at most · each micro-module = one idea, a **90 s** video, an **«Ask AI» button**.
> Status: **v0.4** (2026-11-22, after the roast of v0.3; Sasha: «Отлично, делай следующую версию»). For Sasha to edit. No production (NotebookLM, YouTube) without his yes.

## Who it is for

**Players who have done the Top Talent reveal.** They already have a profile (talents, archetype, mission, life areas) and have already pasted one prompt into an AI. For them AI is not scary; it is a random helper. This mini-training turns it into a partner.

People who fear AI and have no profile are not the audience here: the workshops serve them. A person who opens this without a profile is invited to do the reveal first.

## Step 1 · Result

**In about 30 minutes AI turns from a random helper into your partner: it knows your talents and mission, and you know how to talk to it and when not to believe it.**

Done when the person has (1) a three-step plan for their mission, made together with AI, and (2) caught AI flattering them once, in their own chat.

## The «Ask AI» button

### Why it exists
The video names the idea; the button lets the person **live** it. Each button does three things: **feel** the idea (not hear it again), **practice** one rep of talking to AI, and be **about them**.

### How it works (Sasha, 2026-11-22)
- **No typing.** A card with a ready prompt; the person presses **Send**. One tap.
- **Edit if you want.** The prompt is editable on the card, or press the microphone and say it your own way.
- **Built from the profile.** The prompt is filled with the person's talents, archetype, mission and life areas. They see exactly what goes in before sending.
- **One conversation.** All buttons go into one chat with Your AI, so later buttons can refer to earlier answers (micro-module 6 depends on it).
- **Short answers.** Every prompt asks for up to 5 lines, so a button takes about 90 s.
- **Copy** works in any AI (ChatGPT, Claude, Gemini).
- **Rule:** whatever the AI answers, it cannot refute the video. Never ask AI to lecture about itself.
- **Order (hypothesis, test on people):** button first, then the 90 s video.

### Filling rule (fixes broken grammar)
Profile data always goes **after a colon, as a label and its value**: «My weakest life area: health.» Never inside a sentence that needs a grammatical case («for {area}»), which breaks in Russian and Spanish. Before signing, check every button against 3 real profiles.

### Privacy rule
Life-area levels are private in the game (visible only to the player). Inside Your AI they are used as is. On **Copy** to an outside AI, `{weakest_area}` becomes «[an area of my life]» and the person can type it in themselves.

### Profile fields used
| Placeholder | Where it lives | If empty |
|---|---|---|
| `{first_name}` | game_profiles.first_name | left out |
| `{top_talents}` | zog_snapshots.top_three_talents | invite to the reveal |
| `{archetype}` | zog_snapshots.archetype_title | left out |
| `{mastery_action}` | zog_snapshots.mastery_action (an action phrase, not an idea) | «my main work» |
| `{mission}` | game_profiles.mission_statement | «what I want to give the world» + microphone |
| `{priority_area}` | game_profiles.qol_priorities (first) | «my most important life area» |
| `{weakest_area}` | qol_snapshots: lowest stage of the 8 life areas | «the area of life that's hardest now» |

## Step 2 · Structure (8 micro-modules, ≈ 30 min)

| # | Micro-module | One idea | Promise line | Button (one tap, editable) | What they feel | Source |
|---|---|---|---|---|---|---|
| 1 | Nothing unnatural | There is one intelligence; AI is a new form of it, not something alien. | You stop seeing AI as a stranger. | «My name: {first_name}. My top talents: {top_talents}. My mission: {mission}. In up to 5 lines: what do you see in me that I may not see myself? Last line: what you are least sure of.» | Seen by something that isn't human, and it doesn't feel alien. | Training 5 (mindset shift); workshop A |
| 2 | Artificial = made with art | «Artificial» comes from *art*: made by skill, not fake. | You stop calling it a fake. | «What I do best: {mastery_action}. Write a four-line motto for it. Then two lines: what in it is your craft, and what came from me?» | Real craft, made from your own material. | Workshops A, B; Technology 179 |
| 3 | Three myths, one answer | It won't destroy us, there's no magic «AGI day», and you don't need to learn first: people choose where it goes, step by step, and you just speak. | You see your own part, today. | «What I do best: {mastery_action}. My talents: {top_talents}. Up to 5 lines: what can AI do in my work better than me, and what stays only mine?» | Fear and waiting turn into a clear line: its part, my part. | Workshops A, B (utopia / dystopia, myths) |
| 4 | Not a tool: a synthetic brain | A brain trained on human language; unlike a hammer, it adapts to you. | You can explain AI in two sentences. | Two buttons: «What is a synthetic brain? Up to 5 lines.» Then: «Now explain it again through my talents: {top_talents}. Talk to me as to: {archetype}.» | It changes for you; a tool never does. | Training 5 (tool vs technology vs AI); workshop A |
| 5 | A partner, not a search box | AI is a whole (voice, memory, hands, mirror of culture…) and today it can work with you. | You make your first plan together. | «My mission: {mission}. My most important life area: {priority_area}. Be my partner: three steps for this week, then ask me which one we start with. Up to 5 lines.» | It doesn't just answer; it works with you. | AI holomap (full map in rung 4) |
| 6 | AI's shadows | AI tends to please and to make things up; each shadow has an antidote. | You catch AI flattering you, in your own chat. | Two buttons: «Reread what you told me about myself at the start. Where did you flatter me? Honestly, up to 5 lines.» Then: «Now the strongest argument against the three steps we made.» | The flattery was about *me*, and now I see it. | Workshop A (quirks + antidotes); shadow map |
| 7 | The mirror | AI answers at the level you speak to it. | You see your own words change the answer. | Two buttons: «Help me with my life.» Then: «My name: {first_name}. My archetype: {archetype}. My weakest life area now: {weakest_area}. My talents: {top_talents}. Three moves that use my talents. Up to 5 lines.» | Your clarity is its clarity. | Workshops A, B; Training 5 (AI as mirror) |
| 8 | A real conversation (~5 min, by voice) | From tool to relationship: speak to it like to a colleague. | You have a partner, not an app. | «You already know a lot about me from this conversation. Ask me three questions, one at a time, to understand what I want most right now.» Then answer by voice. | A relationship begins. | Training 5 (horizontal collaboration); workshop B |

Timing: 7 × (≈ 90 s button + 90 s video) ≈ 21 min, plus micro-module 8 (≈ 5 min + video) and a short opening and closing ≈ 30 min. Room under 40.

## What changed from v0.3 (2026-11-22)

- **Audience named: after the Top Talent reveal.** Result rewritten from «without fear, first conversation» (they already talked to AI) to «AI becomes your partner». Done = a three-step plan + one flattery caught.
- **Myths: three in one micro-module** (#3). 9 → 8 micro-modules, ≈ 30 min.
- **One idea per micro-module again:** «artificial = art» (#2) is separate from the myths.
- **Flattery became the lesson:** #1 ends with «what you are least sure of»; #6 asks AI to find its own flattery in #1, then argue against the plan from #5. The one chat now matters.
- **Filling rule:** data always after a colon (no grammatical cases); check against 3 real profiles.
- **Privacy rule:** weakest life area is masked on Copy.

## Open for Sasha

- **Money (separate fork, later):** inside the platform each button is an AI call (≈ 12 per person; Lovable credits). Free, paid, or «Copy into your own AI» only?
- **Ladder overlap grows:** with the profile, rung 1 already does much of rung 2 (AI That Knows You). Rungs 1 and 2 may merge; decide after the first real test.
- To check before signing: run all buttons with 3 real profiles in Your AI, ChatGPT and Claude; mark any answer that argues with the video.
- Building the button card (Send · Edit · Microphone · Copy) is platform work: through a @claude issue, no Lovable credits without your yes.
- Not used here, kept for later rungs: lineage of AI's makers, the eight model types and eight harness layers, «not a genie but a genius» (rung 2).
