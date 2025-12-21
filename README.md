# Didáctica - Plataforma de Criação de Conteúdo Educacional

Uma plataforma web moderna para criação e gestão de conteúdo educacional, desenvolvida com React, TypeScript e Supabase. O sistema permite que educadores criem guias, manuais, e-books, transcrições e elementos de aprendizagem de forma intuitiva e organizada.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Backend**: Supabase (banco de dados, autenticação, storage)
- **Upload de Arquivos**: tus-js-client (upload resumível)
- **Roteamento**: React Router v6
- **Gerenciamento de Estado**: React Hooks
- **Validação**: Validação nativa de formulários
- **Ícones**: Lucide React

## 📋 Funcionalidades Principais

- ✅ **Autenticação de Usuários** - Login seguro com Supabase Auth
- 📊 **Dashboard Interativo** - Acompanhamento de projetos em tempo real
- 📝 **Criação de Conteúdo** - Guias, manuais, e-books e transcrições
- 📋 **Gerador de Sumário** - Construção automática de índices
- 🎵 **Transcrição de Áudio/Vídeo** - Upload resumível com processamento
- 📚 **Elementos de Aprendizagem** - Seleção de componentes educacionais
- 🛠️ **Ferramentas de Planejamento** - Recursos organizacionais
- 📤 **Upload de Arquivos** - Sistema robusto com barra de progresso
- 🔐 **Segurança** - Row-Level Security (RLS) no Supabase

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Supabase

