-- 2026-07-09 — Telegram founder chat (Day 119, Sasha).
--
-- The equilibrium Telegram bot is repurposed: cosmic-reading broadcasts are
-- deprecated (equilibrium-cron neutered in code, plausible cron job names
-- unscheduled below), and the same bot becomes a private founder chat —
-- Sasha talking to his corpus + live project state from his phone.
--
-- Tables are service-role only (RLS on, no policies): the bot's edge
-- function is the single reader/writer.

-- ── Conversation memory ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.telegram_founder_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id BIGINT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS telegram_founder_messages_chat_created_idx
  ON public.telegram_founder_messages (chat_id, created_at DESC);

ALTER TABLE public.telegram_founder_messages ENABLE ROW LEVEL SECURITY;

-- ── Corpus mirror ────────────────────────────────────────────────────
-- Selected docs/ files synced by scripts/sync-founder-corpus.mjs.
-- This is a machine-readable mirror for the bot, not a second source of
-- truth: git remains canonical (no parallel compressions — full text only).
CREATE TABLE IF NOT EXISTS public.founder_corpus_docs (
  path TEXT PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_corpus_docs ENABLE ROW LEVEL SECURITY;

-- ── Deprecate cosmic-reading broadcasts ──────────────────────────────
-- No migration ever scheduled these; if a dashboard-created job exists
-- under a plausible name, remove it. Each unschedule is tolerant.
DO $$
BEGIN
  PERFORM cron.unschedule('equilibrium-cron');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('equilibrium-readings');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('equilibrium-telegram-readings');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('equilibrium-daily-readings');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
