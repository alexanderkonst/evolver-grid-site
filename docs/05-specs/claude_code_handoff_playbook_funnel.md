# Claude Code Handoff — Playbook Funnel (Landing → Claim → Assessment → Playbook)

*Prepared by Claude in Cowork, April 16, 2026, Day 41. Single source of truth — supersedes `landing_page_seven_steps_spec.md` and `zog_email_claim_spec.md` where they disagree.*

**Who this is for:** Claude Code Mac app, running with full access to `src/` and `supabase/`. Work autonomously per `.agent/RULES.md`. `SafeToAutoRun: true` for all safe commands.

**What this delivers:** one continuous funnel, all in-browser, all inside the app:

```
 /  ── Hero → [Claim your gift] ──►  /auth?claim=true
                                              │
                                              ▼
                                     email captured
                                     magic link sent
                                              │
                                              ▼
                                     /zone-of-genius (anonymous-friendly)
                                              │
                                              ▼
                                     user sees ZoG result instantly
                                     "check your email to save it"
                                              │
                                              ▼  (clicks magic link — minutes or days later)
                                              │
                                     /auth/callback → claim anonymous result
                                              │
                                              ▼
                                     /playbook/discover  (full playbook unlocked)
```

**Already shipped by Cowork (in `src/`):**

- `src/data/playbookSteps.ts` — seven steps, three substeps each, transformational-result labels.
- `src/components/playbook/PlaybookShell.tsx` — top nav with the seven-step progress bar.
- `src/components/playbook/StepCard.tsx` — one-level disclosure per substep.
- `src/components/playbook/PlaybookHero.tsx` — Mux HLS animated circle + "Claim your gift" CTA.
- `src/pages/PlaybookPage.tsx` — composes the three above, reads `:slug` from URL.
- Routes in `src/App.tsx`: `/playbook` redirects to `/playbook/discover`; `/playbook/:slug` is `RequireAuth`-gated.

**Your job:** everything else listed below, end-to-end.

---

## The four tasks

### Task 1 — Rewire `/` (Landing page)

**Goal:** replace the App Store tile grid with the new hero: headline + circular video + "Claim your gift" CTA. Keep testimonials and social proof below.

**File:** `src/pages/MethodologyLandingPage.tsx`

1. Delete the `STEPS` const and the grid-of-tiles JSX. Keep the file but rewrite its body.
2. Import the existing `PlaybookHero` component — it already contains the circular Mux video + the correct CTA copy + magic-link-flow navigation. Do NOT duplicate the video anywhere.
3. Above the hero, add the headline section:

    ```tsx
    <header className="text-center mb-10 px-4">
      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] tracking-[-0.01em] mb-3"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#0a1628" }}
      >
        Unnamed talent{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #8460ea, #29549f)" }}
        >
          →
        </span>{" "}
        thriving biz in flow.
      </h1>
      <p
        className="text-xs sm:text-sm uppercase tracking-[0.28em]"
        style={{ color: "#1a2a44", fontWeight: 500 }}
      >
        In seven steps
      </p>
    </header>
    ```

4. Below `<PlaybookHero />`, KEEP the existing testimonial section + "other projects" link + social proof counter. They still belong here.
5. The current file has a `useJourneyProgression` import that was used by the tile grid. If nothing else in the file uses it after rewrite, drop the import. Don't delete the hook itself — other pages use it.

**Acceptance:** Load `/` as a logged-out user. See the headline, the circular animated video with CTA beneath it, then testimonials, then footer. No tile grid. Clicking the CTA takes you to `/auth?claim=true&next=/zone-of-genius`.

---

### Task 2 — Add magic-link auth with `?claim=true` mode

**Current state:** `src/pages/Auth.tsx` only does email + password. No magic link. No `/auth/callback`. Takes `?redirect=` query param (not `?next=`).

**Goal:** add magic-link as the primary auth method, keep email + password as fallback, and support both `?redirect=` (legacy) and `?next=` (new) — they should be equivalent.

**Changes to `src/pages/Auth.tsx`:**

1. Add a new mode triggered by `?claim=true`:
    - Headline: "Enter your email — your free result stays safe there."
    - Single input (email), single submit button: "Send me the magic link"
    - On submit: `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/auth/callback?next=' + encodeURIComponent(nextPath) } })`
    - After `signInWithOtp` resolves, DO NOT wait for the link click. Immediately stash email in `sessionStorage` under `pending_claim_email` (so the assessment step can associate the result), then navigate to `nextPath` (default `/zone-of-genius`).
    - Show a toast "Magic link sent — check your email."
2. In the normal auth mode, add a "or send me a magic link instead" button that does the same OTP flow but navigates to the normal `next` URL after.
3. Read both `?next=` and `?redirect=` — treat either as the next path. Default: `/playbook/discover`.

