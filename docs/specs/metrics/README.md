# Metrics

## Return metric v0

**What it is.** The number of players who passed the top-talent reveal and came back to the game on another calendar day. This is the optimisation target until 2026-11-14 (issue #287). It is a count of people, not of visits.

**Where it comes from.** Two events in the existing `public.funnel_events` table. No new table, no migration.

| step | fires | metadata |
|---|---|---|
| `reveal_seen` | when the top-talent reveal card (`RevelatoryHero`) is shown, guest or signed in; once per talent per device | `talent`, `local_date` |
| `game_open` | when a game route is on screen (`/`, `/village`, `/game/*`, with or without the `/es` `/ru` prefix); at most once per local calendar day per device | `has_result`, `locale`, `local_date` |

Every funnel event, old and new, now also carries `metadata.player_id` (a random uuid kept in localStorage as `fytt_player_id`, one per device) and, when signed in, `metadata.user_id`. `session_id` is unchanged, so older funnels still read the same way. No email, no name, in any event.

`/?path=…` (the pre-game outreach landing) does not count as a game open.

Code: `src/lib/funnelAnalytics.ts` (`getPlayerId`), `src/lib/returnMetric.ts`, `src/hooks/useReturnMetric.ts`. The reveal hook is one call in `RevelatoryHero`; the daily hook is one call in `GlobalChrome` (`App.tsx`).

**How to read it.** Run [`return_metric.sql`](./return_metric.sql) against the database. Edit the two dates in `params` first.

- The cohort is every player whose first-ever `reveal_seen` falls on a day in `[from_day, to_day]`.
- A player counts as returned when they have a `game_open` on a later calendar day than that first reveal, up to `to_day`.
- Players are keyed by `coalesce(user_id, player_id)`. Days are the player's own local calendar day (`local_date`), falling back to the UTC date of the event.
- Output: a `total` row (`revealed_players`, `returned_players`, `return_rate_pct`), then one row per first-reveal day.

`funnel_events` is readable by `authenticated` users only, and the project is Lovable-managed. Without direct SQL access, the same rows can be pulled through `agent-db` (`op: "select"`, `table: "funnel_events"`, `match: {"step": "reveal_seen"}`, then `game_open`; the function caps a read at 1000 rows). `agent-db` has no named read actions and runs no SQL by design, so there is no `return_metric` action; computing the figure from those rows is a manual step for now.

**Known blind spots.** The number is a floor, not a census.

- **Cleared storage.** A player who clears site data gets a new `player_id`. Their return looks like a new person with no reveal, so they drop out.
- **Second device or browser.** Each device has its own `player_id`. A reveal on a phone and a return on a laptop is not seen, unless the player is signed in on both (then `user_id` joins them).
- **Private mode or blocked storage.** No stable id and no day memory. `game_open` stays silent there by design, and `player_id` lasts one page load.
- **Guest who later signs in.** Events before sign-in are keyed by `player_id`, events after by `user_id`. The reveal and the return then land under different keys and the return is missed. A follow-up could bridge the two through events that carry both.
- **Reveals before this shipped.** A player who saw the reveal earlier has no `reveal_seen` until they see it again, so they enter the cohort late or never.
- **`has_result` for signed-in players.** It is true for any signed-in session, whether or not a saved result exists (checking would need an async lookup on every game open). Treat it as "has a result or an account".
- **Same-device reveal and return across timezones.** Days are local to the player, so a player who travels across midnight-crossing timezones can move a day. This is rare and not corrected.
- **Hand-written rows.** The table accepts anonymous inserts, so anyone can write rows. The metric trusts what the client sends.
