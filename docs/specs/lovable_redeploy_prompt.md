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

### 3. Jay's testimonial fix + quiz Means column (2026-07-30)

```
Please apply these changes from the repo, exactly as written, no changes:

1. Run the migration at
   supabase/migrations/20260731000000_fix_sergey_testimonial_quote.sql
   It updates ONE row in the `testimonials` table: Sergey Jay Makarov's
   `full_quote`, which a March migration had accidentally overwritten
   with a copy of Sandra Otto's quote. Sandra's row is untouched.

2. Run the migration at
   supabase/migrations/20260731001000_quiz_means_column.sql
   It adds one new nullable column, `means` (text, checked to four
   values), to the existing `transition_quiz_results` table. No other
   table or column changes.

3. Redeploy the edge function at
   supabase/functions/save-quiz-result/index.ts
   Same endpoint as before, one additive change: the insert path now
   accepts an optional `means` field (whitelisted to the same four
   values) and writes it to the new column. Everything else unchanged.
   Still verify_jwt = false.

Nothing else needs to change beyond the items above.
4. Wire outgoing email on the `save-quiz-email` edge function (the email
   server is Lovable-managed): when a row arrives with `source` starting
   with "save_read:", send that address a short branded email containing
   the permalink https://findyourtoptalent.com/quiz/r/<id> (the id is the
   part after the colon in `source`). Subject: "Your read — Where Are You".
   Body: one line ("Here is your saved read, yours to keep:") plus the
   link. When a row arrives with any other source, no send yet (the
   seven-chapters map email is a future ask). Keep collection working
   exactly as it does now either way.

Nothing else needs to change.
```

**Verifying it worked**, from any browser console on `findyourtoptalent.com`:

```js
fetch("https://jypjttotvastdhanwvrx.supabase.co/functions/v1/save-quiz-result", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ stage: 5, not_yet: false, uniqueness_category: "integration",
    emerging_work_stage: "felt", buying_frame: "open", means: "yes_if_fit",
    direction_call_shown: true, result_template: "integration" }),
}).then(r => r.json()).then(console.log)
// expect { ok: true, id: "..." } — then delete the test row, and Jay's
// card on /ignite should show his own quote, not Sandra's.
```

---

*Previously pending, now deployed (2026-07-29): batch #1 (quiz_email_signups
table, save-quiz-email, quiz-results-export + token) and batch #2
(recognition_delta migration, save-quiz-result redeploy, get-quiz-result),
plus the scaling value added to the uniqueness_category constraint.*
