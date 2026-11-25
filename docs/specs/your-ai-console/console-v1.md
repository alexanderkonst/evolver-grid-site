# Your AI Console v1: the Phoenix chain

Status: spec v1.1 after roast, 2026-11-25 13:45 MST (Hark). Build waits on his yes and on WP1 (#472) merging.
Canon: Sasha 2026-11-24 21:48 (AI OS = the system prompt that activates AI potential; Console = apps = buttons = results; the chain below). Button law 2026-11-19: the label IS the result the button gives. Your AI SoW `docs/specs/your-ai-instrument/sow.md` (D3: never «Take your AI» outward, Hark-like interface inside the game). Navigation instrument `docs/specs/navigation-instrument/architecture.md` (air octahedron = Your AI: chat, installed apps, what it knows of you).

## TLDR
Five buttons, one chain. Each label names the result. Each button reads the player's profile plus the result of the step before, runs one prompt on top of AI OS v6.0, shows the result as a card, and hands it to the next button. Button 5 feeds button 1, so the chain is a loop: every turn the goal comes back sharper.

## The chain

| # | Label (= result) EN / RU | In | Prompt on top of AI OS | Out (card) | Hands to next |
|---|---|---|---|---|---|
| 1 | **Your goal, clear and grounded** / Твоя цель, ясная и обоснованная | Profile (top talent, mission if set, what Your AI knows), last conversation turns; on a second lap, button 5's survivor | NEW `GOAL_SYNTHESIS`: name the one current goal in one sentence; three reasons grounded in this player's profile; what it is not | `goal`, `why[3]`, `notThis` | `goal` + `why` |
| 2 | **The case for your goal, with its risks** / Кейс за твою цель и её риски | Card 1 | NEW `CASE_AND_RISKS`: strongest honest case for the goal; top 3 risks; 3 likely mistakes this player would make, each with the sign to watch | `case`, `risks[3]`, `mistakes[3]` | card 1 + card 2 |
| 3 | **Your goal, version 2** / Твоя цель, версия 2 | Cards 1–2 | NEW `NEXT_VERSION`: rewrite the goal so it keeps the case and answers each risk and mistake; one sentence plus three moves | `goalV2`, `moves[3]`, `whatChanged` | card 3 |
| 4 | **What is weak in your goal, and how to fix it** / Что слабо в твоей цели и как это исправить | Card 3 | REUSE `ROAST THE RESULT` + `ANOTHER ROUND` content from `/ai-os` (imported from the suite data, never copied) | `weak[]`, `fixes[]`, `thirteenth` (the one-line centre) | card 3 + card 4 |
| 5 | **What remains after the Phoenix burns** / Что остаётся после сгорания Феникса | Cards 3–4 | REUSE `ITERATE_STRATEGY_CRUCIBLE_V2_PROMPT` (`src/prompts/user/iterateStrategyCruciblePrompt.ts`): crystallize, kill realistically, extract what survived, next move in one sentence; framed as post-mortem | `survived`, `burned`, `nextMove` | `survived` + `nextMove` → button 1 (next lap) |

Three new prompts (1–3), two reused (4–5). New prompts live in `src/prompts/user/consolePhoenixPrompts.ts`. The reused prompts are imported unchanged; a thin wrapper after them asks for the card fields as JSON, because they were written for free-form answers. Each card also keeps the model's full text (shown under «Read all»), so nothing of the 27-perspective depth is lost to the card.

### Guards (from the roast)
- **No goal, no invention.** If the profile and conversation hold no goal, button 1 does not synthesize one; it asks the player one question («What do you want to make real in the next 90 days?») in the conversation, and the card waits for the answer.
- **Profile source:** the same context Your AI conversation already builds (`buildProfilePrompt` / `buildRawSignal` in `yourAiDialogue.ts`). No new reads.
- **Language:** every prompt ends with «Answer in <player locale>» (en/es/ru).
- **Laps:** chain history keeps the last 3 laps; older laps fold into one line each.

## How it runs
- **Prompt assembly:** `AI_OS_PROMPT` (`src/modules/familiar/aiOsSource.ts`, v6.0) + button prompt + player context + previous cards as JSON.
- **Model call (decision for Sasha):** the only no-deploy path is `library-advisor`, and the roast found three faults in it: its system line is «a helpful guide for spiritual and wellness practices», so AI OS rides as user text and loses weight; it accepts guests with no sign-in; it has no daily cap or size limit, so a long chain is open spend. Recommended: one new edge function `your-ai-console` (signed-in only, AI OS v6.0 as the system prompt, the same per-player daily cap as `mini-training-chat`, cheapest gateway model). That is one Lovable deploy, so it needs his yes. Fallback if he says no: `library-advisor` behind the client gate, with the cap enforced client-side (weak).
- **Chain state:** `src/lib/console/phoenixChain.ts`, `{ lap, cards: {1..5}, laps: last 3, updatedAt }`, kept in the player's existing game save (no migration). Known limit: if the save is client-only, results do not follow the player to another device; a server table is a later step with its own yes.
- **Order:** button N is live when card N−1 exists; before that it shows in §25.5 form: «Opens when you have your goal. Inside: the case for it, with its risks.» Any button can be re-run; re-running N clears cards after N.
- **Card actions:** copy, re-run, «Next: <label of N+1>». Nothing sends anything outward.

## What it builds on, not duplicates
- `/ai-os` stays the library (the proto-Console). Buttons 4–5 import its prompts. `AiOsPage.tsx` (3,754 lines) is not edited in v1; if the ROAST prompts sit inline there, the job first moves those two into `src/prompts/` and imports them back, text unchanged.
- Ask AI buttons in mini-trainings (`mirrorAi.ts`, `knowsYou*`, edge function `mini-training-chat`) stay as they are: they teach the player to use an AI. The Console is where the player's own AI does the work. No shared code changes.
- In the instrument: the Console is a tab of the air face, beside conversation (navigation architecture, bodies table: Air = Your AI, chat, installed apps). It touches only `faces/AirFace` content and new files; it never edits WP1–WP8 owned files (`GameShellV2.tsx`, `state.ts`, `faces.ts`, ritual, other faces). It starts only after WP1 (#472) merges, so it never edits the instrument files while that job runs.

## Out of scope
Paid apps and billing, model switch or benchmark, any Lovable deploy, title, intro, reveal, entry, themes, quiz, the `oracle` place, sending results anywhere outside the game.

## Definition of done
| # | Check | Evidence |
|---|---|---|
| 1 | Five buttons, labels exactly as above in en/es/ru; a stranger reading each label can say what they will get | screenshot |
| 2 | Each button's prompt = AI_OS_PROMPT + its prompt + profile + previous cards (unit test on assembly) | test |
| 3 | Output parsed to its card shape; malformed output shows one retry line, never raw JSON | test |
| 4 | Button N locked until card N−1 exists, with the «Opens when… Inside…» line | test + screenshot |
| 5 | Button 5 → button 1 starts lap 2 with the survivor as input | test |
| 6 | Prompts 4–5 imported from `/ai-os` suite data and `@/prompts`, no copied text | grep in review |
| 7 | No change to WP1–WP8 owned files, edge functions, migrations, entry, reveal, themes | diff review |
| 8 | Works at 390 px, axe zero serious | Playwright |
| 9 | Empty profile: button 1 asks the one question, invents nothing | test |
| 10 | Signed-out player cannot call the model; daily cap returns a calm line | test |
| 11 | Live run of the full lap on one test profile (5 model calls) | only after Sasha's yes to spend |

## Open for Sasha
- One Lovable deploy for `your-ai-console` (recommended) or the weak no-deploy fallback.
- Labels: his words win (the label is the result).

## Roast log (v1 → v1.1)
1. Model path was unsafe and weak (guest access, no cap, wrong system line) → decision above.
2. Reused prompts demand free-form roasting, the cards demanded JSON → wrapper + «Read all».
3. Button 1 would invent a goal for a new player → asks one question instead.
4. Label 4 named a method, not a result → «What is weak in your goal, and how to fix it».
5. Spec edited `/ai-os` and #458 files while WP1 owns them → no `/ai-os` edit, start after #472.
6. localStorage loses results → game save, device limit named.
7. Language of answers and lap growth were unset → locale line, last 3 laps.
