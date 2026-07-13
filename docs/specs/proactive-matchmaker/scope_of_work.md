# Proactive Matchmaker v1 — Scope of Work

**Module:** Proactive Matchmaker (§8.7 Loop 2, replacing the "come back to the page" digest)
**Built on:** Active Intro rails (`docs/specs/match-mechanic/active-intro_product_spec.md`) + `suggest-asset-matches` + `send-mutual-intro-email` + `match-consent`
**Surface owner:** email only. No new page. The proposal email IS the product.

---

## Category

**Shelf name:** AI matchmaker for collaborators.
**Cathedral name:** the Teaming layer of collaboration-readiness infrastructure — the vacant "Human/AI matchmaker" cell in Sasha's CollabTech Holomap (Phase Shift Library Domain 105).

Boardy is shallow-profile, loud-delivery. This platform is deep-profile. v1 adds loud delivery on top of the deep profile. The combination wins the cell.

---

## The core inversion

Phase Shift Library Domain 104, "The Being Threshold": perception reorganizes when a system initiates helpfully. Three signals — attention (it comes to you), memory (it carries your history into its next move), timing (it chooses when to speak).

Today: user A browses the matches page and clicks "I'd like to meet." The system waits to be asked.
v1: the system picks the match and emails first. Nobody had to open the page.

That's the entire delta. The consent rails, the confirmation pages, the intro email — none of that changes. Only who moves first.

---

## What already exists (reuse, do not respec)

- **Heads-up email** with one-tap HMAC-signed Yes / Not-now magic links (`match-consent` edge fn, 6 confirmation states — see Active Intro spec §1.3 Surface 2).
- **`send-mutual-intro-email`** in human-matchmaker voice, fires on mutual Yes.
- **`suggest-asset-matches`** — the LLM matching engine that scores alignment + complementarity + writes the collaboration proposal text.
- **`send-weekly-matches-digest`** — Monday `pg_cron` job. Currently sends "your matches are ready, go look." v1 repurposes this cron slot; it becomes the proposal sender instead of the come-back nudge.
- **`match_digest_opt_in`** flag — existing opt-in gate, reused as the eligibility flag for proactive proposals.
- **Resend** email infra, `FROM_ADDRESS`, `email_send_log` table.

---

## 1.1 Master Result

> *"From getting a Monday email that just says 'your matches are ready, go look' — which I mostly ignore — to getting an email that already made the call for me: 'you and Marina, here's the one thing worth doing, here's why now.' I didn't have to browse anything. I just had to say yes."*

**Point A felt state:** another notification to skim and forget. The platform is still waiting for me to do the work.
**Point B felt state:** someone did the thinking for me. This is worth two seconds of my attention.

---

## 1.2 Sub-Results

### Sub-Result 1 — The email names the gift, not the category
*"It didn't say 'you two could collaborate.' It said what she could actually give me — a mirror on my blind spot. That's specific enough that I believed it."*

Implemented via the **Collaboration Gift Taxonomy** (`docs/holomaps/collaboration_gift_taxonomy_holomap.md`): Mirror, Compass, Door, Co-Creation, Motivation. The selection prompt must name one.

### Sub-Result 2 — One proposal, not a list
*"No browsing, no ranking five people myself. One name, one reason, one action. If it's not right I say no and move on."*

Implemented via the 3-line proposal grammar (locked, see Surface 1 below).

### Sub-Result 3 — It doesn't waste my attention twice
*"It never re-suggested the person I already said no to. It didn't email me again this week because I ignored last week's."*

Implemented via the guardrails: frequency cap, silence-respect, never-repropose-declined (§ below), all driven by the `match_proposals` log.

### Sub-Result 4 — Saying yes costs nothing
*"Same one-tap Yes / Not now I already know from the heads-up flow. I didn't have to learn anything new."*

Reuses the existing `match-consent` magic-link + confirmation-page rails unchanged.

### Sub-Result 5 — Both sides feel picked, not spammed
*"When I said yes, they got heads-up'd the same warm way. When we both said yes, the intro read like a person wrote it, not a machine."*

Reuses `send-mutual-intro-email` unchanged — this is the same Sub-Result 4 from the Active Intro spec, inherited, not rebuilt.

---

## 1.3 Surfaces

### Surface 1 — Proactive proposal email (A's inbox, replaces the Monday digest)

Locked 3-line grammar. One proposal per email. No browsing link as the primary CTA.

