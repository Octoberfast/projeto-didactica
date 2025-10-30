-- Verificar e ajustar permissões para project_files_map

-- Garantir que a role anon pode inserir dados na tabela project_files_map
GRANT INSERT ON project_files_map TO anon;
GRANT SELECT ON project_files_map TO anon;

-- Garantir que a role authenticated pode fazer operações completas
GRANT ALL PRIVILEGES ON project_files_map TO authenticated;

-- Verificar se há políticas RLS restritivas e criar políticas mais permissivas se necessário
-- Política para permitir inserção por usuários anônimos (para formulários públicos)
DROP POLICY IF EXISTS "Allow anonymous insert" ON project_files_map;
CREATE POLICY "Allow anonymous insert" ON project_files_map
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Política para permitir leitura por usuários anônimos (se necessário)
DROP POLICY IF EXISTS "Allow anonymous select" ON project_files_map;
CREATE POLICY "Allow anonymous select" ON project_files_map
  FOR SELECT 
  TO anon
  USING (true);

-- Política para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated all" ON project_files_map;
CREATE POLICY "Allow authenticated all" ON project_files_map
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'project_files_map' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;