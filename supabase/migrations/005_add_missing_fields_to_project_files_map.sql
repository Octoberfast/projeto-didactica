-- 005_add_missing_fields_to_project_files_map.sql
-- Adicionar campos necessários para a implementação de submissão direta

BEGIN;

-- 1. Adicionar campos necessários se não existirem
DO $$
BEGIN
  -- Adicionar original_name se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_files_map' 
    AND column_name = 'original_name'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.project_files_map 
    ADD COLUMN original_name TEXT;
  END IF;

  -- Adicionar storage_path se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_files_map' 
    AND column_name = 'storage_path'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.project_files_map 
    ADD COLUMN storage_path TEXT;
  END IF;

  -- Adicionar mime_type se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_files_map' 
    AND column_name = 'mime_type'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.project_files_map 
    ADD COLUMN mime_type TEXT;
  END IF;

  -- Adicionar file_size se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_files_map' 
    AND column_name = 'file_size'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.project_files_map 
    ADD COLUMN file_size BIGINT;
  END IF;
END$$;

-- 2. Habilitar RLS se não estiver habilitado
ALTER TABLE public.project_files_map ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de segurança se não existirem
DO $$
BEGIN
  -- Política para SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_files_map' 
    AND policyname = 'Users can view own project files'
  ) THEN
    CREATE POLICY "Users can view own project files" ON public.project_files_map
      FOR SELECT USING (
        project_id IN (
          SELECT id FROM public.project_requests 
          WHERE user_email = auth.jwt() ->> 'email'
        )
      );
  END IF;

  -- Política para INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_files_map' 
    AND policyname = 'Users can insert own project files'
  ) THEN
    CREATE POLICY "Users can insert own project files" ON public.project_files_map
      FOR INSERT WITH CHECK (
        project_id IN (
          SELECT id FROM public.project_requests 
          WHERE user_email = auth.jwt() ->> 'email'
        )
      );
  END IF;
END$$;

-- 4. Garantir permissões
GRANT SELECT ON public.project_files_map TO anon;
GRANT ALL PRIVILEGES ON public.project_files_map TO authenticated;

COMMIT;