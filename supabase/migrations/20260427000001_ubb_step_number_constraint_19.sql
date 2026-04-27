-- Day 53 (Sasha 2026-04-27): UBB step_number constraint synchronization.
--
-- The original `user_business_artifacts` migration (20260421020000) capped
-- step_number at 7 (the seven-step Playbook). When the Unique Business
-- Builder grew its full canonical artifact set (19 keys total — 18 standard
-- + landing_page at step 19), the constraint had to expand. Earlier
-- ad-hoc widening to ≤18 was applied directly in Supabase prod via a
-- Lovable session (no migration file shipped at that time). Lovable's
-- 2026-04-27 bulk-migration session widened it again to ≤19 to allow the
-- `landing_page` artifact (step 19) to insert.
--
-- This migration captures the FINAL state in source so:
--   (a) any future db-rebuild-from-migrations matches prod,
--   (b) the canonical artifact set in
--       `supabase/functions/seed-founder-docs/index.ts` (STEP_NUMBER_BY_KEY
--       maps `landing_page: 19`) won't blow the constraint on a fresh DB.
--
-- Idempotent: drops the constraint by name only if it exists, then
-- recreates with the widened bound. Safe to re-run.

do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name   = 'user_business_artifacts'
      and constraint_name = 'user_business_artifacts_step_number_check'
  ) then
    alter table public.user_business_artifacts
      drop constraint user_business_artifacts_step_number_check;
  end if;

  alter table public.user_business_artifacts
    add constraint user_business_artifacts_step_number_check
    check (step_number >= 1 and step_number <= 19);
end $$;

comment on constraint user_business_artifacts_step_number_check
  on public.user_business_artifacts is
  'Day 53: step_number ∈ [1,19] — covers the 19 canonical UBB artifact keys (18 standard + landing_page = 19). Synced with STEP_NUMBER_BY_KEY in seed-founder-docs edge function.';
