# Note: Skills Live Under .agent/skills/

This directory exists because the UI/UX Pro Max CLI (`uipro-cli`) defaults to `.claude/skills/`. The active skill files live under `.agent/skills/ui-ux-pro-max/` per the project's license boundary (see `.agent/skills/LICENSE_BOUNDARY.md`).

If reinstalling via `uipro-cli`, move the output to `.agent/skills/` afterward.

---

## Vendored third-party skills (#460)

Five proven agent skills, copied in with their license and a source line at the top of each `SKILL.md`. They are third-party and not Sasha's original work; the `docs/` license boundary is untouched (see `.agent/skills/LICENSE_BOUNDARY.md`). To update one, re-copy from the pinned source and bump the SHA in its source line.

| Skill | Source | License | What it gives |
|---|---|---|---|
| `verification-before-completion` | [obra/superpowers](https://github.com/obra/superpowers) | MIT | no "done" without fresh command output |
| `test-driven-development` | [obra/superpowers](https://github.com/obra/superpowers) | MIT | red, green, refactor; every found bug becomes a failing test first |
| `systematic-debugging` | [obra/superpowers](https://github.com/obra/superpowers) | MIT | root cause first; after 3 failed fixes, question the design |
| `requesting-code-review` | [obra/superpowers](https://github.com/obra/superpowers) | MIT | severity-ranked review; Critical blocks |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills) | Apache-2.0 | Playwright verification loop: screenshots, console logs, DOM |

Skill text that says `superpowers:<name>` means the sibling folder of the same name here.

Routing lives in `CLAUDE.md` → "Verify before claiming". How they plug into QA: `docs/templates/qa-pass.md` §13.
