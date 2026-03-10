Vou implementar o módulo de administração completo, abrangendo Frontend e Backend (Edge Function), conforme solicitado.

### Estrutura da Solução

1.  **Backend: Edge Function (`manage-users`)**
    *   **Localização:** `supabase/functions/manage-users/index.ts`
    *   **Funcionalidades:**
        *   **Segurança:** Validação rigorosa de Token JWT e verificação da role `admin` na tabela `profiles`.
        *   **Operações (Switch Case):**
            *   `list`: Retorna usuários combinando dados de Auth (Email, Status) e Profiles (Nome, Role).
            *   `create`: Transacional. Cria no Auth -> Cria no Profile -> Rollback se falhar.
            *   `update`: Atualiza Auth (Email, Senha, Ban) e Profile (Nome, Role).
            *   `toggle_status`: Ativa/Desativa (Ban) o usuário.

2.  **Frontend: Segurança e Roteamento**
    *   **Novo Componente `AdminRoute`:**
        *   Protege rotas verificando se o usuário logado possui a role `admin` na tabela `profiles`.
        *   Redireciona para `/dashboard` caso contrário.
    *   **Atualização de `App.tsx`:** Configuração da rota `/admin/users` protegida.

3.  **Frontend: Interface de Administração**
    *   **Página `/admin/users`:**
        *   **Tabela:** Listagem com Nome, Email, Status, Role.
        *   **Paginação:** Controle simples de páginas (Next/Prev).
        *   **Ações:** Botões para Editar e Ativar/Desativar.
    *   **Modal Reutilizável:** Formulário para criar e editar usuários, integrado com a Edge Function.
    *   **Header:** Adição condicional do botão "Admin" apenas para administradores.

### Arquivos a serem criados/modificados:
*   `supabase/functions/manage-users/index.ts` (Nova Edge Function)
*   `src/components/AdminRoute.tsx` (Novo Componente de Proteção)
*   `src/pages/admin/Users.tsx` (Nova Página de Gestão)
*   `src/components/Header.tsx` (Atualização)
*   `src/App.tsx` (Atualização de Rotas)
*   `src/types/index.ts` (Definições de tipos se necessário)

**Observação:** Assumirei que a tabela `public.profiles` existe (ou deve existir) com colunas `id`, `role`, `full_name`. Caso não exista, fornecerei o SQL necessário.
