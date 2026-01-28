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
