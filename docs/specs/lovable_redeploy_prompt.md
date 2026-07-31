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

Nothing pending. The quiz stack is fully deployed.

---

*Previously pending, now deployed (2026-07-30 late): batch #7 — user_id
link migration + select-own policy, save-quiz-result (user_id + one-row
update branch), get-quiz-result (owned flag), claim-quiz-result (new,
auth-gated), and the save_read outgoing email on save-quiz-email.
Confirmed live: get-quiz-result returns `owned` in production.*

*Previously pending, now deployed (2026-07-30): batch #3 — Sergey Jay
Makarov's testimonial quote restored (Sandra's untouched), `means` column
added to `transition_quiz_results`, `save-quiz-result` redeployed with
means support.*

*Previously pending, now deployed (2026-07-29): batch #1 (quiz_email_signups
table, save-quiz-email, quiz-results-export + token) and batch #2
(recognition_delta migration, save-quiz-result redeploy, get-quiz-result),
plus the scaling value added to the uniqueness_category constraint.*
