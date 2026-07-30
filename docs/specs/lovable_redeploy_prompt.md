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

### 1. Quiz email capture + token-gated results export (2026-07-29)

```
Please apply these changes from the repo, exactly as written, no changes:

1. Run the migration at
   supabase/migrations/20260729210000_quiz_email_signups.sql
   It creates one new table, `quiz_email_signups`, with row level
   security enabled and no policies (service-role-only access, same
   pattern as `transition_quiz_results`). No changes to any existing
   table.

2. Deploy the edge function at
   supabase/functions/save-quiz-email/index.ts
   Public, no-auth POST endpoint that inserts one row into
   `quiz_email_signups` per "send me the map" email capture on the
   Transition Quiz. Set verify_jwt = false (already declared in
   supabase/config.toml under [functions.save-quiz-email]).

3. Deploy the edge function at
   supabase/functions/quiz-results-export/index.ts
   Token-gated GET endpoint (same pattern as equilibrium-ai-context) that
   returns { transition_quiz_results, quiz_email_signups } as JSON, newest
   first, optional ?limit= and ?since= query params. No token or wrong
   token = 401. Set verify_jwt = false (already declared in
   supabase/config.toml under [functions.quiz-results-export]).

4. Set a new Supabase Edge Function secret: QUIZ_RESULTS_EXPORT_TOKEN
   (any long random string — this is the token the AI partner sends as
   either an `x-agent-token` header or a `Bearer` Authorization header
   to read the quiz dataset without dashboard access). Please generate
   one, set it, and tell me the value so I can use it going forward.

Nothing else needs to change. No existing table, function, or policy
should be touched.
```

**Optional, not part of this batch:** if Sasha later wants the quiz to
actually *send* the "full map" email (not just collect the address), that
will need a send-template built against the Lovable-managed email server —
a separate future ask. This batch is collection only, no sending.

**Verifying it worked**, from any browser console on `findyourtoptalent.com`:

```js
// email capture
fetch("https://jypjttotvastdhanwvrx.supabase.co/functions/v1/save-quiz-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test@example.com", stage: 2 }),
}).then(r => r.json()).then(console.log)

// results export (replace YOUR_TOKEN with the value from step 4)
fetch("https://jypjttotvastdhanwvrx.supabase.co/functions/v1/quiz-results-export?limit=5", {
  headers: { "x-agent-token": "YOUR_TOKEN" },
}).then(r => r.json()).then(console.log)
```

A `{ ok: true, id: "..." }` response confirms email capture; the export
call should return `{ transition_quiz_results: [...], quiz_email_signups: [...], meta: {...} }`.

### 2. Quiz v2.1: widened call gate, permalink result, recognition delta (2026-07-29)

```
Please apply these changes from the repo, exactly as written, no changes:

1. Run the migration at
   supabase/migrations/20260729220000_quiz_recognition_delta.sql
   It adds one new nullable column, `recognition_delta` (smallint, 1-5),
   to the existing `transition_quiz_results` table. No changes to any
   other table or column.

2. Redeploy the edge function at
   supabase/functions/save-quiz-result/index.ts
   Same public POST endpoint as before, now with one additive branch:
   a POST body of exactly `{ id, recognition_delta }` (no `stage`) runs
   an UPDATE on that row's `recognition_delta` column instead of the
   usual insert. The original insert path is unchanged. Still
   verify_jwt = false (already declared in supabase/config.toml under
   [functions.save-quiz-result]). Also accepts the new
   emerging_work_stage values suspected/delivering (the Q3 rewrite
   replaced "fragments" with "suspected" and added "delivering").

3. Deploy the new edge function at
   supabase/functions/get-quiz-result/index.ts
   Public, no-auth GET endpoint, `?id=<uuid>`. Returns the result-relevant
   columns of one transition_quiz_results row (stage, uniqueness_category,
   emerging_work_stage, clarity_unlock, result_template, etc.) so the new
   /quiz/r/:id permalink page can reconstruct the identical result screen.
   404 if the id doesn't exist. Set verify_jwt = false (already declared
   in supabase/config.toml under [functions.get-quiz-result]).

Nothing else needs to change. No existing table, function, or policy
should be touched.
```

**Verifying it worked**, from any browser console on `findyourtoptalent.com`:

```js
// recognition delta update (replace ID with a real row id)
fetch("https://jypjttotvastdhanwvrx.supabase.co/functions/v1/save-quiz-result", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: "ID", recognition_delta: 4 }),
}).then(r => r.json()).then(console.log)

// permalink lookup (replace ID with the same row id)
fetch("https://jypjttotvastdhanwvrx.supabase.co/functions/v1/get-quiz-result?id=ID")
  .then(r => r.json()).then(console.log)
```

A `{ ok: true }` response confirms the recognition_delta update; the
lookup call should return `{ ok: true, result: { id, stage, ... } }`.

---

*Previously pending, now deployed (2026-07-29): the quiz vNext data layer —
`20260729120000_transition_quiz_vnext_columns.sql` applied and
`save-quiz-result` redeployed, verified with a live POST writing all six
new columns.*

*Previously pending, now deployed (2026-07-28): the three anonymization
redeploys and the prior quiz-rebuild pass (transition_quiz_results table +
divergence columns + `save-quiz-result`).*
