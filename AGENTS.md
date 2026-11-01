# AGENTS.md — the starting brief for any agent in this repo

For Claude Code, Codex, Gemini, or any agent that opens this repo. Read this first. It points into `docs/`; it does not re-summarise it. `CLAUDE.md` points here and adds only Claude-specific contract.

Owner: Alexander (Sasha) Konstantinov. Orchestrator: Hark. One issue = one PR = one Definition of Done.

## The product in 5 lines

1. **The Game of Being You** (findyourtoptalent.com): the whole site is one game. Every product, page and funnel is a place in it.
2. One light in, your spectrum out: the player finds their top talent, then walks mission → offer → first sale → tribe → village.
3. Three scales: **Your House** (character, grows by passing a linear quest sequence), **Your Village** (a real community, San Pancho is Village #1), **the World map** (real villages, ambassadors, a stall per player).
4. Core principle: every mechanic mirrors something real (a person, place, trade, skill, payment). Digital is the map; life is the territory.
5. Product UI is English; `/es` and `/ru` get their language as page text. One word per thing: the player's gift is "top talent".

## Repo map

| Path | What lives there |
|---|---|
| `src/App.tsx` | Every route. The game lives under `/game/*`; the title screen is `/`. |
| `src/pages/`, `src/components/`, `src/modules/`, `src/layouts/` | Pages, UI, feature modules. |
| `src/lib/`, `src/hooks/`, `src/contexts/`, `src/integrations/` | Logic, hooks, state, Supabase client. |
| `src/locales/`, `src/i18n/` | Translations. |
| `src/prompts/` | Prompt source of truth (`user/`, `extraction/`). |
| `supabase/` | `functions/` (edge functions), `migrations/`, `config.toml`. |
| `api/` | Edge functions (Gemini 2.5 Flash). |
| `docs/` | The corpus (CC BY-NC-SA 4.0). Start at `docs/docs_index.md`. |
| `docs/ops/` | Operating numbers, e.g. `swarm_weekly.md`. |
| `.agent/` | Rules and skills (MIT). `RULES.md`, `session-protocol.md`, `anti-ai-style.md`. `pending/` stages workflow files (see Swarm below). |
| `scripts/` | Build, drift-check and swarm scripts (`*.test.mjs` run under vitest). |
| `equilibrium/` | Sibling product. |

Commands: `npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

## Canon docs (read only what the issue names)

- `docs/02-strategy/game_of_being_you.md`, **§20** (the Gift Path: 4 stages, 22 steps) and **§21** (the World layer and daily loop). §21.1 holds Sasha's verbatim verdicts; where an older section or draft disagrees with them, §21.1 wins.
- `docs/specs/cult/cult_spec.md` (the cult-score plan: waves W1…). It predates §21; exclusions below override it.
- `docs/02-strategy/roadmap.md`: the one task tracker. Never create a parallel one.

## Standing exclusions (unless the issue explicitly says otherwise)

- **No DB migrations** (`supabase/migrations/**`) without the issue explicitly scoping one. Auto-merge never merges one.
- **No Lovable**: no Lovable credits, no Lovable-generated or Lovable-managed changes. Anything needing it is a row for Hark's batch, not a run.
- **No "Light a Window" and no window mechanics.** `cult_spec.md` §4 and wave W4 describe one; Sasha dropped the light-at-another's-window idea on 2026-11-01 (`game_of_being_you.md` §21.1). Do not build, restore or reference it in UI.
- The word "organ/organs" is retired in UI and docs. Locked master texts (Epicenter Broadcast, myth, value ladder) are quoted, never paraphrased.
- Never commit secrets or private CRM data (names, amounts) to this public repo. Never print a secret in a log or comment.
- Hark-owned paths (CRM, Offer Ledger, warm-base files) are gitignored symlinks into a private repo. Read them if needed; never write them.
- No paid service added without Sasha's approval.

## Definition of Done conventions

State the DoD as a numbered table (item · evidence · status) in your PR description. For code, "done" means:

1. **390px walk.** For any UI change: walk the affected screen at 390px width and at desktop width, guest and signed-in where both apply, and attach screenshots or a written walk to the PR.
2. **Tests green.** `npm test`, `npm run typecheck`, `npm run lint` pass. Add a test for new logic. Run a targeted test while working, the full suite once at the end.
3. **Routes preserved.** No route in `src/App.tsx` is removed or renamed without a `<Navigate replace>` from the old path. Route tests live in `src/lib/__tests__/*Routes.test.ts`.
4. **Scope held.** Only what the issue names. No drive-by refactors, no new dependencies unless asked.
5. **Docs follow code.** If behaviour changes, update the doc the issue names, not a new one.

## Swarm routing (how work reaches you)

- Label `agent:claude` on an issue runs Claude Code, same as an `@claude` mention. `agent:codex` and `agent:gemini` run only if the repo secret (`OPENAI_API_KEY` / `GEMINI_API_KEY`) exists; otherwise one "secret missing" comment is posted and nothing runs.
- **Second key.** A PR that touches `supabase/` or non-test `src/` gets an independent review against the issue's DoD (Claude in review mode; Codex too when its secret exists). Auto-merge needs green CI and `SECOND-KEY: APPROVE` on the current head commit. Red CI or "changes requested" labels the PR `needs-hark`; do not remove that label yourself.
- Details, install steps and the weekly numbers: `.agent/RULES.md` → "Swarm routing"; `docs/ops/swarm_weekly.md`.
- If a task is already assigned to another agent, don't duplicate it.

## Working style

- English for code and docs. Russian with Sasha in chat. Follow `.agent/anti-ai-style.md` for anything you write.
- If blocked twice on the same step, stop and comment with what you found instead of retrying.
- Start from `docs/docs_index.md` when you need context. No repo-wide scans unless the issue asks.
- Code review only when asked (`@codex review`, `@claude review`, or the second key). Report real defects, no style notes.
- Licence boundary: `.agent/skills/` = MIT; `docs/` = CC BY-NC-SA 4.0. Never mix.

## Codex notes (Plan: ChatGPT Plus, usage is scarce)

- Default model GPT-6.1 Sol, Standard speed; never Fast or Ultrafast (Fast burns 2.5x).
- Routine and bulk work (doc imports, formatting, renames, link fixes, small config): GPT-6 Luna.
- GPT-6 Astra only when the issue says `model:astra`.
- Claude Code is the primary builder; Codex is the fallback and the reviewer.
