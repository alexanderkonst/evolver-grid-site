-- Return metric v0 (#287). Read-only. Runs against public.funnel_events as it is
-- (supabase/migrations/20260403_create_funnel_events.sql); no migration needed.
--
-- The number: players who passed the top-talent reveal (`reveal_seen`) and came back
-- on a later calendar day (`game_open`).
--
-- HOW TO USE: edit the two dates in `params`, run the whole statement.
--   from_day / to_day: the cohort window. A player belongs to the cohort when their
--   FIRST EVER reveal_seen falls on a day inside [from_day, to_day]. A return counts when
--   a game_open lands on a day AFTER that first reveal day and not after to_day.
--
-- Player key: coalesce(metadata->>'user_id', metadata->>'player_id'). player_id is the
-- per-device uuid (localStorage `fytt_player_id`); user_id is added once signed in.
--
-- Day key: the player's own LOCAL calendar day (metadata.local_date, written by the client
-- on both events). Events without it fall back to the UTC date of `timestamp`.
--
-- Output, one result set:
--   kind = 'total'  one row: all cohort players
--   kind = 'day'    one row per first-reveal day: that day's cohort, newest day last
-- columns: kind, day, revealed_players, returned_players, return_rate_pct

with params as (
  select date '2026-11-01' as from_day,
         date '2026-11-14' as to_day
),

events as (
  select
    coalesce(nullif(metadata->>'user_id', ''), nullif(metadata->>'player_id', '')) as player,
    step,
    coalesce(
      case when metadata->>'local_date' ~ '^20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'
           then (metadata->>'local_date')::date end,
      ("timestamp" at time zone 'UTC')::date
    ) as day
  from public.funnel_events
  where step in ('reveal_seen', 'game_open')
),

-- (a) players with a reveal, anchored on their first reveal day
first_reveal as (
  select player, min(day) as first_day
  from events
  where step = 'reveal_seen' and player is not null
  group by player
),

cohort as (
  select fr.player, fr.first_day
  from first_reveal fr, params p
  where fr.first_day between p.from_day and p.to_day
),

-- (b) of them, players with a game_open on a later calendar day (inside the window)
returned as (
  select distinct c.player
  from cohort c
  join events e
    on e.player = c.player
   and e.step = 'game_open'
   and e.day > c.first_day
  cross join params p
  where e.day <= p.to_day
),

-- (c) the list by first-reveal day
by_day as (
  select
    c.first_day as day,
    count(*) as revealed_players,
    count(r.player) as returned_players
  from cohort c
  left join returned r on r.player = c.player
  group by c.first_day
)

select 'total' as kind,
       null::date as day,
       count(*) as revealed_players,
       count(r.player) as returned_players,
       round(100.0 * count(r.player) / nullif(count(*), 0), 1) as return_rate_pct
from cohort c
left join returned r on r.player = c.player

union all

select 'day',
       day,
       revealed_players,
       returned_players,
       round(100.0 * returned_players / nullif(revealed_players, 0), 1)
from by_day

order by kind desc, day;
