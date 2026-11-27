# Mini-training 2 · AI That Knows You

> Mini-training constructor (`docs/templates/course-from-source.md`), steps 1–2, made from the Rung 2 plan in [00-ladder.md](./00-ladder.md) (v0.1). Ladder of five (Sasha's yes, 2026-11-22): 1 AI as a Mirror · **2 AI That Knows You** · 3 AI in Your Business · 4 Your Harness · 5 AI Company.
> Line between rungs 1 and 2: in rung 1 **the game** knows the person; here the person **builds and carries their own** context, so **any AI** knows them.
> Format (Sasha, 2026-11-22): 40 minutes at most · each micro-module = one idea, a **90 s** video, an **«Ask AI» button** · video first, then the button (Sasha, 2026-11-24).
> Status: **draft v0.1** (2026-11-25), for Sasha's signature. Texts: [02-ai-that-knows-you-texts.md](./02-ai-that-knows-you-texts.md). Page: `/mini-trainings/ai-that-knows-you` (route only; the one link to it is the «Next» line at the end of rung 1). No production (NotebookLM, YouTube) without his yes.

## Who it is for

**Players who finished rung 1** (AI as a Mirror). They have a Top Talent profile and a three-step plan made with My AI. A player without a Top Talent profile is invited to do the reveal first (same gate as rung 1). Rung 1 is recommended, not required: the page does not check it.

## Step 1 · Result

**In about 35 minutes you have a one-page profile that makes any AI know you, and you know the three moves that make every answer better: goal, context, cycles.**

Done when the person pasted their profile into a second AI (not My AI) and got an answer that sounds like it knows them. The page cannot see the other AI, so the person marks it themselves («It knew me»).

**The thing they keep:** their **one-page AI profile** (v1.0, a living document): saved on this device, shown at the end of the page, with **Copy** for pasting into any AI.

**Setup piece handed over:** the profile, pasted into any AI.

## The «Ask AI» button (same rules as rung 1)

- No typing: a card with a ready prompt, one tap on **Send**; **Edit** or **Microphone** to say it your own way; **Copy** works in any AI.
- Filled from the profile, data always **after a colon** («My mission: …»); an empty field drops its whole label, never a stand-in.
- All buttons in **one chat** (later buttons build on earlier answers). Exception: **1a** goes alone, like a brand-new chat, so it gets a stranger's answer (and it is left out of the thread for the later buttons).
- Every prompt asks for **up to 5 lines, no emojis**, except the profile itself (#3, #4, #6b), which is **one page: five short sections, up to 3 lines each**.
- The button cannot refute the video; AI never lectures about itself.
- Dialog cards (#2, #4, #5, #6b) have an **answer box** under the AI's reply (voice or text), as in rung 1 #5 and #8. Each dialog prompt says «Ask only the first question now and wait for my answer» (rung 1 playtest: without it the model asked everything at once).
- **Save profile** appears under #3, #4 and #6b: the newest version replaces the saved one.

### Privacy
Rung 2 does not use life-area levels (`{weakest_area}`), so nothing needs masking on Copy. The profile is written by the person with AI; what goes in is what they say.

### Profile fields used
| Placeholder | Where it lives | If empty |
|---|---|---|
| `{top_talents}` | zog_snapshots.top_three_talents | invite to the reveal |
| `{archetype}` | zog_snapshots.archetype_title | label dropped |
| `{mission}` | game_profiles.mission_statement | label dropped; #1b uses `{top_talents}` if `{priority_area}` is empty too |
| `{priority_area}` | game_profiles.qol_priorities (first) | label dropped |
| `{plan}` | the plan saved in rung 1 (on this device) | label dropped |

## Step 2 · Structure (7 micro-modules, ≈ 30–35 min)

| # | Micro-module | One idea | Promise line | Button as built | What they feel | Source |
|---|---|---|---|---|---|---|
| 1 | Making yourself known | AI is as good as what it knows about you. | You see why a stranger AI gives average answers. | **1a** (alone, like a new chat): «Give me advice for my week. Up to 5 lines, no emojis.» **1b**: «My mission: {mission}. My most important life area: {priority_area}. Now give me advice for my week. Up to 5 lines, no emojis.» | Average vs mine, side by side. | Workshop B («personalizar es hacerte conocer»); Training 5 (hyper-personalization starts with self-understanding) |
| 2 | Bring it up to speed | A prompt is briefing a colleague, not a magic formula. | You stop hunting for clever words. | «Ask me 5 short questions, one at a time, that a new colleague would need to understand me and my work. Ask only the first question now and wait for my answer. After my fifth answer, tell me what you now know about me. Up to 5 lines, no emojis.» + answer box (5). | Being briefed on, not programmed. | Workshop B («prompting como poner a alguien al corriente») |
| 3 | The one-page profile | Identity and roles, 90-day goals, genius, preferences, limits. | You have your profile on one page. | «My talents: {top_talents}. My archetype: {archetype}. My mission: {mission}. My plan: {plan}. From everything in this chat and these lines, write my one-page AI profile with five short sections: identity and roles, 90-day goals, genius, how I like answers, my limits. Mark what you guessed. One page at most, up to 3 lines per section, no emojis.» + **Save profile**. | «That's me», with my own edits. | Workshop A session 2 (profile schema, «Perfil v1.0»); Training 5 (one-pager into AI) |
| 4 | The layer of «no» | Say what AI must never do or touch. | You set your limits once. | «Ask me 3 questions, one at a time, to find what you must never do for me or with my data. Ask only the first question now and wait for my answer. After my third answer, add a «No» section to my profile and show the whole profile again. No emojis.» + answer box (3) + **Save profile**. | Safe, in charge. | Workshop A session 2 («capa de no») |
| 5 | Goal, context, cycles | Principles that won't expire: name the goal, give the context, refine in cycles. | You have one habit for any AI, any year. | «Here is something I want: (say it). Before answering, tell me in 3 lines what goal and context you understood, and what's missing. No emojis.» Send waits until the person says it (microphone fills the gap) + answer box (2). | It asks back; I sharpen. | Workshop B closing principles |
| 6 | Roast, then next version | Clarity opens in layers: roast it, then produce the next version. | You stop accepting the first answer. | **6a**: «Roast my profile. Up to 5 lines, no emojis.» **6b**: «Produce the next version of my profile, with what the roast found. Same one page, five short sections, no emojis.» + answer box (2) + **Save profile**. | The second version is clearly better. | Workshop B («haz el roast → produce la siguiente versión»; ciclos de mejora) |
| 7 | Take it anywhere | Your profile is yours; it works in any AI. | Any AI knows you in 10 seconds. | No call to My AI. **Copy** gives the saved profile + «Read my profile. In 3 lines: what would you do differently for me now?» → paste into ChatGPT, Claude or Gemini. Then the person taps **It knew me**. | Portable self. | Training 5 (Q&A: two kinds of personalization, memory vs telling it who you are) |

Closing: the saved profile with **Copy**, and **Keep talking in My AI** → `/game/your-ai`.

Timing: 7 × (≈ 90 s video + ≈ 90 s button) ≈ 21 min, plus the dialogs in #2 and #4 (≈ 3 min each) and opening/closing ≈ 30–35 min. Room under 40.

## Calls to the platform AI

Reuses the `mini-training-chat` edge function as is (cheapest Lovable chat model, Sasha's yes 2026-11-22). A full run is up to ≈ 20 calls (1a, 1b, #2 with 5 answers, #3, #4 with 3 answers, #5 with 2, 6a, 6b with 2). **The function's daily cap is 20 per player, shared with My AI**, so a player who also used My AI that day can hit the cap mid-training (they see «The answer did not come»; Copy into their own AI still works). Its system prompt still names «AI as a Mirror»; the model is not told the rung's name, so this matters little. Both are edge-function changes: not made here.

## Open for Sasha

- **Signature** on the texts (02-…-texts.md) before any video.
- **Spoken layer** of the stub slides (context checklist, «capa de no» examples) is missing in the materials; your words would make #2 and #4 stronger.
- **Daily cap 20** vs ≈ 20 calls per run: raise the cap for mini-trainings, or accept it (edge-function change, your call).
- **Done-when is self-reported** («It knew me»): the page can't see the other AI.
- Profile is kept on this device only (as rung 1's plan). Following the person across devices needs a table (migration), not done.
