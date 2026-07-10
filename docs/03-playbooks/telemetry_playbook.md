# Telemetry Playbook (Daily Loop v2)

Use this to verify the action funnel in Supabase. Run these queries in the SQL editor.

## Core Funnel (Presented → Accept → Completed)

```sql
-- Count events by intent (last 7 days)
select
  metadata->>'intent' as intent,
  count(*) as events
from action_events
where selected_at >= now() - interval '7 days'
group by 1
order by events desc;
```

```sql
-- Funnel: presented → accept → completed (last 7 days)
with events as (
  select
    action_id,
    profile_id,
    min(case when metadata->>'intent' = 'presented' then selected_at end) as presented_at,
    min(case when metadata->>'intent' = 'accept_recommendation' then selected_at end) as accepted_at,
    min(case when metadata->>'intent' = 'completed' then completed_at end) as completed_at
  from action_events
  where selected_at >= now() - interval '7 days'
  group by action_id, profile_id
)
select
  count(*) filter (where presented_at is not null) as presented,
  count(*) filter (where accepted_at is not null) as accepted,
  count(*) filter (where completed_at is not null) as completed
from events;
```

## Overrides + Empty States

```sql
-- Freedom Mode overrides (last 7 days)
select count(*) as overrides
from action_events
where metadata->>'intent' = 'freedom_mode_override'
  and selected_at >= now() - interval '7 days';
```

```sql
-- No recommendation events (last 7 days)
select count(*) as no_recommendation
from action_events
where action_id = 'daily-loop:no_recommendation'
  and selected_at >= now() - interval '7 days';
```

```sql
-- Recommendation errors (last 7 days)
select count(*) as recommendation_errors
from action_events
where action_id = 'daily-loop:recommendation_error'
  and selected_at >= now() - interval '7 days';
```

## Latency Check

```sql
-- Average load duration in ms (last 7 days)
select
  avg((metadata->>'loadDurationMs')::int) as avg_load_ms
from action_events
where metadata ? 'loadDurationMs'
  and selected_at >= now() - interval '7 days';
```

## Daily Loop v2 Exposure

```sql
-- View counts by feature flag
select
  metadata->>'dailyLoopV2' as daily_loop_v2,
  count(*) as views
from action_events
where action_id = 'daily-loop:view'
  and selected_at >= now() - interval '7 days'
group by 1;
```

## Mission Participants (Admin)

Admin page: `/admin/mission-participants`

```sql
-- Latest mission commitments
select
  created_at,
  mission_title,
  email,
  share_consent,
  notify_level,
  email_frequency
from mission_participants
order by created_at desc
limit 50;
```

---

## Offer Cadence — the One Metric That Matters (added Day 119, July 9, 2026)

> *Origin: Money Studies cycles #1-5 (Golden's "make more offers" + Brown's "idle dollars, go to work"). Surfaced during the July 2026 offer audit; instrumented on the Founder Cockpit.*

**The metric:** offers made per week to actual humans. One unit = one named offer presented to one named person. Logged atomically in `offer_pulses`, displayed on `/build/cockpit/dashboard` (Offer Cadence card).

**The science (three converging lineages):**

1. **One Metric That Matters (OMTM)** — Alistair Croll & Ben Yoskovitz, *Lean Analytics* (2013): at any given stage, optimize exactly one metric; everything else is reporting. Focus compounds; vanity metrics kill.
2. **North Star Metric** — Sean Ellis and the growth community (~2013-2017): the single number that best captures value delivery (Airbnb: nights booked; Facebook: 7 friends in 10 days).
3. **Controllable input metrics** — Amazon doctrine (*Working Backwards*): don't manage the lagging output (revenue); manage the controllable input causally upstream of it (Amazon: selection, price, delivery speed).

Offers-per-week is an OMTM of the *input* type — the strongest kind for a solo founder: revenue is the lagging output, offer emission is the input, Golden supplies the causal link, and nothing outside the founder can prevent the number from moving.

**ESC:**

- **Essence (Heart):** the metric measures *courage in circulation* — how many times per week the work was actually offered to reality. It is the behavioral opposite of the preparation loop.
- **Significance (Mind):** it converts "sales" from an outcome to a practice. The founder stops asking "why is revenue low?" (unanswerable, lagging) and starts asking "did I make offers this week?" (answerable, controllable). It is also the direct instrument for the Self-Use Discipline shadow: the hoarded offer becomes visible as a zero on a dashboard.
- **Consequences (Gut):** what gets counted gets done; a visible weekly number creates cadence pressure without external accountability. Sequencing note (Sasha, Day 119): cadence begins AFTER the current digestion phase completes (category → threshold/tribe → offer are upstream). The instrument ships first so the practice starts on an instrumented field.

**Operational rule:** log the offer the moment it is made (5 seconds). Review weekly count in the Cockpit. The number never lies and never needs interpretation.
