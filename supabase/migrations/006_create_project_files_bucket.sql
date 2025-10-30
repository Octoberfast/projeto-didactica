-- 006_create_project_files_bucket.sql
-- Criar bucket project_files e configurar políticas de acesso

BEGIN;

-- 1. Criar bucket project_files (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project_files', 
  'project_files', 
  false, 
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.ms-excel',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para upload de arquivos
-- Usuários autenticados podem fazer upload em pastas de seus próprios projetos
CREATE POLICY "Users can upload their own project files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project_files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'projects'
  );

-- 3. Política para download de arquivos
-- Usuários autenticados podem baixar arquivos de seus próprios projetos
CREATE POLICY "Users can download their own project files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project_files' AND
    auth.role() = 'authenticated'
  );

-- 4. Política para deletar arquivos
-- Usuários autenticados podem deletar arquivos de seus próprios projetos
CREATE POLICY "Users can delete their own project files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project_files' AND
    auth.role() = 'authenticated'
  );

-- 5. Política para atualizar arquivos
-- Usuários autenticados podem atualizar metadados de arquivos de seus próprios projetos
CREATE POLICY "Users can update their own project files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project_files' AND
    auth.role() = 'authenticated'
  );

COMMIT;