### Passos para Instalação

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/Octoberfast/projeto-didactica.git
   cd projeto-didactica
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Preencha o arquivo `.env` com:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Iniciar o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Abrir no navegador**
   ```
   http://localhost:5173
   ```

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Header.tsx       # Cabeçalho principal com navegação
│   └── ui/              # Componentes de UI básicos
├── lib/                 # Bibliotecas e configurações
│   └── supabaseClient.ts # Cliente Supabase configurado
├── pages/               # Páginas principais da aplicação
│   ├── Login.tsx        # Página de autenticação
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── ChooseContentType.tsx # Seleção de tipo de conteúdo
│   ├── Transcricao.tsx  # Transcrição de áudio/vídeo
│   ├── Sumario.tsx      # Gerador de sumário
│   ├── GuiaManual.tsx   # Criação de guias e manuais
│   ├── ElementosAprendizagem.tsx # Elementos educacionais
│   └── FerramentasPlanejamento.tsx # Ferramentas de planejamento
├── types/               # Definições de tipos TypeScript
│   └── summary.ts       # Tipos para sumário
├── App.tsx             # Componente principal com rotas
└── main.tsx            # Ponto de entrada da aplicação
```

## 🖥️ Telas e Funcionalidades Detalhadas

### 1. Login (`/login`)
**Arquivo**: `src/pages/Login.tsx`

**Funcionalidades:**
- Autenticação segura via Supabase Auth
- Validação de email e senha
- Tratamento de erros com feedback visual
- Redirecionamento automático para dashboard
- Interface limpa e responsiva

**Componentes principais:**
- Formulário de login com campos de email e senha
- Botão de envio com estado de loading
- Exibição de mensagens de erro/sucesso
- Link para cadastro (se implementado)

### 2. Dashboard (`/`)
**Arquivo**: `src/pages/Dashboard.tsx`

**Funcionalidades:**
- Visualização de projetos em andamento
- Cards informativos com status
- Navegação rápida para diferentes funcionalidades
- Layout responsivo com grid system
- Indicadores visuais de progresso

**Cards disponíveis:**
- Transcrição de Áudio/Vídeo
- Gerador de Sumário
- Guia e Manual
- Elementos de Aprendizagem
- Ferramentas de Planejamento

### 3. Escolher Tipo de Conteúdo (`/choose-content-type`)
**Arquivo**: `src/pages/ChooseContentType.tsx`

**Funcionalidades:**
- Seleção do tipo de conteúdo a ser criado
- Opções disponíveis: Guia, Manual, E-book
- Interface visual com cards clicáveis
- Validação de seleção antes de prosseguir
- Redirecionamento para página correspondente

**Tipos de conteúdo:**
- **Guia**: Orientações práticas passo a passo
- **Manual**: Documentação técnica completa
- **E-book**: Conteúdo educacional estruturado

### 4. Transcrição (`/transcricao`)
**Arquivo**: `src/pages/Transcricao.tsx`

**Funcionalidades:**
- Upload de arquivos de áudio/vídeo (MP3, MP4, WAV, M4A)
- Upload resumível com tecnologia tus-js-client
- Barra de progresso em tempo real
- Cálculo de velocidade e tempo estimado
- Validação de formato e tamanho de arquivo
- Registro de tarefas no dashboard

**Especificações técnicas:**
- Tamanho máximo: 100MB
- Formatos suportados: MP3, MP4, WAV, M4A
- Storage: Supabase Storage com RLS
- Processamento: Registro automático no dashboard

### 5. Gerador de Sumário (`/sumario`)
**Arquivo**: `src/pages/Sumario.tsx`

**Funcionalidades:**
- Construção automática de índices e sumários
- Seleção de seções fixas (Introdução, Referências, etc.)
- Adição dinâmica de capítulos e subcapítulos
- Drag and drop para reorganização
- Prévia em tempo real do sumário
- Exportação e salvamento automático

**Seções fixas disponíveis:**
- Introdução
- Resumo Final
- Listas de Figuras
- Referências Bibliográficas
- Anexos
- Glossário

**Estrutura dinâmica:**
- Capítulos principais
- Subcapítulos aninhados
- Reordenação visual
- Numeração automática

### 6. Guia e Manual (`/guia-manual`)
**Arquivo**: `src/pages/GuiaManual.tsx`

**Funcionalidades:**
- Formulário completo para criação de guias e manuais
- Campos: Título, Descrição, Categoria, Palavras-chave
- Upload de arquivos de mídia
- Editor de conteúdo estruturado
- Integração com gerador de sumário
- Validação completa de formulário
- Salvamento automático

**Campos principais:**
- **Título**: Nome do documento
- **Descrição**: Resumo do conteúdo
- **Categoria**: Classificação do conteúdo
- **Palavras-chave**: SEO e busca
- **Conteúdo**: Editor de texto rico
- **Mídia**: Upload de imagens e vídeos

### 7. Elementos de Aprendizagem (`/elementos-aprendizagem`)
**Arquivo**: `src/pages/ElementosAprendizagem.tsx`

**Funcionalidades:**
- Seleção de componentes educacionais
- Categorias de elementos interativos
- Personalização de atividades
- Preview em tempo real
- Configuração de dificuldade
- Integração com outros módulos

**Elementos disponíveis:**
- Questionários e testes
- Exercícios práticos
- Estudos de caso
- Simulações
- Vídeos educativos
- Materiais de referência

### 8. Ferramentas de Planejamento (`/ferramentas-planejamento`)
**Arquivo**: `src/pages/FerramentasPlanejamento.tsx`

**Funcionalidades:**
- Ferramentas organizacionais para educadores
- Cronogramas e prazos
- Gestão de recursos
- Planejamento de aulas
- Avaliação de progresso
- Relatórios e estatísticas

**Recursos disponíveis:**
- Calendário acadêmico
- Gestão de turmas
- Controle de entregas
- Avaliação de desempenho
- Geração de relatórios

## 🔄 Fluxo do Usuário

1. **Autenticação** → Login seguro via Supabase
2. **Dashboard** → Visão geral dos projetos e acesso rápido
3. **Seleção de Conteúdo** → Escolha entre Guia, Manual ou E-book
4. **Criação de Conteúdo** → Página específica conforme tipo selecionado
5. **Gerador de Sumário** → Construção automática de índices (opcional)
6. **Upload de Mídia** → Adição de arquivos de áudio/vídeo para transcrição
7. **Finalização** → Salvamento e publicação do conteúdo

## 🔧 Integração com Supabase

### Backend Services Utilizados:

**Authentication (Auth)**
- Login e registro de usuários
- Sessões e tokens JWT
- Proteção de rotas

**Database**
- Tabelas: `projects`, `transcriptions`, `summaries`
- Row-Level Security (RLS) para controle de acesso
- Relacionamentos entre dados

**Storage**
- Upload de arquivos de áudio/vídeo
- Metadados e organização
- Políticas de acesso seguras

**Realtime**
- Atualizações em tempo real no dashboard
- Sincronização de dados entre dispositivos

### Principais Tabelas:

```sql
-- Exemplo de estrutura das tabelas
projects (id, user_id, title, type, status, created_at, updated_at)
transcriptions (id, project_id, file_url, status, duration, created_at)
summaries (id, project_id, content, sections, created_at)
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Opcional: Configurações adicionais
VITE_MAX_FILE_SIZE=104857600  # 100MB em bytes
VITE_SUPPORTED_FORMATS=mp3,mp4,wav,m4a
```

## 📝 Scripts Disponíveis

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
}
```

- **npm run dev**: Servidor de desenvolvimento
- **npm run build**: Build para produção
- **npm run lint**: Verificação de código
- **npm run preview**: Preview do build

## 🎯 Considerações de Design

- **Design Responsivo**: Layout adaptável para desktop e mobile
- **Acessibilidade**: Componentes com navegação por teclado e screen readers
- **Performance**: Lazy loading e otimização de bundle
- **UX/UI**: Interface limpa com feedback visual constante
- **Segurança**: Validação de dados e proteção contra XSS

## 📈 Futuras Melhorias

- [ ] Integração com IA para sugestões de conteúdo
- [ ] Sistema de colaboração em tempo real
- [ ] Templates prontos para diferentes tipos de conteúdo
- [ ] Análise de engajamento e estatísticas avançadas
- [ ] Integração com LMS (Learning Management Systems)
- [ ] Modo offline com sincronização automática

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Desenvolvedores

- **[Seu Nome]** - *Desenvolvimento inicial* - [Octoberfast](https://github.com/Octoberfast)

## 📞 Suporte

Para suporte e dúvidas:

- Abra uma [issue](https://github.com/Octoberfast/projeto-didactica/issues)
- Envie um email para: [seu-email@exemplo.com]

---

**Didáctica** - Transformando ideias em conteúdo educacional de qualidade! 🎓