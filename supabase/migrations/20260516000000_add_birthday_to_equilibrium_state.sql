-- 2026-05-16: add `birthday` to equilibrium_state.
--
-- WHY: BirthdayPrompt was writing to `game_profiles.birthday`, but that
-- column doesn't exist (only `equilibrium_users.birthday` exists on the
-- v1.x Telegram-bot table). The BD prompt always failed with
-- "Couldn't save — try again." because the column was a phantom.
--
-- WHERE: Equilibrium v2 birthday is v2-specific user state, so it lives
-- on `equilibrium_state` (the v2 user-state table) alongside moon_focus,
-- mission_override_text, etc. Same lazy-row pattern; RLS already in
-- place for the table covers this column.
--
-- TYPE: DATE — stored as YYYY-MM-DD string at the client/<input
-- type="date"> boundary; parsed as DATE in Postgres.

ALTER TABLE public.equilibrium_state
  ADD COLUMN IF NOT EXISTS birthday DATE;

COMMENT ON COLUMN public.equilibrium_state.birthday IS
  'Birthday for the Equilibrium v2 personal solar cycle anchor. Optional. Format YYYY-MM-DD.';
