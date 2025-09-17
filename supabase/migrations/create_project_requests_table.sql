-- Criar tabela project_requests
CREATE TABLE project_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    responsible VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    request_deadline DATE NOT NULL,
    delivery_deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido')),
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_project_requests_user_email ON project_requests(user_email);
CREATE INDEX idx_project_requests_created_at ON project_requests(created_at DESC);
CREATE INDEX idx_project_requests_status ON project_requests(status);

-- Row Level Security (RLS)
ALTER TABLE project_requests ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem seus próprios projetos
CREATE POLICY "Users can view own projects" ON project_requests
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Política: usuários só podem inserir projetos para si mesmos
CREATE POLICY "Users can insert own projects" ON project_requests
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Política: usuários só podem atualizar seus próprios projetos
CREATE POLICY "Users can update own projects" ON project_requests
    FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

-- Permissões
GRANT SELECT ON project_requests TO anon;
GRANT ALL PRIVILEGES ON project_requests TO authenticated;

-- Dados iniciais de exemplo
INSERT INTO project_requests (
    company_name, project_name, responsible, department, 
    request_deadline, delivery_deadline, status, user_email
) VALUES 
('Empresa ABC', 'Website Institucional', 'João Silva', 'Marketing', 
 '2024-02-15', '2024-03-15', 'em_andamento', 'danilo.alves@email.com'),
('Empresa XYZ', 'Sistema de Vendas', 'Maria Santos', 'TI', 
 '2024-01-20', '2024-04-20', 'concluido', 'danilo.alves@email.com'),
('Startup Tech', 'App Mobile', 'Pedro Costa', 'Produto', 
 '2024-03-01', '2024-06-01', 'em_andamento', 'danilo.alves@email.com');