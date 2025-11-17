-- Tornar campos de deadline opcionais na tabela project_requests
-- Campos request_deadline e delivery_deadline não são mais obrigatórios

ALTER TABLE public.project_requests 
ALTER COLUMN request_deadline DROP NOT NULL,
ALTER COLUMN delivery_deadline DROP NOT NULL;