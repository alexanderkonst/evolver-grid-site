# Lovable prompt — Transition Quiz backend (Phase 2)

*One prompt, numbered, copy-paste ready. This is the only Supabase change
Phase 2 needs. Both pieces (the table and the edge function) are already
written in the repo — this prompt just asks Lovable to apply them, since
Sasha cannot reach the Supabase dashboard directly and gets two Lovable
prompts a day.*

---

## Prompt to paste into Lovable

```
Please apply two things from the repo, exactly as written, no changes:

1. Run the migration at
   supabase/migrations/20260728140000_transition_quiz_results.sql
   It creates one new table, `transition_quiz_results`, with row level
   security enabled and no policies (service-role-only access, same
   pattern as the existing `anonymous_genius_results` table). No changes
   to any existing table.

2. Deploy the edge function at
   supabase/functions/save-quiz-result/index.ts
   It's a public, no-auth POST endpoint that inserts one row into
   `transition_quiz_results` per Transition Quiz completion. Set
   verify_jwt = false for this function (already declared in
   supabase/config.toml under [functions.save-quiz-result] — just make
   sure the deployed function config matches that file).

Nothing else needs to change. No existing table, function, or policy
should be touched.
```

---

## What this unlocks

Once deployed, the quiz at `/quiz` will log every completion (including
the "not yet" stage 1-3 completions) to `transition_quiz_results` for the
Ripeness Vector dataset (Phase Shift Technology 123). Until it's deployed,
the quiz still works perfectly for visitors — the logging call is
fire-and-forget from the browser and never blocks or delays the result;
it just silently fails to record until this prompt has been run.

## Verifying it worked

After Lovable confirms, a quick check from any browser console on
`findyourtoptalent.com`:

```js
fetch("https://jypjttotvastdhanwvrx.supabase.co/functions/v1/save-quiz-result", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ stage: 1, not_yet: true }),
}).then(r => r.json()).then(console.log)
```

A `{ ok: true, id: "..." }` response means it's live.
