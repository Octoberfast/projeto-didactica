-- Adicionar campo origin_id para rastreamento de conteúdo reutilizado
ALTER TABLE project_requests 
ADD COLUMN origin_id UUID REFERENCES project_requests(id);

-- Criar índice para melhor performance
CREATE INDEX idx_project_requests_origin_id ON project_requests(origin_id);

-- Comentário para documentar o campo
COMMENT ON COLUMN project_requests.origin_id IS 'ID do projeto original quando este é uma reutilização de conteúdo';