-- 004_update_project_requests_status_and_create_files_map.sql
-- Atualizar constraint de status em project_requests e criar tabela project_files_map

BEGIN;

-- 1. Atualizar constraint de status em project_requests para incluir 'aguardando_ingestao'
ALTER TABLE public.project_requests 
DROP CONSTRAINT IF EXISTS project_requests_status_check;

ALTER TABLE public.project_requests 
ADD CONSTRAINT project_requests_status_check 
CHECK (status IN ('aguardando_ingestao', 'em_andamento', 'concluido'));

-- 2. Criar tabela project_files_map para mapear arquivos dos projetos
CREATE TABLE IF NOT EXISTS public.project_files_map (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,           -- Nome único gerado (timestamp_filename)
  original_name TEXT NOT NULL,       -- Nome original do arquivo
  storage_path TEXT NOT NULL UNIQUE, -- Caminho completo no storage
  mime_type TEXT,
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_project_files_map_project_id ON public.project_files_map(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_map_storage_path ON public.project_files_map(storage_path);

-- 4. Habilitar Row Level Security na tabela project_files_map
ALTER TABLE public.project_files_map ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança para project_files_map
-- Usuários autenticados podem ver apenas arquivos de seus próprios projetos
CREATE POLICY "Users can view own project files" ON public.project_files_map
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.project_requests 
      WHERE user_email = auth.jwt() ->> 'email'
    )
  );

-- Usuários autenticados podem inserir arquivos em seus próprios projetos
CREATE POLICY "Users can insert own project files" ON public.project_files_map
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM public.project_requests 
      WHERE user_email = auth.jwt() ->> 'email'
    )
  );

-- 6. Permissões para as roles
GRANT SELECT ON public.project_files_map TO anon;
GRANT ALL PRIVILEGES ON public.project_files_map TO authenticated;

-- 7. Permissões para a sequência
GRANT USAGE, SELECT ON SEQUENCE public.project_files_map_id_seq TO authenticated;

COMMIT;