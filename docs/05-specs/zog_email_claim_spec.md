# Email-Based Claim Spec — Anonymous ZoG → Signed-up User

> ⚠️ **SUPERSEDED — April 16, 2026.** This spec is kept for historical reference only. The canonical instruction is now `docs/05-specs/claude_code_handoff_playbook_funnel.md`. The consolidated handoff includes an updated, grounded version of this claim logic that aligns with the actual `ZoneOfGeniusEntry.tsx` flow (AI-Appleseed, not a 6-question quiz).

*For Claude Code (Mac app) to implement. Prepared by Claude in Cowork, April 16, 2026, Day 41.*

*Purpose: when a visitor takes the Zone-of-Genius assessment (Step 1, free gift) before signing up, their result must survive the magic-link signup and attach to their authenticated account.*

---

## The flow we want

```
┌────────────────────────────────────────────────────────────────┐
│  /playbook (public preview)                                    │
│    [ Claim your gift ] ──┐                                     │
└──────────────────────────┼─────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  /auth?claim=true&next=/zone-of-genius/assessment              │
│    → ask email                                                 │
│    → send magic link (but also allow anonymous pass-through)   │
└──────────────────────────┼─────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  /zone-of-genius/assessment (anon-allowed, email captured)     │
│    → user answers 6 questions                                  │
│    → result stored in anonymous_genius_results keyed by email  │
│    → user sees their result immediately                        │
└──────────────────────────┼─────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  User clicks magic link in email (minutes or days later)       │
│    → Supabase Auth signs them in                               │
│    → auth callback scans anonymous_genius_results by email     │
│    → claims the row: move result into zog_snapshots with       │
│      game_profile_id, set claimed_at                           │
│    → redirect to /playbook/discover (full playbook unlocked)   │
└────────────────────────────────────────────────────────────────┘
```

**Key principle: `email` is the sole key that bridges the anonymous and authenticated states.** No cookies, no tokens, no session UUIDs — because Supabase Auth already guarantees the magic-link recipient controls that email.

---

## Database

### New table: `anonymous_genius_results`

```sql
create table public.anonymous_genius_results (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  -- Raw ZoG assessment output — same shape as what goes into zog_snapshots
  result_payload jsonb not null,
  -- Which app/quiz version produced this result (for future migrations)
  assessment_version text not null default 'v1',
  -- Claim tracking
  claimed_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  -- Housekeeping
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A single email can only have one un-claimed pending result.
  -- Older results get overwritten if the same email retakes the quiz before claiming.
  constraint anonymous_genius_results_email_unclaimed_unique
    unique (email, claimed_at)
);

-- Case-insensitive email lookup (emails are canonicalised lowercase on insert)
create index anonymous_genius_results_email_lower_idx
  on public.anonymous_genius_results (lower(email));

-- RLS: nobody reads this table directly from the client
alter table public.anonymous_genius_results enable row level security;
-- No policies = no client-side access. All reads/writes go through edge functions.
```

**Why `email` as key** (not a random session token):

1. The magic-link recipient provably controls the email. That's the whole point of magic-link auth.
2. If the user takes the quiz in browser A, then opens the magic link in browser B — it still works.
3. If the user takes the quiz, closes the tab, comes back a week later via the email — still works.
4. No cookie lifetime, no session clock, no CSRF weirdness.

---

## Edge function: save the result (anonymous write)

`/api/save-anonymous-zog`

```ts
// Request body
{
  email: string;
  result_payload: ZogResultJson;
  assessment_version?: string;  // defaults to 'v1'
}

// Auth: NOT required (this is the anonymous path).
// Rate-limit: 3 writes per email per 10 minutes (prevent abuse).

// Behavior:
// 1. Lowercase-trim the email.
// 2. Validate result_payload shape against a minimal schema.
// 3. Upsert into anonymous_genius_results with WHERE claimed_at IS NULL.
// 4. Fire-and-forget: queue magic-link email with Supabase Auth
//    (signInWithOtp({ email, emailRedirectTo: SITE_URL + '/auth/callback?next=/playbook/discover' })).
// 5. Return { ok: true, result_id } for the client to display immediately.
```

---

## Edge function: claim the result (runs in auth callback)

`/api/claim-anonymous-zog`

