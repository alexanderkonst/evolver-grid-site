create table if not exists public.commercial_outbound_actions (
  id uuid primary key default gen_random_uuid(),
  action_type text not null check (action_type in ('connection_request', 'message')),
  target_id text not null,
  status text not null default 'reserved' check (status in ('reserved', 'sent', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.commercial_outbound_actions enable row level security;
revoke all on public.commercial_outbound_actions from anon, authenticated;

create or replace function public.reserve_commercial_outbound_action(p_action_type text, p_target_id text, p_daily_cap integer default 20, p_weekly_cap integer default 80)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_daily integer; v_weekly integer;
begin
  if p_action_type not in ('connection_request', 'message') then raise exception 'Unsupported outbound action'; end if;
  if coalesce(length(trim(p_target_id)), 0) = 0 then raise exception 'Missing outbound target'; end if;
  perform pg_advisory_xact_lock(hashtext('commercial_outbound_caps'));
  select count(*) into v_daily from public.commercial_outbound_actions where created_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC' and status in ('reserved', 'sent');
  select count(*) into v_weekly from public.commercial_outbound_actions where created_at >= date_trunc('week', now() at time zone 'UTC') at time zone 'UTC' and status in ('reserved', 'sent');
  if v_daily >= p_daily_cap then raise exception 'Daily safety cap (%) reached', p_daily_cap; end if;
  if v_weekly >= p_weekly_cap then raise exception 'Weekly safety cap (%) reached', p_weekly_cap; end if;
  insert into public.commercial_outbound_actions(action_type, target_id) values (p_action_type, p_target_id) returning id into v_id;
  return v_id;
end; $$;
revoke all on function public.reserve_commercial_outbound_action(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.reserve_commercial_outbound_action(text,text,integer,integer) to service_role;
