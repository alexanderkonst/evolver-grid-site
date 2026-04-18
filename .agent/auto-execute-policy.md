# Auto-Execute Policy — What Scheduled Tasks May Do Without Sasha Present

*This file is the authority on autonomous action from scheduled / unattended runs (the `roadmap-pulse` task and any successor). If this file is missing, scheduled runs must fall back to brief-only mode and output an error.*

*Cowork interactive sessions are governed by `.agent/RULES.md` and `.agent/session-protocol.md`. This file is stricter because Sasha is not watching.*

---

## The five-layer safety model (opt-out / negative-tag model)

**Default is execute.** A roadmap item is autonomously executed when every layer below says yes. The tag layer is a negative check — Sasha marks exceptions, not permissions. The policy whitelist is therefore the primary safety surface and must stay conservative.

1. **Class layer (primary safety).** The work the item implies falls inside the whitelist in §2. If outside the whitelist → brief, don't act. This layer carries the most weight under the opt-out model; keep §2 narrow by default.
2. **Boundary layer.** No file touched is on the blacklist in §3. Any attempt to touch a blacklisted path → abort that item, log "blacklist hit", continue.
3. **Tag layer (negative).** The item does NOT carry `[hold]` in its Notes. `[hold]` = Sasha's explicit "don't touch this autonomously — wait for me." Absence of `[hold]` is permission by default.
4. **Ambiguity layer (strict).** Any decision point, missing file, conflicting requirement, unclear scope, or item language that could be interpreted more than one way → abort that item, log "needs judgment", continue. Under opt-out, the bar for "ambiguous" is lower than it would be under opt-in. When in doubt: brief.
5. **Audit layer.** Every auto-executed action writes an entry to `docs/09-logs/roadmap_pulse_log.md` with date, item ID, files touched, brief diff summary, rationale. Sasha can roll back via pulse log + git.

Risk under this model is bounded to "Sasha forgot to add `[hold]` to an item that should have been held AND that item's implied work happens to fit the whitelist AND isn't ambiguous." The whitelist keeps strategic items out by design; `[hold]` is his brake on the rare edge case.

---

## §1. The `[hold]` tag (negative / opt-out)

Default for every roadmap item: eligible for autonomous execution if it fits §2 and misses §3.

Add `[hold]` anywhere in the Notes column of a roadmap row to **exclude** that item from autonomous execution. The pulse task will treat it as brief-only and surface it with a reason ("held by Sasha").

Examples:

| # | Item | ... | Notes |
|---|---|---|---|
| B17 | Consolidate April 18 synthesis into scaffold_engineering_lab §4 | ... | (no tag — pulse may execute if policy matches) |
| B18 | Rewrite Value Ladder v3.1 | ... | `[hold]` — I'm rethinking the price architecture |
| B19 | Karime Myth + Tribe v1.2 scoring | ... | `[hold]` — waiting on heartbreak rewrite validation |

**When to use `[hold]`:**
- Item is strategic, not operational — even if it looks like docs work, the decision hasn't landed.
- Item is blocked on Sasha's judgment call.
- Item's framing might change soon; execution now would waste the work.
- Anything where Sasha wants to eyeball the output before it lands.

**Revoke:** remove `[hold]`. Retroactive unholding is fine — the item becomes eligible on the next pulse run.

**Bridge to Claude Code — `[brief]` tag.** Add `[brief]` to have the pulse task draft a Claude Code brief into `ai_tasks/PENDING_*.md` for Sasha's one-click dispatch. `[brief]` and `[hold]` can coexist — `[hold] [brief]` means "don't execute, but prepare the brief for me to send manually when I'm ready."

---

## §2. Whitelist — classes of work allowed autonomously

These are the only classes of work that can carry `[auto]`. Any `[auto]` item whose implied work falls outside this list is treated as mis-tagged.