```ts
// Triggered by: the /auth/callback route after Supabase Auth sets a session.
// Auth: REQUIRED (session cookie present).

// Behavior:
// 1. Read auth.email() from the session.
// 2. Look up the most recent WHERE email = ? AND claimed_at IS NULL.
// 3. If found:
//      - Create or fetch the user's game_profiles row (getOrCreateGameProfileId).
//      - Insert a new zog_snapshots row with { game_profile_id, payload = result_payload, source = 'anonymous_claim' }.
//      - UPDATE anonymous_genius_results SET claimed_user_id = auth.uid(),
//                                              claimed_at = now()
//        WHERE id = ?
//      - Return { claimed: true, zog_snapshot_id }
// 4. If nothing to claim: return { claimed: false } — benign.
// 5. Redirect the client to /playbook/discover.
```

### Idempotency

If a user accidentally clicks the magic link twice, the second call sees `claimed_at IS NOT NULL` and returns `{ claimed: false }` without double-inserting. Already claimed = nothing to do.

---

## Frontend changes (minimal)

### `PlaybookHero.tsx` — CTA (already done)

Navigates to `/auth?next=/zone-of-genius/assessment&claim=true`.

### `Auth.tsx` — support `claim=true` mode

When `?claim=true` is present:

- Copy changes to: **"Enter your email — your free result stays safe there."**
- Submit calls `signInWithOtp` AND immediately navigates to `next` URL (don't wait for magic link).
- Also stash email in React state / localStorage temporarily so the next page can save it with the result.

### `ZoneOfGeniusEntry` / assessment flow — accept anonymous

If user is not authenticated but has an email from the Auth step:

1. Allow the quiz to run without auth.
2. On completion, POST to `/api/save-anonymous-zog` with `{ email, result_payload }`.
3. Show the result inline.
4. Show a banner: *"Result saved. Check your email — we sent you a link to unlock the full playbook."*

### `Auth callback` page — run the claim

In whatever component handles `/auth/callback?next=...`:

1. After Supabase session established, call `/api/claim-anonymous-zog`.
2. Regardless of `{ claimed: true | false }`, continue to the `next` URL (default `/playbook/discover`).

---

## Edge cases

| Case | Behavior |
|------|----------|
| User takes quiz, never opens email | Result sits in `anonymous_genius_results`. We can re-email them 48h later: "Your result is still here, one click away." |
| User retakes the quiz before claiming | The uniqueness constraint `(email, claimed_at)` means new result OVERWRITES the unclaimed row. Latest result wins. |
| User signs up but never took the quiz | `/api/claim-anonymous-zog` returns `{ claimed: false }`. No error, just nothing to claim. |
| User already has a `zog_snapshots` row | `claim-anonymous-zog` still inserts a new row — history is valuable. The UI shows the latest. |
| Magic link expires | Supabase default is 1 hour. User clicks "resend" which triggers a new `signInWithOtp`. Result in `anonymous_genius_results` is untouched. |
| User takes quiz on phone, opens email on laptop | Works because `email` is the key, not a cookie. |
| Typo in email | Claim never happens. Worst-case user re-takes quiz with correct email. Recommend showing the email back to them on the save-success screen so they can catch typos. |

---

## Security notes

- **RLS disables direct client access to `anonymous_genius_results`.** All reads/writes route through edge functions.
- **Rate-limit save endpoint** to prevent email bombing: max 3 saves per (email, IP) per 10 minutes.
- **Validate result shape** server-side. Don't trust the client to send sane payloads.
- **Email normalization**: always `.toLowerCase().trim()` before insert and lookup.
- **Retention**: optional — add a cron job that deletes unclaimed rows older than 90 days. Probably don't, until it becomes a GDPR ask.

---

## Out of scope for this spec

- A/B testing the CTA copy.
- The Zone-of-Genius quiz UI itself (already exists at `/zone-of-genius/assessment`).
- Full playbook content gating beyond the `RequireAuth` wrap (already in place).

---

## Testing checklist

- [ ] Fresh browser, not logged in → click CTA → land on `/auth?claim=true` → enter email → arrive at assessment.
- [ ] Complete assessment → see result → check that `anonymous_genius_results` has a row with that email + payload.
- [ ] Check inbox → magic link email received.
- [ ] Open magic link → land on `/playbook/discover` → check `zog_snapshots` has a new row tied to the new user.
- [ ] Check `anonymous_genius_results` → row has `claimed_user_id` set, `claimed_at` timestamped.
- [ ] Click magic link twice → second click is a no-op (idempotent).
- [ ] Retake quiz with same email before claiming → new payload replaces old, single row still.
- [ ] Take quiz in Chrome, open email in Safari → claim still succeeds.
- [ ] Sign up fresh without taking quiz → no-op claim, no error.

---

*Spec complete. Backend task for Claude Code Mac app.*