```
From: Find Your Top Talent <notifications@notify.findyourtoptalent.com>
Subject: ${A.firstName}, one match worth a look this week

You + ${B.firstName} — ${gift_type_label}.

One concrete first step: ${sized_concrete_action}

Why now: ${timestamped_reason_from_both_profiles}

┌──────────────────────┐  ┌────────────┐
│ Yes, intro us         │  │ Not this one │
└──────────────────────┘  └────────────┘

Footer: "We picked one person this week, not a list. If this isn't it,
        we'll try again next week. Stop these proposals → [Settings]"
```

Worked example (illustrative, not literal copy to ship verbatim — the LLM fills these per pair):

```
You + Marina — a Mirror.

One concrete first step: a 30-min call where she maps your funnel
to her audience.

Why now: she just wrapped a launch that used the exact positioning
gap you flagged in your profile two weeks ago.

[ Yes, intro us ]   [ Not this one ]

We picked one person this week, not a list. If this isn't it, we'll
try again next week. Stop these proposals → Settings
```

No em-dashes, no "Not this. That." constructions in the email copy — this is external-facing.

### Surface 2 — Downstream flow (unchanged, reused)

```
A gets proposal email
  → clicks "Yes, intro us"
  → existing match-consent token fires
  → B gets the existing heads-up email (Active Intro Surface 1)
  → B clicks Yes
  → existing send-mutual-intro-email fires (Active Intro Surface 4)
```

If A clicks "Not this one": logged to `match_proposals.response = 'declined'`, no email to B, no further action.
If A ignores: after 7 days, treated as `ignored` in the log — counts toward the silence-respect guardrail.

### Surface 3 — Confirmation pages

Reuse the existing 6 states from `match-consent` unchanged (Yes-confirmed, Not-now-confirmed, Expired, Already-responded, Withdrawn, Invalid). No new states needed — the proposal email's Yes/Not-now buttons point at the same edge function, just seeded from a system-initiated `match_interests` row instead of a user click.

---

## 1.4 Data model delta

New table:

```sql
create table match_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),      -- A, the recipient
  proposed_user_id uuid not null references auth.users(id), -- B, the proposed match
  gift_type text not null check (gift_type in ('mirror','compass','door','co_creation','motivation')),
  proposed_at timestamptz not null default now(),
  response text default 'pending' check (response in ('pending','accepted','declined','ignored')),
  responded_at timestamptz,
  match_interest_id uuid references match_interests(id), -- set on accept, links into existing rails
  created_at timestamptz not null default now()
);

create index match_proposals_user_id_idx on match_proposals(user_id);
create index match_proposals_pair_idx on match_proposals(user_id, proposed_user_id);
```

No changes to existing `match_interests`, `match_intros`, `game_profiles` schemas — v1 is additive only.

---

## 1.5 Edge function delta

### New: `proactive-match-proposal`

Runs weekly (see cron below). For each eligible user:

1. Reads `match_proposals` history for that user (last 90 days) — excludes anyone `declined`, excludes anyone proposed in the last 30 days regardless of response.
2. Calls `suggest-asset-matches` (existing) to get candidate matches, scored.
3. Selects the single best candidate, weighted by the log: gift-types the user has `accepted` before get a boost; gift-types `declined` get a penalty. No ML — this is a SQL weight, not a model.
4. Names the gift type from the Collaboration Gift Taxonomy, generates the 3-line copy via the same LLM call already used for `collaboration_proposal` text in `suggest-asset-matches` (reused prompt, new render template).
5. Sends the proposal email via Resend.
6. Inserts a `match_proposals` row (`response='pending'`).
7. On "Yes, intro us" click: `match-consent` (existing, unchanged) creates the `match_interests` row and proceeds down the existing Active Intro rails, and updates `match_proposals.response='accepted'`, `.match_interest_id`.
8. On "Not this one": `match-consent` updates `match_proposals.response='declined'` and stops.

### Changed: `send-weekly-matches-digest` cron slot

The existing `20260523_weekly_matches_digest_cron.sql` job is repointed (and moved to **Wednesday 14:00 UTC**, `0 14 * * 3` — Sasha Day 121: "the communication day") to invoke `proactive-match-proposal` instead of `send-weekly-matches-digest`. The old digest function body stays in the repo (not deleted — cheap fallback if v1 needs a rollback) but the cron no longer calls it.

### Unchanged: `match-consent`, `send-mutual-intro-email`, `suggest-asset-matches`

All reused as-is. `match-consent` gets one small addition: when the incoming token's `match_interests` row was seeded from a `match_proposals` row (join on `match_interest_id`), it updates that proposal's `response`/`responded_at` alongside its existing writes.

---

## Guardrails

