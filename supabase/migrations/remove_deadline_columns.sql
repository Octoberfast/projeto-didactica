-- Remover colunas de deadline da tabela project_requests
-- Estas colunas não são mais utilizadas no formulário

ALTER TABLE public.project_requests 
DROP COLUMN IF EXISTS request_deadline,
DROP COLUMN IF EXISTS delivery_deadline;