# Your AI Console v1: the Phoenix chain

Status: spec v1 for Sasha, 2026-11-25 13:40 MST (Hark). Build waits on his yes.
Canon: Sasha 2026-11-24 21:48 (AI OS = the system prompt that activates AI potential; Console = apps = buttons = results; the chain below). Button law 2026-11-19: the label IS the result the button gives. Your AI SoW `docs/specs/your-ai-instrument/sow.md` (D3: never «Take your AI» outward, Hark-like interface inside the game). Navigation instrument `docs/specs/navigation-instrument/architecture.md` (air octahedron = Your AI: chat, installed apps, what it knows of you).

## TLDR
Five buttons, one chain. Each label names the result. Each button reads the player's profile plus the result of the step before, runs one prompt on top of AI OS v6.0, shows the result as a card, and hands it to the next button. Button 5 feeds button 1, so the chain is a loop: every turn the goal comes back sharper.

## The chain

| # | Label (= result) EN / RU | In | Prompt on top of AI OS | Out (card) | Hands to next |
|---|---|---|---|---|---|
| 1 | **Your goal, clear and grounded** / Твоя цель, ясная и обоснованная | Profile (top talent, mission if set, what Your AI knows), last conversation turns; on a second lap, button 5's survivor | NEW `GOAL_SYNTHESIS`: name the one current goal in one sentence; three reasons grounded in this player's profile; what it is not | `goal`, `why[3]`, `notThis` | `goal` + `why` |
| 2 | **The case for your goal, with its risks** / Кейс за твою цель и её риски | Card 1 | NEW `CASE_AND_RISKS`: strongest honest case for the goal; top 3 risks; 3 likely mistakes this player would make, each with the sign to watch | `case`, `risks[3]`, `mistakes[3]` | card 1 + card 2 |
| 3 | **Your goal, version 2** / Твоя цель, версия 2 | Cards 1–2 | NEW `NEXT_VERSION`: rewrite the goal so it keeps the case and answers each risk and mistake; one sentence plus three moves | `goalV2`, `moves[3]`, `whatChanged` | card 3 |
| 4 | **Your goal, seen from 27 perspectives** / Твоя цель глазами 27 перспектив | Card 3 | REUSE `ROAST THE RESULT` + `ANOTHER ROUND` content from `/ai-os` (imported from the suite data, never copied) | `weak[]`, `fixes[]`, `thirteenth` (the one-line centre) | card 3 + card 4 |
| 5 | **What remains after the Phoenix burns** / Что остаётся после сгорания Феникса | Cards 3–4 | REUSE `ITERATE_STRATEGY_CRUCIBLE_V2_PROMPT` (`src/prompts/user/iterateStrategyCruciblePrompt.ts`): crystallize, kill realistically, extract what survived, next move in one sentence; framed as post-mortem | `survived`, `burned`, `nextMove` | `survived` + `nextMove` → button 1 (next lap) |

Three new prompts (1–3), two reused (4–5). New prompts live in `src/prompts/user/consolePhoenixPrompts.ts`. Each ends with a strict output shape (JSON with the fields above) so the card renders and the hand-off is exact.

## How it runs
- **Prompt assembly:** `AI_OS_PROMPT` (`src/modules/familiar/aiOsSource.ts`, v6.0) + button prompt + player context + previous cards as JSON.
- **Model call:** existing edge function `library-advisor` via `askYourAi` path (`yourAiDialogue.ts`), cheapest gateway model already set there (`gemini-3.1-flash-lite`). No new edge function, no migration, no deploy.
- **Chain state:** `src/lib/console/phoenixChain.ts`, client-side per player (same save as instrument state, `src/lib/instrument/state.ts` once WP1 lands; localStorage until then): `{ lap, cards: {1..5}, updatedAt }`.
- **Order:** button N is live when card N−1 exists; before that it shows in §25.5 form: «Opens when you have your goal. Inside: the case for it, with its risks.» Any button can be re-run; re-running N clears cards after N.
- **Card actions:** copy, re-run, «Next: <label of N+1>». Nothing sends anything outward.

## What it builds on, not duplicates
- `/ai-os` stays the library (the proto-Console). Buttons 4–5 import its prompts; the chain is a new suite there too, so one source.
- Ask AI buttons in mini-trainings (`mirrorAi.ts`, `knowsYou*`, edge function `mini-training-chat`) stay as they are: they teach the player to use an AI. The Console is where the player's own AI does the work. No shared code changes.
- In the instrument: the Console is a tab of the air face, beside conversation (navigation architecture, bodies table: Air = Your AI, chat, installed apps). It touches only `faces/AirFace` content and new files; it never edits WP1–WP8 owned files (`GameShellV2.tsx`, `state.ts`, `faces.ts`, ritual, other faces). Until WP1 lands, it renders inside the existing `YourAiInstrument` from PR #458.

## Out of scope
Paid apps and billing, model switch or benchmark, any Lovable deploy, title, intro, reveal, entry, themes, quiz, the `oracle` place, sending results anywhere outside the game.

## Definition of done
| # | Check | Evidence |
|---|---|---|
| 1 | Five buttons, labels exactly as above in en/es/ru | screenshot |
| 2 | Each button's prompt = AI_OS_PROMPT + its prompt + profile + previous cards (unit test on assembly) | test |
| 3 | Output parsed to its card shape; malformed output shows one retry line, never raw JSON | test |
| 4 | Button N locked until card N−1 exists, with the «Opens when… Inside…» line | test + screenshot |
| 5 | Button 5 → button 1 starts lap 2 with the survivor as input | test |
| 6 | Prompts 4–5 imported from `/ai-os` suite data and `@/prompts`, no copied text | grep in review |
| 7 | No change to WP1–WP8 owned files, edge functions, migrations, entry, reveal, themes | diff review |
| 8 | Works at 390 px, axe zero serious | Playwright |
| 9 | Live run of the full lap on one test profile (5 model calls) | only after Sasha's yes to spend |

## Open for Sasha
- Labels: keep these five, or rename (the label is the result, so his words win).
