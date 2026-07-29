# Lovable redeploy prompt — pending code changes awaiting deploy

Sasha has no direct Supabase dashboard access; all deploys go through Lovable,
where he gets two prompts a day. This file holds the standing, copy-paste-ready
redeploy request so pending fixes can be batched into a single prompt instead
of burning a slot per function.

**How to use:** copy the numbered prompt below verbatim into Lovable. After a
batch deploys, delete its entry from this file (or move it to a "done" note in
the session log) so the file only ever holds what's still pending.

---

## Pending

*(nothing pending)*

---

*Previously pending, now deployed (2026-07-29): the quiz vNext data layer —
`20260729120000_transition_quiz_vnext_columns.sql` applied and
`save-quiz-result` redeployed, verified with a live POST writing all six
new columns.*

*Previously pending, now deployed (2026-07-28): the three anonymization
redeploys and the prior quiz-rebuild pass (transition_quiz_results table +
divergence columns + `save-quiz-result`).*
