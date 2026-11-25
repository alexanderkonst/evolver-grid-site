# Collective: build spec and delegation plan v0.2

Status: draft v0.2, 2026-11-25 (Hark), rewritten after Sasha's roast «да» the same day. Replaces v0.1 (5c9aaed), which built 13 packages for members who don't exist yet.
Sources: [collective_architecture_v0.1.md](../../02-strategy/collective/collective_architecture_v0.1.md) (v0.4) · [collective_in_game_v0.1.md](../../02-strategy/collective/collective_in_game_v0.1.md) (v0.5) · [collective_terms_roadmap.md](../../02-strategy/collective/collective_terms_roadmap.md) · [active-intro_product_spec.md](../match-mechanic/active-intro_product_spec.md) · template [spec-handoff.md](../../templates/spec-handoff.md) · delegation mechanics from [navigation-instrument/sow.md](../navigation-instrument/sow.md).

## TLDR

The Collective already exists de facto: Sasha has touched hundreds of people through sessions, Fire circles, containers, transformational work and the game. v0.2 starts from that truth instead of an empty space.

1. **Circles (public, counters only).** The Collective shows itself as concentric circles of people Sasha's work has reached, each with a count. No names anywhere public.
2. **Core (members-only space).** Founders with a working unique business, granted by Sasha by hand or by his invite link. Inside: Members and Collaborations. Collaborations run on the existing active-intro mechanic, not a new system.
3. **Metric.** Collaborations started and intros made per moon.

