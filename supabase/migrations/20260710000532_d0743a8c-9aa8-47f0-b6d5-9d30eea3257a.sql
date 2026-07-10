-- 2026-07-09 — Telegram founder chat (Day 119, Sasha).
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

CREATE TABLE IF NOT EXISTS public.founder_corpus_docs (
  path TEXT PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_corpus_docs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN PERFORM cron.unschedule('equilibrium-cron'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('equilibrium-readings'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('equilibrium-telegram-readings'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('equilibrium-daily-readings'); EXCEPTION WHEN OTHERS THEN NULL; END $$;