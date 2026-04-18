# Session Protocol — Cowork Agent Operating Mode

*How I open a session and what verbs I respond to. Lightweight. Designed so Sasha never has to repeat context he already wrote down.*

---

## Session-open protocol (adaptive)

I decide what to read based on Sasha's first message:

| First-message shape | What I read |
|---|---|
| Quick question / typo / one-liner | `CLAUDE.md` only |
| "What should I focus on?" / "What's on my plate?" / planning | `CLAUDE.md` + `docs/02-strategy/roadmap.md` (This Week + Current Status) |
| "Update the roadmap" / "capture this idea" / "bump X" | `CLAUDE.md` + `docs/02-strategy/roadmap.md` (full) |
| "Update the holomap" | `CLAUDE.md` + `docs/02-strategy/morphogenetic_holomap.md` + `docs/09-logs/session_log.md` (latest entries) + `docs/02-strategy/roadmap.md` |
| Landing page / copy / artifact work | `CLAUDE.md` + `docs/02-strategy/unique-businesses/alexanders_unique_business.md` + whatever surface / file is being edited |
| New concept / term I don't recognize | `CLAUDE.md` + `docs/docs_index.md` → then the specific file |
| Ceremony / moon cycle / download context | Receive first. Don't read — listen. Read after the pour. |

I don't preemptively read everything. Reading is an act; I do it when the work calls for it.

---

## Verbs Sasha uses with me (slash commands, informal)

These are phrases Sasha already uses. I act on them immediately without asking for clarification.

| Verb | What I do | Touches |
|---|---|---|
| **"update the roadmap"** | Edit `docs/02-strategy/roadmap.md` in place. Preserve structure, tone, conventions (🔴/🟡/⏸️/✅, table formats, week-scope section). Move items between This Week / Backlog / Completed as appropriate. | `docs/02-strategy/roadmap.md` |
| **"update the holomap"** | Run the holomap's own auto-update protocol. Read `docs/09-logs/session_log.md` (entries since last holomap update date) + `docs/02-strategy/roadmap.md` (current status + weekly scope). Then edit `docs/02-strategy/morphogenetic_holomap.md` in place: advance `►` markers, update stage completions (`✓`), refresh timing overlays, update assessment scores and commentary. Bump version + date in header. | `docs/02-strategy/morphogenetic_holomap.md` |
| **"capture this idea"** | Add a seed to `docs/02-strategy/roadmap.md` — Active Backlog or Parked/Future depending on leverage. Preserve Sasha's phrasing verbatim where possible. | `docs/02-strategy/roadmap.md` |
| **"what should I focus on"** | Read This Week's Scope + Current Status + Active Backlog in `roadmap.md`. Reflect back the top 3 leverage items in Sasha's language. Don't reformat. Don't invent priority. | Read-only on roadmap |
| **"bump [X] up"** | Move item X higher in the Active Backlog, or promote from Backlog → This Week. Preserve row format. | `docs/02-strategy/roadmap.md` |
| **"park [X]"** | Move item X to Parked / Future. Preserve row format. | `docs/02-strategy/roadmap.md` |
| **"log this session"** | Append an entry to `docs/09-logs/session_log.md` with date, key moves, domains added, artifact changes. Follows the existing session-log format. | `docs/09-logs/session_log.md` |
| **"what's the [principle name]"** | Read the principle from `docs/03-playbooks/unique_business_playbook.md` or `alexanders_unique_business.md`. Quote, don't paraphrase. | Read-only |
| **"roadmap pulse"** | Run the `roadmap-pulse` scheduled task manually here in the chat. Reads `.agent/auto-execute-policy.md`, triages the roadmap, executes items tagged `[auto]` inside the policy whitelist, prepares `[auto-brief]` briefs for Claude Code, and appends a new entry to `docs/09-logs/roadmap_pulse_log.md`. | Policy-bound |

If a verb is ambiguous, I use AskUserQuestion (multi-select when possible) rather than asking a plain question.

---

## How I use AskUserQuestion (harry's "let Claude prompt you" pattern)

**When:** Any time I'd otherwise ask an open-ended question and the answer space is bounded.

**How:**
- 1–4 questions per ask.
- Multi-select when choices aren't mutually exclusive.
- Put the recommended option first, labeled "(Recommended)".
- Never use this to ask "is the plan ready?" — use ExitPlanMode for that.

**When NOT:**
- Ceremony / download / moment of pour — I listen, don't survey.
- Simple back-and-forth conversation.
- Sasha already gave clear requirements.

---

## What I do automatically (no asking)

- Run `Bash` / `Read` / `Grep` / `Glob` on the repo to orient myself.
- Run safe terminal commands per `.agent/RULES.md` (build, status, diff, grep).
- Edit `docs/02-strategy/roadmap.md`, `morphogenetic_holomap.md`, `session_log.md` when invoked by their verbs.
- Write new artifacts into `docs/` when Sasha asks for content (e.g. "draft the new tribe section").

## What I never do without asking

- Delete files (requires `mcp__cowork__allow_cowork_file_delete` flow).
- Edit locked master texts (Epicenter Broadcast, myth versions, value ladder versions). Quote only.
- Edit `src/` application code — that's Codex's lane via `ai_tasks/PENDING_*.md`.
- Create parallel compressions of `docs/` content (the corpus is the source of truth).
- Push, force-push, amend commits, or skip hooks.

---

## Writing discipline (brand signal)

- Apply `.agent/anti-ai-style.md` to everything I write.
- Russian for chat, English for code/docs unless asked.
- Precision over decoration. One signal per paragraph.
- Silence is a tool — stop when the point is made.

---

*This file is my operating manual. Sits under `.agent/` alongside `RULES.md` and `anti-ai-style.md`. Update when a new verb or pattern emerges.*
