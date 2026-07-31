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

### 7. Combined batch: profile linking, one-row passages, saved-read email (2026-07-30)

```
Please apply these changes from the repo, exactly as written — all
additive, nothing else touched:

1. Run migration supabase/migrations/20260730220000_quiz_user_link.sql
   (adds nullable `user_id` + index to `transition_quiz_results`, plus a
   select policy `transition_quiz_results_select_own` allowing
   auth.uid() = user_id reads).

2. Redeploy `save-quiz-result` from its current repo source. This single
   redeploy carries two additive changes: the insert path optionally
   accepts and writes `user_id`, and the update branch (id present, no
   stage) now also accepts buying_frame, means, direction_call_shown,
   and route_shown — validated against the existing whitelists, updating
   only the fields sent — so one person's passage stays one row.

3. Redeploy `get-quiz-result` (now also returns an `owned` boolean —
   whether the row already has a user_id — never the raw user_id).

4. Deploy `claim-quiz-result` (new function, verify_jwt = true in
   config.toml). Auth-gated: lets a logged-in viewer of a quiz permalink
   attach that saved read to their own account if it isn't already linked.

5. Wire outgoing email on the existing `save-quiz-email` function (the
   email server is Lovable-managed): when a row arrives with `source`
   starting with "save_read:", send that address a short branded email
   containing the permalink
   https://findyourtoptalent.com/quiz/r/<id> — the <id> is the part of
   the `source` value after the colon.
   Subject: Your read — Where Are You
   Body: one line ("Here is your saved read, yours to keep:") plus the
   link. Any other `source` value: no send (the seven-chapters map email
   is a separate future ask). Collection keeps working as now either way.

Nothing else needs to change.
```

**Verifying it worked:**
- Take the quiz on findyourtoptalent.com/quiz down a ripe path while
  logged in: `transition_quiz_results` shows ONE row for the pass with
  buying_frame and means filled in, user_id set; the JOURNEY pane shows
  Step 0 as done with your chapter on the mini arc.
- Tap "Save my read" with a real address: the permalink email arrives
  within a minute, and the row appears in `quiz_email_signups`.
- Open a logged-out read's permalink while logged in: the "Keep this
  read in my profile" line appears; clicking it links the row.

---

*Previously pending, now deployed (2026-07-30): batch #3 — Sergey Jay
Makarov's testimonial quote restored (Sandra's untouched), `means` column
added to `transition_quiz_results`, `save-quiz-result` redeployed with
means support.*

*Previously pending, now deployed (2026-07-29): batch #1 (quiz_email_signups
table, save-quiz-email, quiz-results-export + token) and batch #2
(recognition_delta migration, save-quiz-result redeploy, get-quiz-result),
plus the scaling value added to the uniqueness_category constraint.*
