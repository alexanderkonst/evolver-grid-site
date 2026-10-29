# The player's own AI (working name: Your AI) — Progress Tracker

**Started:** 2026-10-29 · **Author:** Evolver (Hark), for Sasha's review
**Status:** Phase 1 PRODUCT v2, Sasha's ideas integrated (2026-10-29), name REOPENED 2026-10-29 15:02 ← CURRENT
**Method:** `docs/03-playbooks/integrated_product_building_workflow.md` (Transformative-Result Pattern), `docs/templates/module-form.md` (Intro → one button → result → Outro), `docs/templates/spec-handoff.md` (build tasks)
**Grounded in:** `docs/ai/README.md` §0 (Sasha's thesis, 2026-10-29), `docs/02-strategy/game_of_being_you.md` §18, `docs/01-vision/ai_os_benchmark.md`, current `/ai-os` (code `src/modules/ai-os/`, live page read 2026-10-29), repo at `04e6f0a`

---

## INPUT ✅ (5/5)

- [x] **ICP:** a founder or solo professional who already uses ChatGPT, Claude or Gemini every week and has played at least the first step of the game (or is a guest about to).
- [x] **Transformation:** "AI gives me the same answer it gives everyone" → "I have my own AI that knows me, my work, and thinks at its best, in whatever chat app I use."
- [x] **Pain of Point A** (their words): *"It's smart, but it doesn't know me. Every chat I start from zero, re-explain who I am and what my business is, and still get advice that could be for anyone."*
- [x] **Dream Outcome:** *"I ask it a real question and the answer is about me. It names my strengths, uses my words, knows my clients. It feels like talking to someone who's been watching my work."*
- [x] **Action:** ask one real question, see two answers side by side, press one button to take their personal AI into their own chat app; then keep playing and watch it learn.

---

## PHASE 1: PRODUCT `[■■■■■░░░]` 60%

- [x] 1.1 Master Result — below
- [ ] 🔥 ROAST 1.1 — Sasha
- [x] 1.2 Sub-Results — the three gifts
- [ ] 🔥 ROAST 1.2 — Sasha
- [x] 1.3 Screens — 4 screens + 1 recurring moment
- [x] 1.4 Screen Details (Dan Tians) — per screen below
- [x] 1.5 Extensions — artifacts, growth, skip, bridges
- [ ] 1.6 Wireframes — one ASCII sketch for the reveal screen; rest after roast
- [ ] 🔥 ROAST GATE 1

PHASE 2 ARCHITECTURE, PHASE 3 UI, PHASE 4 CODE: `[░░░░░░░░]`, scoped as three build tasks in §9.

---

## 1.1 Master Result

**Point A:** "Every AI gives me the same generic answer, and I start from zero in every chat."
**Point B:** "My own AI already knows my top talent and my business, thinks at full depth, and goes with me into any chat app."

> **Master Result:** *Sputnik takes you from an AI that answers you like it answers everyone to your own AI that knows your talent and your work and thinks at its best, on whichever model you use.*

**Why it's true, not aspirational.** Sasha's thesis: frontier models now give near-identical answers; the difference comes from three levers on top of any model. One of the three is already measured: same model (Claude Opus 4.7), with vs. without AI OS, deep-synthesis score 67 → 95 (+42%), blind-scored (`ai_os_benchmark.md`). The other two (knowing the person, knowing their work) are already built as game data. The product adds no new intelligence; it joins what exists and lets the player feel it.

**Measurable B:** the player has (1) rated the side-by-side difference 1–10, (2) pressed "Ask my AI" at least once (copy event), (3) their gifts state shows which of the three their AI has.

---

## 1.2 Sub-Results: the three gifts

Each gift is one thing the AI gains. Each is a felt mini A → B, and each is already delivered by a piece that exists.

| # | Gift (name in the game) | Mini A → B (player's words) | Delivered by (exists today) | Data |
|---|---|---|---|---|
| 1 | **It knows you** | "It treats me like anyone" → "It names my talent back to me in words I recognise" | Zone of Genius: top talent, character sheet (J1) | `zog_snapshots` via `game_profiles.last_zog_snapshot_id` (archetype title, Appleseed, Excalibur, top three talents); later mission (J2), QoL |
| 2 | **Activated** | "Its answers are flat and generic" → "Its dormant potential is activated: full depth, on any model" | AI OS system prompt v5.2 | `system-prompts/v5.2/system-prompt.md`; already bundled on `/ai-os` as `META_PROMPTS` id `meta-cognition-premium` |
| 3 | **It knows your work** | "I re-paste my business every time" → "It already knows my clients, their pain, my promise, my offer" | Workshop (`/ubb`) artifacts | `user_business_artifacts` (19 keys: uniqueness, myth, tribe, pain, promise, value ladder, packaging, golden DM, landing page…) |

**Sequence the player lives:** gift 2 is lit for everyone, guests included (it needs no data). Gift 1 lights at J1 (top talent saved). Gift 3 fills artifact by artifact in the Workshop. So the AI visibly grows along the existing journey; nothing new to play just to feed it.

**1st-session sweet spot.** Guaranteed result in one visit: one real question answered better than a plain model, and their AI in their pocket. Silhouette of the full journey: two gifts still dim, each with a line "Opens when…". Enough to want the next step, not a to-do list.

---

## 1.3–1.4 Experience flow, feel first (screens with Dan Tians)

Rule from §18: **feel first, name second.** The player never reads the thesis before they've seen the difference.

### Screen 1 · `FamiliarIntroScreen` (before-screen)
- Eyebrow: *Sputnik · your AI*
- Headline (= Master Result): **"Same question. Two answers. See what happens when your AI knows you."**
- Silhouette: "Ask something real. You'll get a plain model's answer and your own AI's answer, side by side. Same model underneath."
- 🫀 Heart: curiosity with a small dare; *"let's see."*
- 🧠 Mind: this is a test I run on my own life, not a demo.
- 🔥 Gut: **"Ask my question →"**

### Screen 2 · `FamiliarAskScreen`
- One text box, placeholder: "What are you deciding right now?" Three tap-to-fill examples, the first being the test prompt already on `/ai-os`: *"Based on everything you know about me, what are the best actions for me in the short, medium and long term? One sentence each."*
- Shows what their AI will bring: three gift chips, lit or dim.
- 🫀 Heart: seen as an adult with a real question.
- 🧠 Mind: the answer will only be as good as what my AI knows.
- 🔥 Gut: **"See both answers →"**

### Screen 3 · `FamiliarRevealScreen` (the felt difference)
```
┌───────────────────────────────┐
│ Your question: "…"            │
├──────────────┬────────────────┤
│ A plain model│ Your Sputnik   │
│ (knows       │ knows: ● you   │
│  nothing     │  ● your work   │
│  about you)  │  ● activated   │
│              │                │
│  answer…     │  answer…       │
├──────────────┴────────────────┤
│ How different is this? 1–10   │
│ [ Hear why → ]                │
└───────────────────────────────┘
```
Mobile: stacked, plain first, then theirs (the arrival is the second card).
- Same model on both sides; the only variable is what the AI carries. A small line says so.
- Rating 1–10 writes to `resonance_events` (as `AiOsSpotlight` already does).
- 🫀 Heart: *"that one is about me."* The recognition that lands before the explanation.
- 🧠 Mind: the difference isn't the model.
- 🔥 Gut: **"Hear why →"** (appears after rating; rating optional)

### Screen 4 · `FamiliarOutroScreen` (after-screen, the deliverable)
- Celebration eyebrow: *Done · Your AI is ready*
- **The naming line, one sentence, large:** *"Models have become alike. The difference is how well your AI knows you."*
- The result itself: the three gifts with state ("Knows you: your top talent · Activated: AI OS 5.2 · Knows your work: 6 of 19 Workshop pieces").
- Where it lives: "Always here, in Sputnik. It grows as you play."
- What it unlocks: "Take it into the chat app you already use."
- Real choice (module-form §5): **"Where will your AI live?"** ChatGPT · Claude · Gemini (stored).
- Victory recorded ("Met my AI").
- 🫀 Heart: ownership; *"this is mine, and it travels with me."*
- 🧠 Mind: three things make an AI mine: it knows me, it's awake, it knows my work.
- 🔥 Gut: **"Ask my AI →"** copies their personal prompt and opens a new chat in the app they chose, with one line: "Pasted? Now ask it anything." Secondary: "Back to the village".

### Recurring moment · `FamiliarLearnedLine` (inside every module's Outro)
- In the "what it unlocks" slot of `ModuleOutro`: **"Your AI just learned: your mission."** (or "your tribe", "your promise", "your top talent").
- If their prompt changed since they last copied it: **"Update my AI →"** (copies the new version).
- Not a toast: a line on the stable after-screen, with the gift chip brightening.

---

## Honest split: client-side vs. backend

| Piece | Where | Cost / gate |
|---|---|---|
| Assemble the personal prompt (AI OS + top talent + artifacts) | **Client only.** Reads `zog_snapshots`, `user_business_artifacts` through existing RLS-scoped client queries; AI OS text is already in the bundle | none |
| "Ask my AI" (copy + open chat app) | **Client only.** Clipboard + open the app's new-chat URL. The full prompt (~5,400 words of AI OS plus profile) is too long to prefill through a URL, so it always goes via clipboard | none |
| Gift state, version, "Update my AI" nudge | **Client only.** Version = hash of the assembled prompt; last-copied version in `localStorage` | none |
| Rating | Existing `resonance_events` insert | none |
| **Live side-by-side answers** | **Backend.** Needs a model call from an edge function (key stays server-side). Two calls, same model, in parallel: plain (no system prompt) vs. personal prompt | **New edge function = Lovable deploy = credits → needs Sasha's yes.** Each reveal also spends AI-gateway usage (two calls per question); suggest signed-in players only, a daily cap |
| Fallback with no backend | **Client only.** The guided self-experiment already live on `/ai-os`: copy the question → ask your own AI; copy your personal prompt + question → ask a new chat; compare in your app. Same reveal, done in the player's own tool | none |

Not recommended: reusing the deployed `library-advisor` function to avoid a deploy. It hard-codes a "spiritual and wellness guide" system message and a lite model, so neither side would be a fair "plain model".

**Recommendation:** ship v1 with the self-experiment fallback on Screen 3 (works today, zero credits), and the live side-by-side behind a feature flag that turns on only after Sasha approves the deploy.

Privacy line on Screen 4, small: "This copies your profile and Workshop work so you can paste it into your own AI. Nothing is sent anywhere until you paste."

---

## 1.5 Extensions

- **Artifacts:** the assembled personal prompt (derived, never stored server-side in v1), gift state, chosen chat app, rating, victory "Met my AI".
- **Visible growth (state shown):** three gift chips. *Knows you:* dim → "your top talent" → "+ your mission". *Activated:* always lit, shows "AI OS 5.2". *Knows your work:* "n of 19 Workshop pieces". Plus a quiet "updated today" stamp. No points, no level (fidelity rule, blueprint §10a): the state shows only real things the AI now has.
- **Completion criteria (data):** rating row in `resonance_events` with `message_seen = "familiar reveal"` OR a copy event; chosen app stored.
- **Skip paths:** a player can go straight to "Ask my AI" from Screen 2 (link "Skip the test, give me my AI"); nothing is lost; the reveal stays available.
- **Guests:** enter, see gift 2 lit and gifts 1 and 3 dim with "Opens when you save your top talent" / "Opens in the Workshop". Their "Ask my AI" copies AI OS alone (today's `/ai-os` install). *This changes the lock rule: Oracle currently opens at J1 (inferred, module-form §6). Proposed: open for everyone, partly lit. Sasha to confirm.*
- **Bridges:** Zone of Genius Outro → "Your AI just learned your top talent" → Sputnik. Workshop artifact Outros → same. Sputnik Outro → Back to the village. Optional $37 Oracle Reading stays a side quest inside this place; its Scroll adds to gift 1.

---

## Naming

**Update 2026-10-29 15:02 (Sasha): definite NO to Familiar, Friend, Daemon, Sputnik.** Live candidates: **Your AI / Твой ИИ**, **Genie / Джин** (his line: «Личный харк для гения игрока - джин. Genius <> Genie»), **Genius**. Until decided, "Sputnik" in this doc reads as the working placeholder. *Earlier note, superseded:* Decision "Sputnik, your AI". Russian UI: «Спутник, твой ИИ». Why it wins: an international word meaning *fellow traveler*, cosmic, and it carries the golden thread: a second self bound to one person that takes form as they become themselves (Roman genius, Socratic daimonion, Pullman's daemon, the familiar). Always paired with "your AI" so it passes the stranger test. Known risk: English-speaking associations with Sputnik News and Sputnik V; the pairing and warm visual language keep it personal, not political. Formula: *"Your AI, the companion of your genius."* "Activated" replaces "awake" everywhere (Sasha: activation of dormant potential). Code ids stay `familiar` / `oracle`; the table below is the earlier analysis, kept for reference.

The place is renamed around the player's own AI. Candidates:

| Name | One-line reasoning |
|---|---|
| **Your Familiar** ⭐ | Game-native and mythic: a familiar is a creature bound to you that grows as you do; gives the verb "Train your familiar"; fits the village and the Lunar skin. Fails the stranger test alone, so it's always paired with "your own AI". |
| **Your AI** | Plainest universal language, zero glossary; weak as a place on a map, no story. Use it in buttons regardless. |
| **The Apprentice** | You're the master, it learns your craft; strong for founders; but suggests it's junior, which undersells gift 2. |
| **The Mirror** | Echoes the reflection mechanic of the game; but promises seeing only, not acting or thinking with you. |
| **AI Twin** | Instantly understood; wrong promise (impersonation, replacing you). Reject. |

**Recommendation:** **"Your Familiar"** as the place name, with the eyebrow "your own AI" everywhere it appears, and buttons in plain words ("Ask my AI", "Update my AI"). **"Personal AI harness" stays internal** (docs, code: `familiar`/`harness`). Decision: Sasha.

---

## What happens to today's `/ai-os` (keep, move, drop, nothing breaks)

| Today | Decision | Why |
|---|---|---|
| `/ai-os` page (hero, 60-second install, 3-step self-experiment, skill suites) | **Keep as is.** Public, free (CC BY-SA), linked from outside and from the benchmark post | It's gift 2 standing alone, for people who never play. One added line for signed-in players: "Make it yours: add your talent and your work → Sputnik" |
| The 3-step self-experiment (test prompt → install → compare) | **Move (copy) into Screen 3** as the no-backend reveal | It already is the reveal; the Familiar version adds the person's data |
| Skill suites `/ai-os/clarity`, `/iteration`, `/vibe-code`, `/design` | **Keep**, linked from the Familiar Outro as "Skills for your AI" (secondary) | Power-ups after the core; not part of the first session |
| `/ai-os/benchmark` (long evidence page) | **Keep, move out of the flow:** one link "Why this works" under the naming line | Evidence for the curious; never before the felt difference |
| `/ai-os/work-with-us` (former pricing) | **Keep route, don't link from the flow** | Selling is not this place's result |
| `/ai-os/profile`, `/ai-os/auth` | **Leave the existing redirects** | Profile lives in the game now (character sheet) |
| Village place "Oracle" (`oracle`) | **Rename to Sputnik; ENTER goes to `/game/familiar`** (new route). Keep `oracle` as the internal place id so saves and lock rules don't break | No migration needed |

Nothing is deleted in v1.

---

## 9. v1 scope: three independent build tasks

Shared contract, created by whichever task lands first, exactly as written (`src/modules/familiar/types.ts`):
```ts
export type GiftKey = "knowsYou" | "activated" | "knowsYourWork";
export interface GiftState { key: GiftKey; lit: boolean; label: string; detail?: string; opensWhen?: string }
export interface FamiliarState { gifts: GiftState[]; prompt: string; version: string; lastLearned?: string; loading: boolean }
export type ChatApp = "chatgpt" | "claude" | "gemini";
export interface CompareResult { mode: "live" | "self"; plain?: string; personal?: string }
```
Each task works against this contract, mocking what the other two provide. No file conflicts: each task owns its own files.

### Task A · Claude (`@claude` issue) · The personal prompt and "Ask my AI" (client only)
**Builds:** `src/modules/familiar/buildFamiliarPrompt.ts` (pure function: AI OS text + top talent snapshot + mission + Workshop artifacts → one prompt with a short "About me / My work" section before AI OS; empty parts omitted), `useFamiliar.ts` (reads existing tables, returns `FamiliarState`, version = hash), `AskMyAiButton.tsx` (copy + open the chosen app's new chat; shows "Update my AI" when version ≠ last copied in `localStorage`).
**DoD:** unit tests for prompt assembly (guest, J1 only, J1 + 6 artifacts, all 19) · AI OS text read from the existing bundled source, not duplicated · no new tables, no edge functions · button works on iOS Safari and desktop Chrome (screenshots) · copied text verified by pasting into a fresh Claude chat (screenshot of first answer) · `npm run build`, `tsc --noEmit`, lint green.

### Task B · Gemini (Jules) · The place: four screens and the "just learned" line
**Builds:** `src/modules/familiar/screens/` (Intro, Ask, Reveal, Outro per the copy and Dan Tians above), route `/game/familiar` inside `GameShellV2`, village place `oracle` relabelled "Sputnik" and pointing to the route, `FamiliarLearnedLine` added to the existing `ModuleOutro` "what it unlocks" slot for Zone of Genius, Mission and Workshop artifacts. Reveal uses `compareAnswers()` from Task C if present; until then renders `mode: "self"` (the guided 3-step).
**DoD:** every CTA label exactly as specified · Outro is a stable screen, never a toast · rating writes to `resonance_events` with `message_seen = "familiar reveal"` · guest sees gift 2 lit, 1 and 3 dim with their lines · `/ai-os` and its sub-routes unchanged (diff shows no edits under `src/modules/ai-os/` except the one signed-in line) · mobile 375px screenshots of all four screens · Back, refresh, deep link to `/game/familiar` tested · build, types, lint green.

### Task C · ChatGPT Codex · Live side-by-side (backend written, not deployed)
**Builds:** `supabase/functions/familiar-compare/index.ts`: auth required; input question + personal prompt; two parallel calls to the same model (plain: no system prompt; personal: the prompt as system message); returns both; per-user daily cap; errors map to 429/402 like existing functions. Client `src/modules/familiar/compareAnswers.ts`: calls the function behind flag `VITE_FAMILIAR_LIVE`; on flag off, 404 or error returns `{ mode: "self" }`.
**DoD:** function code + Deno test with mocked gateway · model name in one constant · same model verified on both calls (test) · cap enforced (test) · client fallback tested for flag off / 404 / 429 · **no deploy, no Lovable prompt**: PR body states "deploy needs Sasha's yes (Lovable credits)" · build, types, lint green.

**Merge order:** any. A and C are pure additions; B renders the fallback until A and C land. Live mode turns on only after Sasha approves the deploy.

---

## Open decisions for Sasha

1. **Name (reopened 15:02):** Your AI / Genie / Genius. No: Familiar, Friend, Daemon, Sputnik.
2. **Lock rule:** open the place to guests, partly lit (recommended), or keep it closed until J1.
3. **Live side-by-side:** approve the `familiar-compare` deploy (Lovable credits) and ongoing AI usage, signed-in only with a daily cap; or stay on the self-experiment.
4. **Model for the live reveal:** a frontier model makes the point honestly; a lite model is cheaper but makes both answers weaker.

---

## 10. Integrated ideas (Sasha, 2026-10-29) → where each lands

| Idea | What it means for the product | Lands in |
|---|---|---|
| **The Cinderella Moment** | The moment the game recognises who the player already is: top talent found, Sputnik settles into form. Recognition, not transformation; the slipper fits only them. Subtitle for the mechanics: "the harvest of the assembly". | J1 Outro: Sputnik takes its form (visual + "Sputnik now knows who you are"). The biggest emotional beat of the journey |
| **Feelings are gameplay** | What the player feels is input, not decoration. After key screens: "How did that land?" (one tap + optional line), fed to Sputnik's memory | Outro; new artifact `felt_moments` (v2) |
| **Every growth unlocks two things** | Each step shows both: "Sputnik can now A, B, C" and "you can now get from it the best 1, 2, 3" (ready prompts) | Unlock card in every Outro, two columns *It can now* / *You can now ask*, each with a copy button |
| **The player lives in the game** | The game is Sputnik's home: memory, history, relationship. The model is swappable; the home and the bond stay | Principle: **AI memory = game state**, never locked to one model vendor |
| **Two-way growth, no guilt** | Tamagotchi, but mutual: the player grows Sputnik, Sputnik grows the player. No punishment, no "death" after a break | Return screen after absence: "Welcome back. Here is what I kept for you." Never a decay meter |
| **Feel first, name later** | The player feels the difference before reading the thesis | Already the flow rule (§1.3) |
| **A small model that knows you beats a big one that doesn't** | The living proof of the thesis | First experiment below; if it holds, the Screen 3 claim |
| **Model ladder** | Free: personal prompt into ChatGPT / Claude / Gemini. In-game: small open model with a daily limit. Paid: frontier model / credits. Text chat "something like Hark" | v1 = rung 1. Rungs 2–3 = v2, after the experiment and Sasha's yes on money |
| **Sovereign / local AI** | Like Qwatra Node for companies: the AI lives with the player, not with a provider (WebGPU/WebLLM in browser, later local) | v3 research note; no build in v1 |
| **Four product parts** | (1) `/ai-os` as prototype, (2) growing the companion, (3) talking to it, (4) hyper-personalisation + activated potential + digital twin of the business | 1 exists; 2 = this spec; 3 = rungs 2–3; 4 = gifts 1–3 joined |

### First proof experiment (before any model spend)
One test question. Side A: a small open model (hosted open-model API) with the player's compressed memory. Side B: a frontier model with no memory. Blind 1–10 rating, 5 players. If A ≥ B on "this is about me", rung 2 is justified and becomes the Screen 3 headline. Cost: cents, no deploy; needs Sasha's yes (external API).

### Changes to the build tasks from this section
- **Task A:** prompt builder adds the "you can now ask" prompts per unlocked piece (static list per gift step).
- **Task B:** two-column unlock card in Outros; Cinderella Moment variant of the J1 Outro; one-tap "How did that land?" stored in `resonance_events`.
- **Task C:** unchanged.

---

## 11. Holes in "living proof" and "feel first" (Sasha, 2026-10-29 15:02: «непонятно как задизайнить этот опыт, зачем это игроку… много дыр»)

| Hole | Working hypothesis (to test, not decided) |
|---|---|
| Why would the player want a comparison? | They don't. They want an answer to their real question. The comparison is an optional "see the difference" toggle after the answer, never a gate. Main proof role moves to marketing (side-by-side clips, the benchmark), not the core flow. |
| What question do they bring? | Offer three questions written from their own top talent ("you can now ask…"), so the first answer is about them by design. |
| "Feel first" without a test screen | The feeling comes from the first answer naming their talent in their words. The explanation ("models are alike; the difference is how well it knows you") appears only after, as one line. |
| Small vs frontier claim | Not shown to players until our own mini-benchmark confirms it (landscape doc §5, §6). |
| What screens change | Screens 2–3 likely merge: Ask → Answer (with optional "compare" toggle). Pending Sasha's roast. |

## 12. The AI is a character in the game (Sasha, 2026-10-29 15:12)

> «получается что этот ИИ - персонаж в игре? Значит он может и ведет всю коммуникацию? И сам сообщает - теперь я могу то, это.»

**Working stance (Evolver):** yes, the player's AI is the voice of the game, not a feature inside it (known pattern: Ghost in Destiny, Navi in Zelda, Cortana in Halo). It speaks in first person at the key beats: welcome, Outros, the double unlock ("Now I can… · Ask me…"), the return greeting, and the Cinderella Moment, where it speaks for the first time in its settled form. Before top talent is found it speaks plainly and briefly (unformed); after, in a voice shaped by the player's archetype.
**Boundary:** it is the voice, the world stays visual. Maps, infographics, houses and screens remain the structure, so the game never collapses into one chat window. It only announces real unlocks (fidelity rule).
