# Plano de Implementação - Funcionalidade de Reutilização de Projetos

## 1. Resumo Executivo

Este documento detalha o plano de implementação para a funcionalidade de reutilização de projetos no Dashboard, permitindo que usuários criem novos projetos baseados em projetos concluídos anteriormente.

## 2. Análise do Estado Atual

### 2.1 Componentes Existentes Analisados

- **Dashboard.tsx**: Já possui função `handleReuseContent` básica, mas limitada
- **GuiaManual.tsx**: Formulário completo com estado `formData` bem estruturado
- **project_requests**: Tabela com campo `origin_id` já existente
- **form_data**: Campo **NÃO EXISTE** na tabela - precisa ser criado

### 2.2 Funcionalidades Atuais

- Dashboard lista projetos com status
- Botão "Reutilizar" existe mas apenas duplica dados básicos
- GuiaManual tem formulário completo mas não carrega dados externos
- Sistema de upload de arquivos funcionando

## 3. Modificações Necessárias

### 3.1 Banco de Dados

**Arquivo**: `supabase/migrations/010_add_form_data_to_project_requests.sql`

```sql
-- Adicionar campo form_data para armazenar dados completos do formulário
BEGIN;

-- Verificar e adicionar campo form_data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_requests' 
    AND column_name = 'form_data'
  ) THEN
    ALTER TABLE project_requests 
    ADD COLUMN form_data JSONB;
    
    CREATE INDEX idx_project_requests_form_data 
    ON project_requests USING GIN (form_data);
    
    COMMENT ON COLUMN project_requests.form_data 
    IS 'Dados completos do formulário em formato JSON para reutilização';
  END IF;
END $$;

COMMIT;
```

### 3.2 Dashboard.tsx - Modificações

**Localização**: `src/pages/Dashboard.tsx`

**Mudanças necessárias**:

1. **Atualizar interface ProjectRequest**:
```typescript
interface ProjectRequest {
  id: string
  company_name: string
  project_name: string
  responsible: string
  department: string
  request_deadline: string
  delivery_deadline: string
  status: 'em_andamento' | 'concluido'
  user_email: string
  created_at: string
  origin_id?: string
  form_data?: any // Adicionar este campo
}
```

2. **Modificar lógica de exibição do botão**:
```typescript
// Substituir a condição atual
{project.status === 'concluido' && (
  <button>Reutilizar</button>
)}

// Por esta nova condição
{project.status === 'concluido' && project.department !== 'Transcrição' && (
  <button>Reutilizar</button>
)}
```

3. **Atualizar função handleReuseContent**:
```typescript
const handleReuseContent = async (project: ProjectRequest) => {
  if (!user?.email) return

  try {
    setLoading(true)
    
    // Buscar dados completos do projeto incluindo form_data
    const { data: fullProject, error: fetchError } = await supabase
      .from('project_requests')
      .select('*')
      .eq('id', project.id)
      .single()

    if (fetchError) throw fetchError

    // Redirecionar para GuiaManual com parâmetro de reutilização
    navigate(`/guia-manual?reuse=${project.id}`)
    
  } catch (error) {
    console.error('Erro ao reutilizar projeto:', error)
    alert('Erro ao reutilizar projeto. Tente novamente.')
  } finally {
    setLoading(false)
  }
}
```

4. **Adicionar import do useNavigate**:
```typescript
import { useNavigate } from 'react-router-dom'

// Dentro do componente
const navigate = useNavigate()
```

### 3.3 GuiaManual.tsx - Modificações

**Localização**: `src/pages/GuiaManual.tsx`

**Mudanças necessárias**:

1. **Adicionar detecção de parâmetro de reutilização**:
```typescript
import { useSearchParams } from 'react-router-dom'

// Dentro do componente
const [searchParams] = useSearchParams()
const reuseProjectId = searchParams.get('reuse')
const [isReuseMode, setIsReuseMode] = useState(false)
const [originalProjectName, setOriginalProjectName] = useState('')
```

