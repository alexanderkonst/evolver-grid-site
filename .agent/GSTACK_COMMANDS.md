# gstack — Slash Commands Reference

*Installed globally at `~/.claude/skills/gstack/`. Available in Claude Code (Mac app), NOT in Cowork. Namespaced as `/gstack-*`.*

*Source: https://github.com/garrytan/gstack (MIT).*

---

## Why these exist

One agent (Claude Code) plays multiple roles depending on what the work calls for. These slash commands are **mode switches** — each one puts the agent in a specific posture (strategic skeptic, design auditor, release engineer, etc.) with structured forcing questions.

---

## When to use which

### Planning & strategy
- `/gstack-office-hours` — Forcing questions before work starts. Useful when scope is fuzzy.
- `/gstack-plan-ceo-review` — Strategic challenge. "Is this the right thing to build?"
- `/gstack-plan-eng-review` — Architecture lock. "How should this be built?"
- `/gstack-plan-design-review` — Design audit. "Does this match the brand?"
- `/gstack-plan-devex-review` — Developer experience. "Will this be painful to work with?"
- `/gstack-autoplan` — Full review pipeline (all of the above in sequence).

### Building & design
- `/gstack-design-consultation` — Design system dialogue.
- `/gstack-design-shotgun` — Generate multiple mockup variants.
- `/gstack-design-html` — Production HTML from design brief.

### Quality & review
- `/gstack-review` — Code audit.
- `/gstack-investigate` — Root cause debugging.
- `/gstack-design-review` — Design fix pass.
- `/gstack-devex-review` — DX live audit.
- `/gstack-codex` — Second opinion from a different model perspective.

### Testing & deployment
- `/gstack-qa` — Testing + fixes.
- `/gstack-qa-only` — Testing report only (no fixes).
- `/gstack-ship` — PR creation.
- `/gstack-land-and-deploy` — Merge to production.
- `/gstack-canary` — Post-deploy monitoring.
- `/gstack-benchmark` — Performance baseline.

### Utilities
- `/gstack-browse` — Real browser (gstack's own). **We prefer the Claude in Chrome MCP instead** — do not let gstack hijack browsing for this project.
- `/gstack-pair-agent` — Multi-agent collaboration.
- `/gstack-cso` — Security audit (OWASP + STRIDE).
- `/gstack-document-release` — Docs sync.
- `/gstack-retro` — Retrospective.
- `/gstack-learn` — Memory management.
- `/gstack-careful` — Safety warnings mode.
- `/gstack-freeze` / `/gstack-unfreeze` — Edit locks.
- `/gstack-guard` — Full safety mode.

---

## What we did NOT install

- **`gstack-team-init`** — the command that would patch `CLAUDE.md` with a "## gstack" section. We skipped this intentionally. Our `CLAUDE.md` stays pointer-only.
- Gstack's opinion that `/browse` should replace `mcp__claude-in-chrome__*` — we use Chrome MCP for browsing. `/gstack-browse` is available but not default.

---

## Likely high-value commands for Sasha's current work

Landing page rebuild + Karime/Oyi sessions + pipeline follow-ups:

1. **`/gstack-plan-ceo-review`** before any new landing page — does this match the tribe description, is this the right surface to build?
2. **`/gstack-design-review`** after the landing page draft — catches generic AI aesthetic.
3. **`/gstack-review`** before merging code to `main`.
4. **`/gstack-ship`** for structured PRs.
5. **`/gstack-retro`** at end of each sprint or moon cycle.

Ignore the rest until a specific need shows up.

---

## Uninstall

```bash
~/.claude/skills/gstack/uninstall
```

Clean removal — does not edit CLAUDE.md because we never let it.

---

*This file lives under `.agent/` — practice guidance, MIT-side. Not corpus.*