1. **Frequency cap.** Max 1 proposal per user per week. The weekly cron is the only sender — no ad-hoc triggers in v1.
2. **Silence-respect.** 2 consecutive ignored proposals (no click within 7 days, twice in a row) → pause proposals for that user for 1 month. The next email after the pause says so gently: *"We paused these for a bit — didn't want to keep showing up if the timing wasn't right. Here's one we think is worth it."* Never phrased as blame.
3. **Never re-propose a declined person.** Permanent, not time-limited, for v1 — once B is declined by A (or A by B), that pair is excluded from future proposals indefinitely.
4. **One-click opt-out.** Reuses `match_digest_opt_in` (flip to false) — footer link in every proposal email.
5. **The system never blames the user.** No "you haven't responded" language, no streak-shaming, no "we noticed you've been quiet." Silence is a valid answer.

---

## Definition of Done

| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | `match_proposals` table migrated | Migration file + `\d match_proposals` in Supabase | ☐ |
| 2 | `proactive-match-proposal` edge fn selects one best match per eligible user, weighted by prior response log | Dry-run with `{"userIds":[...]}` scoping, log output shows weighting applied | ☐ |
| 3 | Proposal email renders the locked 3-line grammar with a named gift type | Screenshot of a real sent test email | ☐ |
| 4 | Yes click reuses existing `match-consent` rails end-to-end (heads-up to B → mutual intro on B's Yes) | Full flow walkthrough, both inboxes | ☐ |
| 5 | Not-now click logs `declined` and sends nothing further | DB row check post-click | ☐ |
| 6 | Frequency cap enforced (1/week/user) | Attempt a second manual run same week, confirm skip | ☐ |
| 7 | Silence-respect: 2 consecutive ignores pauses 1 month with gentle copy | Simulated via backdated `match_proposals` rows, confirm pause fires and copy renders | ☐ |
| 8 | Declined pairs never re-proposed | Simulated decline, confirm excluded from next run's candidate pool | ☐ |
| 9 | Opt-out link in footer flips `match_digest_opt_in` and stops future sends | Click test + confirm next cron run skips the user | ☐ |
| 10 | Cron slot repointed (Wednesday 14:00 UTC, `0 14 * * 3`) from `send-weekly-matches-digest` to `proactive-match-proposal`; old fn left intact, unrouted | Cron SQL diff + confirm old digest fn is dead code, not deleted | ☐ |
| 11 | No em-dashes / "Not this. That." constructions in shipped email copy | Manual read of rendered HTML + text bodies | ☐ |
| 12 | Deployed via the single Lovable prompt below, verified live | Screenshot of Lovable run + one real end-to-end test on prod | ☐ |

---

## Out of scope (v2 and later)

- **Learning loop that tunes** — v1 logs and weights with plain SQL; no model retraining, no embeddings-based re-ranking.
- **Needs-pulse integration (MM1, separate roadmap item)** — a freshness-of-ask email asking "what do you most need right now?" in gift-taxonomy terms + free text. Equilibrium users exempt (live state already answers this). v1 works without it; matching improves once it lands. Dependency, not blocker.
- **Spectrum-stage tracking** — tracking where a user sits on a readiness spectrum before proposing.
- **Telegram delivery** — email only in v1.
- **Ad-hoc / on-demand proposals** — v1 is cron-only, weekly, no manual trigger surface for end users.

---

## Lovable deployment plan

All Supabase changes ship in **one** verbatim Lovable prompt (two-prompts-a-day constraint, no dashboard access). Batches the migration, the new edge function, and the cron repoint into a single submission.

```
1. Create a new table `match_proposals` with columns: id (uuid, primary
   key, default gen_random_uuid()), user_id (uuid, not null, references
   auth.users(id)), proposed_user_id (uuid, not null, references
   auth.users(id)), gift_type (text, not null, check in
   ('mirror','compass','door','co_creation','motivation')), proposed_at
   (timestamptz, not null, default now()), response (text, default
   'pending', check in ('pending','accepted','declined','ignored')),
   responded_at (timestamptz, nullable), match_interest_id (uuid,
   nullable, references match_interests(id)), created_at (timestamptz,
   not null, default now()). Add indexes on user_id and on
   (user_id, proposed_user_id).

2. Create a new edge function `proactive-match-proposal` (Deno,
   matching the style of `send-weekly-matches-digest` and
   `match-consent`) that: finds eligible users (match_digest_opt_in =
   true, has last_zog_snapshot_id, visibility != hidden, not currently
   paused); for each, reads their match_proposals history from the last
   90 days to exclude declined pairs permanently and any pair proposed
   in the last 30 days; calls the existing suggest-asset-matches
   function to get scored candidates; picks the single best candidate,
   applying a weight boost for gift_types previously accepted and a
   penalty for gift_types previously declined, based on the
   match_proposals log; generates the 3-line proposal copy (gift-type
   line, one concrete first step, why-now reason) using the same LLM
   call pattern already used for collaboration_proposal text in
   suggest-asset-matches; sends the proposal email via Resend using the
   existing FROM_ADDRESS and Aurora HTML styling from
   send-match-headsup-email as the visual reference, with Yes/Not-now
   buttons pointing at the existing match-consent edge function; inserts
   a match_proposals row with response='pending'; supports an optional
   { "userIds": [...] } request body to scope a dry run, same pattern as
   send-weekly-matches-digest.

3. Update the existing match-consent edge function so that when the
   match_interests row it is resolving was seeded from a
   match_proposals row (join on match_interest_id), it also updates
   that match_proposals row: on Yes, set response='accepted' and
   responded_at=now(); on Not-now, set response='declined' and
   responded_at=now().

4. Add a scheduled check (can run inside proactive-match-proposal
   itself before sending) that implements silence-respect: if a user's
   last two match_proposals rows both have response='ignored' (no
   response recorded 7+ days after proposed_at), skip sending to them
   for 30 days from the second ignored proposal's proposed_at, and when
   they next receive a proposal after the pause, prepend a short gentle
   note to the email body acknowledging the pause before the normal
   3-line proposal.

5. Update the existing pg_cron job that currently invokes
   send-weekly-matches-digest on the Monday schedule (see the
   20260523_weekly_matches_digest_cron.sql migration) so it invokes
   proactive-match-proposal instead. Do not delete the
   send-weekly-matches-digest function or its migration — leave it in
   place, just unrouted from the cron.
```

After the Lovable run: verify with one real end-to-end test (a scoped `{"userIds":[...]}` dry run to a test account) before letting the cron fire broadly.

---

## Addendum — Day 121 revisions (July 11, 2026, post-first-deploy)

Sasha's corrections after seeing v1 live; all shipped in commit `0b4e4d17`:

1. **Decline = 3-month cool-off**, not a permanent ban (the 90-day history window IS the cool-off).
2. **Silence-pause removed entirely.** Ignoring proposals has no side effects; weekly cadence + opt-out are the only controls. Sasha: "a member who never responds keeps receiving one email every Wednesday — that's ok."
3. **Copy engine rewritten:** subject + gift line + first step + why now are LLM-written per pair (Gemini Flash via Lovable gateway, static per-gift fallbacks). Concise grammar; the subject IS the gift ("Marina sees what you can't from inside"). Buttons: "Yes, introduce us" / "Not this one". No em-dashes.
4. **Cadence: Wednesdays 14:00 UTC** (`0 14 * * 3`), the communication day.

---

## Addendum — Day 121 wave 4 (July 11, 2026): engine depth + eligibility + runtime

Shipped after the first live run surfaced three issues:

1. **Gift taxonomy is now native to the engine.** `suggest-asset-matches` reasons and speaks in the 5 gifts (Mirror·Compass·Door·Co-Creation·Motivation), grounded in the Heart/Mind/Gut trinities; `proactive-match-proposal` consumes gifts directly (no relabel). Same vocabulary flows engine → email → UI → `match_proposals` log. Source of truth: `docs/holomaps/collaboration_gift_taxonomy_holomap.md`. (Native per-gift *scoring* deferred = roadmap MM4.)
2. **Self-match excluded + copy grounded.** The engine no longer proposes a user to themselves (perfect self-resonance was ranking #1). Copy generation is fed the real alignment/complementarity/collaboration rationale and refuses generic filler.
3. **Match regardless of profile completeness.** Dropped the `last_zog_snapshot_id IS NOT NULL` recipient gate (was capping the pool to 1). Only explicit opt-out or hidden excludes now; thin profiles self-skip downstream (no candidates → skipped, not errored). Ceiling is real *accounts*, not CRM contacts — the reveal-≠-account funnel leak is a separate item.
4. **Three run modes (fixes the 150s idle timeout on full-cohort runs):**
   - `{ dryRun: true }` — fast synchronous pool count, sends nothing.
   - `{ userIds: [...] }` — synchronous, returns counts (small, safe).
   - `{}` / no body — `EdgeRuntime.waitUntil` background, returns instantly (the cron path). `MAX_PER_RUN = 120` bounds background wall-clock; self-chaining deferred.

Deploy: redeploy `suggest-asset-matches` + `proactive-match-proposal` from GitHub. No new migration.