2. **Adicionar useEffect para carregar dados de reutilização**:
```typescript
useEffect(() => {
  const loadReuseData = async () => {
    if (!reuseProjectId || !user?.email) return

    try {
      const { data: project, error } = await supabase
        .from('project_requests')
        .select('*')
        .eq('id', reuseProjectId)
        .eq('user_email', user.email)
        .single()

      if (error) throw error

      if (project && project.form_data) {
        // Carregar dados do form_data
        const formDataFromProject = project.form_data
        
        setFormData({
          ...formDataFromProject,
          anexos: [], // Limpar anexos para permitir novos uploads
          nomeProjeto: `${formDataFromProject.nomeProjeto} (Cópia)` // Indicar que é cópia
        })
        
        setIsReuseMode(true)
        setOriginalProjectName(project.project_name)
      }
    } catch (error) {
      console.error('Erro ao carregar dados para reutilização:', error)
    }
  }

  loadReuseData()
}, [reuseProjectId, user?.email])
```

3. **Adicionar banner informativo no modo reutilização**:
```typescript
// Adicionar após o Hero Section
{isReuseMode && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
    <div className="flex items-center">
      <Copy className="w-5 h-5 text-blue-600 mr-2" />
      <div>
        <h3 className="text-sm font-medium text-blue-800">
          Reutilizando projeto: {originalProjectName}
        </h3>
        <p className="text-sm text-blue-600">
          Os campos foram pré-preenchidos com os dados do projeto original. 
          Você pode editá-los livremente antes de enviar.
        </p>
      </div>
    </div>
  </div>
)}
```

4. **Modificar handleSubmit para incluir origin_id**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... código existente ...

  const projectData = {
    company_name: formData.nomeEmpresa,
    project_name: formData.nomeProjeto,
    responsible: formData.responsavelNome,
    department: formData.areaDepartamento,
    request_deadline: formData.prazoEntrega,
    delivery_deadline: formData.prazoEntrega,
    user_email: user.email,
    status: 'aguardando_ingestao',
    form_data: formData,
    ...(reuseProjectId && { origin_id: reuseProjectId }) // Adicionar origin_id se for reutilização
  }

  // ... resto do código ...
}
```

### 3.4 Imports Adicionais Necessários

**Dashboard.tsx**:
```typescript
import { useNavigate } from 'react-router-dom'
```

**GuiaManual.tsx**:
```typescript
import { useSearchParams } from 'react-router-dom'
import { Copy } from 'lucide-react'
```

## 4. Fluxo de Implementação

### 4.1 Ordem de Implementação

1. **Migração do Banco** (10_add_form_data_to_project_requests.sql)
2. **Modificações no Dashboard.tsx**
3. **Modificações no GuiaManual.tsx**
4. **Testes de Integração**

### 4.2 Pontos de Atenção

- **Compatibilidade**: Projetos existentes sem `form_data` devem ser tratados graciosamente
- **Validação**: Verificar se o projeto a ser reutilizado pertence ao usuário logado
- **Performance**: Carregar apenas dados necessários para reutilização
- **UX**: Indicar claramente quando um formulário está em modo reutilização

## 5. Impactos nos Sistemas Existentes

### 5.1 Supabase e n8n

**Sem Impacto**: A funcionalidade não afeta:
- Triggers existentes
- Webhooks configurados
- Fluxos do n8n
- Sistema de upload de arquivos
- Autenticação e permissões

**Motivo**: A reutilização apenas cria novos registros normais na tabela `project_requests`, seguindo o mesmo fluxo de criação de projetos existente.

### 5.2 Realtime Subscriptions

**Sem Impacto**: As subscriptions existentes continuarão funcionando normalmente, pois novos projetos reutilizados seguem a mesma estrutura de dados.

## 6. Testes Necessários

### 6.1 Cenários de Teste

1. **Reutilização de projeto concluído** (departamento ≠ Transcrição)
2. **Projeto de Transcrição** (botão não deve aparecer)
3. **Projeto em andamento** (botão não deve aparecer)
4. **Formulário pré-preenchido** (todos os campos carregados)
5. **Edição e envio** (novo projeto independente criado)
6. **Projetos sem form_data** (compatibilidade com dados antigos)

### 6.2 Validações

- Origin_id corretamente preenchido
- Form_data preservado e carregado
- Novos arquivos podem ser anexados
- Projeto original não é modificado
- Permissões de usuário respeitadas

## 7. Cronograma Estimado

- **Migração DB**: 30 minutos
- **Dashboard.tsx**: 2 horas
- **GuiaManual.tsx**: 3 horas
- **Testes**: 2 horas
- **Total**: ~7.5 horas

## 8. Considerações de Segurança

- Verificação de propriedade do projeto antes da reutilização
- Validação de parâmetros de URL
- Manutenção das políticas RLS existentes
- Limpeza de dados sensíveis se necessário