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

### 4. Outgoing email for saved quiz reads (2026-07-30)

```
Please wire outgoing email on the existing `save-quiz-email` edge function
(the email server is Lovable-managed). One change, additive:

When a row arrives with `source` starting with "save_read:", send that
address a short branded email containing the permalink
https://findyourtoptalent.com/quiz/r/<id> — the <id> is the part of the
`source` value after the colon.

Subject: Your read — Where Are You
Body: one line ("Here is your saved read, yours to keep:") plus the link.

When a row arrives with any other `source` value, do not send anything
(the seven-chapters map email is a separate future ask). Email collection
must keep working exactly as it does now in both cases.

Nothing else needs to change. No table, policy, or other function should
be touched.
```

**Verifying it worked:** take the quiz on findyourtoptalent.com/quiz, tap
"Save my read", enter a real address — the permalink email should arrive
within a minute, and the row should still appear in `quiz_email_signups`.

---

### 5. Redeploy `save-quiz-result` — one row per passage (2026-07-30, data hygiene #22)

```
Please redeploy the `save-quiz-result` edge function from its current
source in the repo. No schema change, no new table.

What changed: the update branch (id present, no stage) now also accepts
buying_frame, means, direction_call_shown, and route_shown, validated
against the same whitelists as the rest of the function, updating only
the fields actually sent. This lets the client update one already-inserted
completion row instead of inserting a new additive row for each answer,
so one person's passage through the quiz stays one row.
```

**Verifying it worked:** take the quiz on findyourtoptalent.com/quiz down
a ripe path (answer through Buying Frame and Means) — `transition_quiz_results`
should show one row for that pass with `buying_frame` and `means` both
filled in, not separate rows.

---

*Previously pending, now deployed (2026-07-30): batch #3 — Sergey Jay
Makarov's testimonial quote restored (Sandra's untouched), `means` column
added to `transition_quiz_results`, `save-quiz-result` redeployed with
means support.*

*Previously pending, now deployed (2026-07-29): batch #1 (quiz_email_signups
table, save-quiz-email, quiz-results-export + token) and batch #2
(recognition_delta migration, save-quiz-result redeploy, get-quiz-result),
plus the scaling value added to the uniqueness_category constraint.*