**2.1. Documentation maintenance.** Extending an existing `docs/` file with a new section or update. Consolidating a session finding into the canonical file for that topic (see `feedback_document_creep.md` rule — extend, don't spawn).

**2.2. Session log appends.** Writing a new entry to `docs/09-logs/session_log.md` following the existing format. Never rewriting past entries.

**2.3. Holomap rule-based updates.** Running the `update the holomap` protocol on fresh session log + roadmap data, advancing `►` markers, updating timing overlays, bumping version + date. Synthesis-heavy interpretive changes (new narrative, phase reframing) require Sasha → brief, don't act.

**2.4. Roadmap hygiene.** Triage-rule application: move Waiting On > 7 days to a nudge list; move Active Backlog items stuck > 30 days to a triage list. Structural moves (promote from Backlog → This Week, demote to Parked) require Sasha → brief, don't act.

**2.5. Benchmark lab appends.** New session data added as a new `§3.N` under `docs/09-logs/transcripts/scaffold_engineering_lab.md`. Cross-session synthesis changes (§4) require Sasha → brief, don't act.

**2.6. Corpus drift check.** Running the existing `corpus-drift-check` workflow, reporting drift. If drift requires a fix that is itself a documentation update within 2.1–2.5, execute. Otherwise brief.

**2.7. Claude Code brief drafting.** Writing a new `ai_tasks/PENDING_*.md` brief for a task Sasha has tagged `[auto-brief]` (see §4). The pulse task does not dispatch the brief to Claude Code — it prepares the brief and queues it for Sasha's one-click approval.

---

## §3. Blacklist — never autonomously

Hard stop. Auto-execution must never touch these, even when the item appears to fit the whitelist.

- Any file under `src/`, `supabase/`, `api/`, `/equilibrium/`, or any other application-code path.
- Any file under `specs/` that is flagged as locked (look for `canon-lock` frontmatter or a `🔒` header).
- Any file called `*.env*`, `*credentials*`, `*secret*`, or matching `.*rc` if it holds credentials.
- Master locked texts: Epicenter Broadcast, myth versions, value ladder versions (quote only, never rewrite — see `CLAUDE.md`).
- **Other founders' canvases** — any file matching `docs/02-strategy/unique-businesses/*_unique_business.md` **except `alexanders_unique_business.md`**. This is a consent boundary: Sasha does not spend his AI instance's tokens autonomously on a canvas whose owner has not given explicit consent to AI-assisted work between sessions. Held files right now: `kirills_unique_business.md`, `sandras_unique_business.md`, `alexas_unique_business.md`, `sergeys_unique_business.md`, `oyis_unique_business.md`. Un-holding requires the founder's consent AND an explicit whitelist addition here — a missing `[hold]` tag alone cannot un-hold a canvas.
- **Sasha's own canvas** — `alexanders_unique_business.md` is auto-editable under 2.1 for small appendix additions only. Any structural modification of the applied canvas (v-bump, reworking artifacts, rewriting myth/tribe/pain/promise) still requires Sasha.
- Git operations: no `push`, `force-push`, `amend`, `reset --hard`, `checkout --`, `clean -f`, `branch -D`, hook-skipping. No `gh pr create`, `gh pr merge`, or anything that lands on `main`. Git is Sasha's surface.
- File deletions (require `mcp__cowork__allow_cowork_file_delete` — interactive only).
- Any package management: no `npm install`, `pip install`, dependency changes.

---

## §4. Bridges to Claude Code

Application-code items (those that touch §3 blacklist paths by nature) are never auto-executed by the pulse task — the class layer already filters them out.

When such an item carries `[brief]`, the pulse task prepares a Claude Code brief at `ai_tasks/PENDING_<slug>.md` following the existing Codex / Claude-Code brief format. It does NOT dispatch. Sasha reviews and fires it himself.

Tag interactions under the opt-out model:

- No tag → pulse evaluates against §2 whitelist; if match, executes; otherwise briefs.
- `[hold]` → never executed; surfaces in the pulse log's "held by Sasha" section with the item's reason (Sasha can note reason next to the tag in Notes).
- `[brief]` → pulse drafts a Claude Code brief at `ai_tasks/PENDING_<slug>.md`. If the item also fits the whitelist on the docs side, pulse may execute the docs-side work in addition (e.g., add a note to session_log, update a spec doc that the brief references).
- `[hold] [brief]` → pulse drafts the Claude Code brief but executes nothing else. Sasha ships the brief when ready.

---

## §5. Fail-safes in code

Any run of a scheduled task using this policy must:

- **Read this file first.** If unreadable or malformed, abort the entire run with a stub pulse log entry explaining why.
- **Produce a pulse log entry every time**, even if nothing was executed. Silent runs are forbidden.
- **Log aborts explicitly** with the abort reason ("blacklist hit", "needs judgment", "mis-tagged", "file missing").
- **Never delete the pulse log itself** and never rewrite past entries.

---

## §6. Revision

This file is editable only by Sasha or by an interactive Cowork session with Sasha present. A scheduled run must never edit this policy file.

*Last updated: 2026-04-18. Created alongside `roadmap-pulse` scheduled task v0.1.*
