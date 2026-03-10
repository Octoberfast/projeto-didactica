-- 011_sync_transcription_status_trigger.sql
-- Trigger para sincronizar status de transcriptions_meta → project_requests

BEGIN;

-- 1. Criar função trigger
CREATE OR REPLACE FUNCTION sync_transcription_status_to_project_requests()
RETURNS TRIGGER AS $$
DECLARE
  mapped_status VARCHAR(20);
BEGIN
  -- Só executa se o status realmente mudou
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Mapear status de transcriptions_meta para project_requests
    CASE NEW.status
      WHEN 'pendente'   THEN mapped_status := 'aguardando_ingestao';
      WHEN 'processado' THEN mapped_status := 'em_andamento';
      WHEN 'concluido'  THEN mapped_status := 'concluido';
      WHEN 'erro'       THEN mapped_status := 'em_andamento';
      ELSE mapped_status := 'em_andamento';
    END CASE;

    -- Atualizar o project_requests correspondente
    -- Match por empresa/projeto + tipo transcricao + proximidade de created_at
    UPDATE public.project_requests
    SET status = mapped_status,
        updated_at = now()
    WHERE company_name = NEW.empresa
      AND project_name = NEW.projeto
      AND form_data->>'tipo' = 'transcricao'
      AND created_at BETWEEN (NEW.created_at - INTERVAL '10 seconds')
                        AND (NEW.created_at + INTERVAL '10 seconds');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trg_sync_transcription_status ON public.transcriptions_meta;

-- 3. Criar trigger
CREATE TRIGGER trg_sync_transcription_status
  AFTER UPDATE OF status ON public.transcriptions_meta
  FOR EACH ROW
  EXECUTE FUNCTION sync_transcription_status_to_project_requests();

COMMIT;
