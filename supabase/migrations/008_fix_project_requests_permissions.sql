-- Verificar e ajustar permissões para project_requests

-- Garantir que a role anon pode inserir dados na tabela project_requests
GRANT INSERT ON project_requests TO anon;
GRANT SELECT ON project_requests TO anon;

-- Garantir que a role authenticated pode fazer operações completas
GRANT ALL PRIVILEGES ON project_requests TO authenticated;

-- Verificar se há políticas RLS restritivas e criar políticas mais permissivas se necessário
-- Política para permitir inserção por usuários anônimos (para formulários públicos)
DROP POLICY IF EXISTS "Allow anonymous insert" ON project_requests;
CREATE POLICY "Allow anonymous insert" ON project_requests
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Política para permitir leitura por usuários anônimos (se necessário)
DROP POLICY IF EXISTS "Allow anonymous select" ON project_requests;
CREATE POLICY "Allow anonymous select" ON project_requests
  FOR SELECT 
  TO anon
  USING (true);

-- Política para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated all" ON project_requests;
CREATE POLICY "Allow authenticated all" ON project_requests
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'project_requests' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;