**New file: `src/pages/AuthCallback.tsx`**

1. On mount, check `supabase.auth.getSession()`. If session exists, call `/api/claim-anonymous-zog` (see Task 3), then navigate to `next` (from URL query) or `/playbook/discover`.
2. If no session yet, wait up to 5 seconds for Supabase to process the URL hash (magic-link verification). Then retry.
3. If still no session, show an error card with a "Go back to sign in" button pointing at `/auth`.

**Route wiring in `src/App.tsx`:**

```tsx
<Route path="/auth/callback" element={<AuthCallback />} />
```

(Unauthenticated by design — this IS the auth callback.)

**Acceptance:**

- `/auth?claim=true&next=/zone-of-genius` shows the single-email form with the "result stays safe" copy.
- Submitting sends a magic link via Supabase.
- After submit, user is navigated to `/zone-of-genius` with `sessionStorage.pending_claim_email` set.
- Clicking the link in the email lands on `/auth/callback?next=/playbook/discover`, creates a session, runs the claim, redirects to `/playbook/discover`.

---

### Task 3 — Anonymous ZoG persistence + claim on signup

**The core insight:** email is the key that bridges anonymous and authenticated state. Don't invent tokens, cookies, or session UUIDs.

#### 3a — DB migration: `anonymous_genius_results`

New file: `supabase/migrations/<timestamp>_anonymous_genius_results.sql`

```sql
create table public.anonymous_genius_results (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  result_payload jsonb not null,
  assessment_version text not null default 'v1',
  claimed_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index anonymous_genius_results_email_lower_idx
  on public.anonymous_genius_results (lower(email))
  where claimed_at is null;

alter table public.anonymous_genius_results enable row level security;
-- No policies = no direct client access. All I/O goes through edge functions.

create or replace function public.set_updated_at()
  returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger anonymous_genius_results_set_updated_at
  before update on public.anonymous_genius_results
  for each row execute function public.set_updated_at();
```

#### 3b — Edge function: `save-anonymous-zog`

New file: `supabase/functions/save-anonymous-zog/index.ts`

Behavior:

1. POST body: `{ email: string, result_payload: object, assessment_version?: string }`.
2. No auth required.
3. Server-side rate limit: max three saves per (lowercased email) per ten minutes. Use a tiny `rate_limits` table or an in-memory LRU if you prefer — but a table is safer because the function runs stateless.
4. Lowercase-trim the email. Validate that `result_payload` is a non-empty object.
5. Look for an existing `anonymous_genius_results` row with `lower(email) = lower($1) AND claimed_at IS NULL`. If found, UPDATE payload + bump updated_at. Otherwise INSERT.
6. Fire `supabase.auth.admin.generateLink({ type: 'magiclink', email })` OR trigger a plain `signInWithOtp` from the server; either way ensure a magic link is sent to the same email pointing to `/auth/callback?next=/playbook/discover`. (Prefer `generateLink` if the user may already have an account — it works either way.)
7. Return `{ ok: true, result_id }`.

#### 3c — Edge function: `claim-anonymous-zog`

New file: `supabase/functions/claim-anonymous-zog/index.ts`

Behavior:

1. Auth REQUIRED — read the session from the request's `Authorization: Bearer <access_token>` header, or from the cookie if that's how your edge setup reads it. Use `supabase.auth.getUser()` to resolve `auth.uid()` and `auth.email()`.
2. Look up most recent row: `SELECT ... WHERE lower(email) = lower($auth_email) AND claimed_at IS NULL ORDER BY created_at DESC LIMIT 1`.
3. If found:
    - Resolve `game_profile_id` via the same logic as `src/lib/gameProfile.ts::getOrCreateGameProfileId` (server-side equivalent).
    - INSERT into `zog_snapshots` with `{ game_profile_id, payload: result_payload, source: 'anonymous_claim' }`.
    - UPDATE `anonymous_genius_results SET claimed_user_id = auth.uid(), claimed_at = now() WHERE id = ?`.
    - Return `{ claimed: true, zog_snapshot_id }`.
4. If nothing found: return `{ claimed: false }`. Not an error.

#### 3d — Wire the assessment flow to write through the edge function

**Touch two files carefully — don't break the existing flows.**

`src/pages/ZoneOfGeniusEntry.tsx`:

- When user is NOT authenticated but `sessionStorage.pending_claim_email` IS set:
    - After the Appleseed result is computed, POST to `save-anonymous-zog` with `{ email, result_payload: appleseed }`.
    - Show a banner under the result: *"Result saved. Check your email — the magic link unlocks your full playbook."*
    - Do NOT block the user from seeing the result. It's visible regardless.
