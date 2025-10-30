-- 003_update_status_constraint.sql
-- Idempotent migration: update status constraint to include 'concluido'

begin;

-- Remove existing CHECK constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transcriptions_meta_status_check'
  ) THEN
    ALTER TABLE public.transcriptions_meta
    DROP CONSTRAINT transcriptions_meta_status_check;
  END IF;
END$$;

-- Add updated CHECK constraint with 'concluido' status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transcriptions_meta_status_check'
  ) THEN
    ALTER TABLE public.transcriptions_meta
    ADD CONSTRAINT transcriptions_meta_status_check
      CHECK (status in ('pendente','processado','erro','concluido'));
  END IF;
END$$;

commit;