-- 002_alter_transcriptions_meta.sql
-- Idempotent migration: evolve schema with lifecycle columns and indexes

begin;

-- Add new columns if not exist
alter table public.transcriptions_meta
  add column if not exists bucket text;

alter table public.transcriptions_meta
  add column if not exists status text;

alter table public.transcriptions_meta
  add column if not exists processed_at timestamptz;

alter table public.transcriptions_meta
  add column if not exists email_sent_at timestamptz;

alter table public.transcriptions_meta
  add column if not exists error_message text;

alter table public.transcriptions_meta
  add column if not exists backend_job_id text;

-- Add CHECK constraint for status values
-- Use a named constraint and only create it if not exists
-- PostgreSQL doesn't support IF NOT EXISTS for constraints directly, so we guard via DO block
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transcriptions_meta_status_check'
  ) THEN
    ALTER TABLE public.transcriptions_meta
    ADD CONSTRAINT transcriptions_meta_status_check
      CHECK (status in ('pendente','processado','erro'));
  END IF;
END$$;

-- Indexes for querying lifecycle
create index if not exists transcriptions_meta_status_idx on public.transcriptions_meta(status);

commit;