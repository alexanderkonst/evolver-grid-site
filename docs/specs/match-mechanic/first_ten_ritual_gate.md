# §8.6 — The First-Ten Ritual Gate

**Created:** 2026-05-19 (Day 67) — surfaced by Sasha's failure-mode naming:

> *"If this ships with a token-rotation bug, or the heads-up email doesn't land cleanly, the very first trust violation cascades into the fractal lane and poisons it. The threshold ritual must work perfectly the first ten times."*

The matching mechanic is the **threshold ritual** — the moment a stranger first experiences the platform as a real introducer. If the first ten such introductions land cleanly, the fractal lane (Resonant Invites + Viral Vectors per `.agent/moonshot-pre-prompt.md` BIG IDEA #2) ignites naturally. If any of the first ten breaks — a missing email, a 500 error on a button click, a duplicate intro firing — the trust loss is irreversible for that party. They will never re-trust the system, and they will tell others.

This doc is the **pre-production gate**. No real stranger touches the §8.6 surface until every item below has been verified end-to-end with test accounts.

---

## Pre-deploy verification (Sasha runs personally, before exposing to real users)

### Setup

1. Two test accounts on production (`account-A`, `account-B`) — both with completed game_profiles (first_name, archetype/zog_snapshot, last_zog_snapshot_id all set).
2. Real email addresses on both (one Gmail, one Apple Mail or Outlook — to cover two distinct client renderings).
3. Both accounts have `match_headsup_opt_out = false` (default).

### Ritual 1 — Happy path, A → B → Yes

- [ ] account-A goes to `/game/collaborate/matches`
- [ ] First visit: `MatchExplainer` auto-expands. Three sentences read cleanly.
- [ ] Click "Got it" — accordion collapses. Re-open by clicking the header — works.
- [ ] Click "I'd like to meet" on account-B's card
- [ ] Toast appears: *"Heads-up email sent to {firstName}. We'll introduce you both if they say yes."*
- [ ] Card flips to "Heads-up email sent" pill + the "A heads-up email is on its way to..." copy
- [ ] **account-B's inbox**: heads-up email arrives within 60s
  - Subject reads: *"An introduction from {A.firstName} on Find Your Top Talent"*
  - Body is Aurora-styled (parchment, gold, Cormorant headlines)
  - The "Why the engine paired you" block contains real AI-why text (not boilerplate)
  - Two clearly-distinct buttons (gold gradient "Yes, introduce us" / outlined "Not now")
  - Both buttons are clickable on mobile (tap target ≥44px) and desktop
- [ ] account-B clicks "Yes, introduce us"
- [ ] Landing page renders Aurora-styled:
  - Headline: *"Done. The intro is on its way."*
  - Italic line about checking the inbox within the hour
- [ ] **Both inboxes (account-A + account-B)**: bilateral intro email arrives within 60s
  - Subject: *"Meet {A.firstName} and {B.firstName}"*
  - Both addresses are in `To:` (same thread)
  - Body opens with *"Hey {A} and {B},"* — human-matchmaker voice
  - "I thought you two could hit it off" copy is present
  - Bullets (when AI-why splits cleanly) OR single paragraph
  - Closes with *"Leave it up to you guys to make the connection..."*
- [ ] Reply-to-thread works (both can see each other's replies)
- [ ] `match_interests.consent_response = 'consented'`
- [ ] `match_intros` row exists with canonical pair ordering

### Ritual 2 — Decline path, A → B → Not now

- [ ] account-A expresses interest in account-B (fresh)
- [ ] account-B receives heads-up
- [ ] account-B clicks "Not now"
- [ ] Landing page renders: *"Got it. We won't follow up on this one."*
- [ ] `match_interests.consent_response = 'declined'`
- [ ] No `match_intros` row created
- [ ] No bilateral intro email fires
- [ ] On account-A's side: card stays in "interest expressed" state (B's decline is silent to A by design)

### Ritual 3 — Concurrency race

- [ ] Fresh A → B express interest
- [ ] account-B opens both Yes and Not now in two tabs simultaneously
- [ ] account-B clicks both within ~1 second
- [ ] Exactly ONE outcome lands. The other tab shows "You've already responded to this one."
- [ ] No duplicate `match_intros` row
- [ ] No duplicate bilateral intro email

### Ritual 4 — Token security

- [ ] Take a valid magic-link URL from a recent heads-up email
- [ ] Modify the `token` query param (e.g., change one character)
- [ ] Visit modified URL → "This link isn't valid." page renders. No row state changes.

### Ritual 5 — Expired token

- [ ] (Requires test-only: temporarily set token TTL to 1 minute in `matchConsentToken.ts`)
- [ ] Wait 2 minutes after a heads-up was sent
- [ ] Click the Yes button on the now-stale email
- [ ] Renders "This invitation expired."
- [ ] Restore TTL to 30 days.

### Ritual 6 — Withdrawn path

- [ ] account-A expresses interest in account-B
- [ ] account-A goes to `/game/collaborate/connections`, withdraws the interest
- [ ] `match_interests` row deleted
- [ ] account-B clicks Yes on the heads-up email they already received
- [ ] Renders "no longer pursuing" page (with A.firstName visible) OR generic "this invitation is no longer active" if name unavailable

### Ritual 7 — Opt-out

- [ ] account-B goes to `/game/settings?tab=notifications`
- [ ] Toggles "Pause heads-up emails" ON
- [ ] account-A expresses interest in account-B
- [ ] **No email arrives in account-B's inbox**
- [ ] `match_interests` row exists with `headsup_email_status = 'opted_out'`
- [ ] account-A's toast still says "Interest in {B} recorded" (no error surfaced)

### Ritual 8 — No-profile guard

- [ ] Manually clear account-A's `game_profiles.first_name` (SQL)
- [ ] account-A expresses interest in account-B
- [ ] **No email arrives** (the function refuses to send "Someone wants to meet you")
- [ ] `match_interests.headsup_email_status = 'failed'` with explanatory `error_message` in `email_send_log`
- [ ] Restore account-A's first_name.

### Ritual 9 — Already-connected guard

- [ ] account-A and account-B have a completed `match_intros` row (from Ritual 1)
- [ ] Manually delete the corresponding `match_interests` row OR have account-A re-trigger
- [ ] If account-A somehow expresses interest in account-B again (re-invite within 3-lifetime cap)
- [ ] Heads-up function short-circuits with `headsup_email_status = 'already_connected'`
- [ ] No duplicate intro

### Ritual 10 — Intro email retry on failure

- [ ] (Requires test-only: temporarily make send-mutual-intro-email return 500)
- [ ] Run the Yes flow
- [ ] Landing page shows "Your yes is recorded. The intro email is delayed."
- [ ] `email_send_log` has a `mutual_intro_invoke_failed` row
- [ ] Restore intro function
- [ ] Manually re-invoke send-mutual-intro-email with the stored payload — email delivers cleanly

---

## What we are explicitly accepting (not testing in the gate)

- **Token rotation under real leak conditions** — documented procedure in `token_rotation.md`. We're not testing this because (a) the procedure is straightforward env-var update, (b) the failure mode is "user sees 'invalid link', tries again from platform," which is recoverable.
- **Email rendering in obscure clients** (Yahoo, ProtonMail web, Outlook 2007) — we test Gmail (web + mobile) and Apple Mail. Other clients may render somewhat differently but the structure is table-based HTML which is robust.
- **Internationalization** — English only for v1. Plain-text alternate part guarantees content is readable for any locale.

---

## If any ritual fails

**Stop.** Do not open §8.6 to real users until the failing ritual passes. The trust ritual integrity is more important than ship date.

Roll back via:
1. Disable the heads-up function (toggle off in Supabase) → A's "I'd like to meet" click records `match_interests` but no email fires; users see no harm.
2. Investigate via `email_send_log` + edge function logs.
3. Fix, re-deploy, re-run the failing ritual + the ones after it.

---

## Post-deploy: the first ten real heads-ups

Once Sasha has run the 10 rituals above and they pass cleanly:

- Watch `email_send_log` for the first ten `match_headsup` and `mutual_intro` entries.
- Manually inspect each. If any reads off in any way (subject, body, render, copy), pause the feature, fix, resume.
- After ten clean intros, the threshold ritual is established and the system can run autonomously.
