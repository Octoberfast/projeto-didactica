Vou criar o 'Dashboard de Administração' (AdminHub) com os ajustes solicitados pelo usuário, garantindo a navegação fluida e consistência visual.

### Estrutura da Implementação Revisada

1.  **Página `src/pages/admin/AdminHub.tsx` (Novo):**
    *   **Layout:** Baseado em `ChooseContentType.tsx`.
    *   **Conteúdo:** Título "Painel de Administração", Subtítulo "Selecione a área que deseja gerenciar".
    *   **Cards:**
        *   **Usuários:** Ícone `Users` (lucide-react) dentro de uma `div.card-icon`. Link para `/admin/users`.
        *   **Tokens de API:** Ícone `Key` (lucide-react) dentro de uma `div.card-icon`. Link para `/admin/tokens`.
    *   **Estilo:** Utilizará as classes CSS globais (`categories-grid`, `category-card`) para match visual perfeito.

2.  **Página `src/pages/admin/Tokens.tsx` (Novo):**
    *   Componente placeholder com Header e Footer.
    *   **Navegação:** Link "Voltar para Administração" (seta para esquerda + texto) abaixo do título.

3.  **Atualização de `src/pages/admin/Users.tsx`:**
    *   Adicionar o link "Voltar para Administração" abaixo do título principal.

4.  **Atualização de Rotas (`src/App.tsx`):**
    *   Adicionar `/admin` -> `AdminHub`.
    *   Adicionar `/admin/tokens` -> `Tokens`.
    *   (Ambos protegidos por `AdminRoute`).

5.  **Atualização do Header (`src/components/Header.tsx`):**
    *   Link "Admin" agora aponta para `/admin`.

### Arquivos a serem criados/modificados:
*   `src/pages/admin/AdminHub.tsx`
*   `src/pages/admin/Tokens.tsx`
*   `src/pages/admin/Users.tsx`
*   `src/App.tsx`
*   `src/components/Header.tsx`