- When user IS authenticated: existing flow stays exactly as it is. No change.
- When user is NOT authenticated and NO pending email: existing localStorage-only path stays. They can still take the quiz for free, just not save server-side.

`src/pages/AuthCallback.tsx` (from Task 2):

- Already covered — calls `claim-anonymous-zog` after session is live.

#### 3e — Cleanup

- After a successful claim in the callback, `sessionStorage.removeItem('pending_claim_email')`.
- In the assessment save-success banner, show the email back to the user so they catch typos: *"Sent to `alex@example.com`. Wrong email? [Redo](...)"*.

**Acceptance:**

- Anonymous user goes `/` → Claim CTA → `/auth?claim=true` → enters `alex@example.com` → lands on `/zone-of-genius` → completes the assessment → sees result + "check your email" banner.
- Row exists in `anonymous_genius_results` with that email + payload.
- Magic-link email arrives, points to `/auth/callback?next=/playbook/discover`.
- Opening the link in ANY browser creates a session, inserts a row in `zog_snapshots` tied to the new `game_profile_id`, marks the anonymous row `claimed_at = now()`.
- Redirected to `/playbook/discover`, full playbook visible.
- Opening the same link twice: second click is a no-op (`{ claimed: false }`), still redirects.

---

### Task 4 — Playbook UX polish (low-stakes, do last)

The playbook skeleton works. Two small polish items before merge:

1. **`RequireAuth` on the whole playbook tree:** already in place for `/playbook/:slug`. Verify that `/playbook` (no slug) correctly redirects to `/playbook/discover`, and that an unauthenticated user hitting either gets bounced to `/auth?redirect=/playbook/discover`.

2. **Persist substep open-state in URL hash** (optional but nice): when a user opens ONE GOOD STRATEGY on substep 2, update the hash to `#2-strategy`. On mount, read the hash and open the matching section. Lets users share deep links into the playbook.

3. **Top-nav click on completed steps** navigates (`useNavigate`) — already wired in `PlaybookShell.tsx`. Just verify it works by clicking step 1 from step 2's page.

---

## Order of work (strict)

Do them in this order. Each one unblocks the next and leaves the repo in a shippable state if you stop mid-way.

1. Task 3a — migration + empty edge functions (scaffolded only, returning stub responses). Push migration; confirm `anonymous_genius_results` exists in Supabase.
2. Task 2 — Auth.tsx + AuthCallback.tsx + route + `?claim=true` mode. Confirm magic-link flow end-to-end with a test email.
3. Task 3b — flesh out `save-anonymous-zog`. Confirm row lands in the table.
4. Task 3c — flesh out `claim-anonymous-zog`. Confirm claim happens on magic-link click.
5. Task 3d — wire `ZoneOfGeniusEntry.tsx` to call `save-anonymous-zog` when `pending_claim_email` is set.
6. Task 1 — rewrite `MethodologyLandingPage.tsx` hero. Ship.
7. Task 4 — polish.

---

## Don't do

- **Don't change `src/components/playbook/*`** or `src/data/playbookSteps.ts`. Those are final for v1. If you spot a typo, fix it; don't redesign.
- **Don't change the seven transformational-result labels.** They were crafted with Sasha.
- **Don't rewrite the guided assessment** at `/zone-of-genius/assessment`. Only touch `ZoneOfGeniusEntry.tsx` (the AI-pathway entry) to add the claim-email save. The 4-step guided route stays behind auth.
- **Don't build an A/B test harness.** "I don't need a better funnel. I need more people inside it." — The One Rule.
- **Don't add any third-party analytics SDK.** Keep the funnel clean for now. Native Supabase logs are enough for v1.

---

## Questions that are open (ask Sasha, don't guess)

None expected — but if you hit ambiguity, raise it. Don't invent.

---

## Definition of done

- Fresh incognito browser, not logged in.
- Visit `/` → see hero + animated circle + CTA.
- Click "Claim your gift" → `/auth?claim=true&next=/zone-of-genius`.
- Enter `test+claude@example.com` → receive magic-link toast → land on `/zone-of-genius`.
- Complete the AI-Appleseed path → see result + "Check your email" banner.
- Verify: row in `anonymous_genius_results`, magic-link email in inbox.
- Click the email link → `/auth/callback` → auth resolves → `/playbook/discover` loads.
- Verify: row in `zog_snapshots`, anonymous row has `claimed_at` set.
- Open `/playbook/scale` directly — shows step 7 card. Click top-nav step 1 — navigates back to `/playbook/discover`.
- Logout. Try `/playbook/discover` — bounces to `/auth`.

If all ten checks pass: ship it, Day 41 addendum 5 logged in `docs/09-logs/session_log.md`.

---

*End of spec. Drop into Claude Code Mac app. Work autonomously. Ask only when truly blocked.*
