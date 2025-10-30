-- Verificar e criar bucket project_files se não existir
-- Esta migração garante que o bucket project_files esteja configurado corretamente

-- Inserir bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'project_files',
  'project_files',
  false,
  10485760, -- 10MB em bytes
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'project_files'
);

-- Verificar se as políticas RLS existem e criar se necessário
DO $$
BEGIN
  -- Política para upload (INSERT)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'project_files_upload_policy'
  ) THEN
    CREATE POLICY "project_files_upload_policy" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'project_files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Política para download (SELECT)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'project_files_select_policy'
  ) THEN
    CREATE POLICY "project_files_select_policy" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'project_files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Política para delete (DELETE)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'project_files_delete_policy'
  ) THEN
    CREATE POLICY "project_files_delete_policy" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'project_files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Política para update (UPDATE)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'project_files_update_policy'
  ) THEN
    CREATE POLICY "project_files_update_policy" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'project_files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;