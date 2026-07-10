-- Offer Pulses (Day 119, July 9, 2026 — Money Studies enrichment)
--
-- The controllable input metric: offers made per week.
-- Revenue is a lagging output; offer emission is the input the founder
-- fully controls (OMTM / input-metric doctrine — see
-- docs/03-playbooks/telemetry_playbook.md, "Offer Cadence" section).
-- Each row = one offer made to one real human. Atomic pulse in,
-- weekly count out, surfaced on the Founder Cockpit.

create table if not exists public.offer_pulses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  recipient text not null,
  offer_name text not null,
  channel text,
  note text
);

alter table public.offer_pulses enable row level security;

-- Admin-only, all operations (cockpit is an admin surface).
create policy "offer_pulses_admin_select" on public.offer_pulses
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "offer_pulses_admin_insert" on public.offer_pulses
  for insert with check (public.has_role(auth.uid(), 'admin'));

create policy "offer_pulses_admin_update" on public.offer_pulses
  for update using (public.has_role(auth.uid(), 'admin'));

create policy "offer_pulses_admin_delete" on public.offer_pulses
  for delete using (public.has_role(auth.uid(), 'admin'));