Everything else (map place, Market shelf, Experts, Hackathons, AI room, members' landings, money in the game) waits until the core is alive.

## Hard lines (every WP)

- No change to the title screen, intro, the Top Talent / Mission / Assets reveals, entry, themes, Workshop (/ubb), Sasha's method, sessions, /playbook. Exception: the WP2 invite path, only with Sasha's yes (S1).
- Town Hall is not part of this build. The fund is not shown.
- Counters tell the truth: an approximate number is labeled approximate («~80»); a live number comes from the database. Wording is «people reached», never «members», for the outer circles.
- No names, emails or money of real people in code, fixtures or docs. Test data: «member 1», «member 2». The circle lists live in the private ledger.
- en / es / ru strings; 390 px clean; reduced motion; no new dependency.
- New tables have RLS. Migrations and edge deploys go through Lovable (credits): Hark batches them and asks Sasha first.

## The circles (content, from Sasha 2026-11-25)

| Circle | Who | Count | Source |
|---|---|---|---|
| Core | Founders with a working unique business, members of the space | live | `collective_members` |
| Fire circle | Did FMF with Sasha | ~13 (Sasha's estimate, to confirm) | private ledger |
| Uniqueness found on the platform | Players who completed the Top Talent reveal | live | count of completed ZoG snapshots (exact table/column to confirm in WP0) |
| Clients | Past clients of Sasha's sessions | ~20 | private ledger |
| Self-test | Took the test with Sasha without a session | ~80 | private ledger |
| Containers | Founder and mystical containers with Sasha | 33 | private ledger |
| Transformational work | One-on-one or group transformational work | ~100 | private ledger |
| Orbit | Received Sasha's work for free, stayed around | unknown, shown only when estimated | — |

Circles may overlap; the page says «people reached» per circle and never sums them into one inflated total (or, if a total is shown, it is the deduplicated count from the private ledger).

## Wave 0: from Sasha (two things to start, the rest later)

- **S1** Yes to the peer invite path: a peer with Sasha's link enters straight into the Collective and fills a short profile instead of the reveals.
- **S2** First 3 to 5 core members (names stay in the private ledger), and a confirm/correct of the circle counts above.

Later, only when their WP comes: terms line, map place and art, expert roster, hackathon date, AI rungs 4–5.

## Data model (new, RLS on)

- `user_roles`: new value `collective_member` (table exists; confirm enum/shape in WP1).
- `collective_members`: user_id, joined_at, invited_by, short profile: uniqueness_line, offers, seeks, site_url.
- `collective_invites`: code, created_by, used_by, expires_at (30 days), single use.
- `collective_circles` (or config in `src/data/collective.ts`): circle key, label en/es/ru, count, is_approximate, source (`live` | `manual`). Manual counts set by admin only.
- Live counts: one SQL function `collective_public_counts()` (security definer, returns only numbers, callable without sign-in), because RLS stops the browser from counting other players' rows. Counts: players who started the game, completed the Top Talent reveal, completed Mission, core members. Ships in the same Lovable migration batch as WP1 (Sasha 2026-11-25: live numbers from the game's database).
- No revenue or money table. Terms stay a text line; money stays in the private ledger.

## Work packages

### Wave 1: membership
- **WP0 (Hark, no code):** verify in repo: `user_roles` shape, `has_role()`, the admin area, the completed-reveal source for the live count, the entry guard WP2 must pass. Write findings into this file before opening WP1.
- **WP1 Membership.** `collective_member` role, admin toggle to grant/revoke, `collective_members` row with short profile. DoD: admin grants «member 1», the flag reads true, RLS blocks non-members.
- **WP2 Invite link** `/join/collective/:code` (needs S1). Single use, 30 days. New user: sign up → short profile (4 fields) → Collective. Existing player: profile → Collective. DoD: code used twice fails; expired fails; reveals untouched for normal entry.

### Wave 2: the core space
- **WP3 Space** `/game/collective`, members only; non-members see the closed sign «Opens by invitation, when your unique business works.» One welcome screen on first visit (what this is, the one first action: offer a collaboration or ask for an intro); one «why» line in each room header. Link «My business» → existing cockpit (route to confirm in WP0).
- **WP4 Members.** Cards: uniqueness line, offers, seeks, site link, «Ask for intro» button using the active-intro flow. DoD: intro request reaches the other member through the existing active-intro channel.
- **WP5 Collaborations.** Post a collaboration (what, who's needed), join it; matches inside the Collective reuse the match mechanic. No new matching system. DoD: post, join, counter of collaborations started this moon.
- **WP6 Circles page.** Public (outside the members-only space): the circles with counts, live ones from the database, manual ones from admin. DoD: live counts update; approximate ones show «~»; no names.

### Later (open only when the core shows life: first collaborations started)
Market shelf of members' sites · map place in Earth (after the navigation instrument releases `villagePlaces.ts`) · members' landings as their own package · Experts · Hackathons on the moon ring + deeds feed · AI room (rungs 4–5) · terms line · Media · train-the-trainer.

## Metric

Per moon: collaborations started, intros requested, intros accepted. Shown to Sasha in the moon report; not shown to players in v0.2.

## Go-live

WP0 → WP1–WP2 (one Lovable migration batch, Sasha's yes) → WP3–WP6 → publish (free) → Sasha grants first members (S2).

## Delegation

One WP = one @claude issue = one branch = one PR. Hark opens the issue per wave, reviews against spec-handoff §7 and the hard lines, merges on green with DoD evidenced, reports in meaning after each wave. One writer per file per wave. No issue opens before Sasha's yes to start building.

## WP0 findings (Hark, 2026-11-25)

- `public.app_role` enum is `('admin', 'user')`; `has_role` exists in migrations. WP1 adds `collective_member` to the enum.
- Admin area exists at `/admin` (`src/pages/admin/`); WP1 puts the toggle there.
- `/build/cockpit` and `/build/cockpit/dashboard` exist: «My business» links to the dashboard.
- Players directory `/game/collaborate/people` exists; Members room can reuse its card pattern.
- **Blocker for WP4–WP5:** active intro is code on main but not live: it waits for a Lovable SQL apply, an edge function deploy and the `MATCH_CONSENT_SECRET` env var (active-intro_tracker.md). Goes into the same Lovable batch as WP1.
- Still to confirm when WP6 starts: exact columns for "completed Top Talent" and "completed Mission".
