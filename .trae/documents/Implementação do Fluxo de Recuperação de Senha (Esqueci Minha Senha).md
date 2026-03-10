Para implementar a funcionalidade de "Esqueci Minha Senha", precisamos criar um fluxo onde o usuário possa solicitar um link de redefinição e, em seguida, definir uma nova senha.

### 1. Criar a página de Solicitação (`ForgotPassword.tsx`)
Criaremos uma nova página onde o usuário insere seu e-mail.
- **Rota**: `/forgot-password`
- **Funcionalidade**: Chama `supabase.auth.resetPasswordForEmail(email)` configurado para redirecionar para a página de atualização de senha.
- **UI**: Similar à tela de Login, mas apenas com o campo de e-mail e botão "Enviar Link de Recuperação".

### 2. Criar a página de Nova Senha (`UpdatePassword.tsx`)
Esta será a página para onde o usuário será redirecionado após clicar no link do e-mail.
- **Rota**: `/update-password` (Protegida)
- **Funcionalidade**: Permite definir uma nova senha usando `supabase.auth.updateUser`. Diferente da página "Trocar Senha" atual, esta **não solicitará a senha antiga**, pois o usuário já estará autenticado pelo link mágico do e-mail.
- **UI**: Campos para "Nova Senha" e "Confirmar Senha".

### 3. Atualizar as Rotas (`App.tsx`)
Adicionaremos as novas rotas ao arquivo principal da aplicação:
- `/forgot-password`: Rota pública.
- `/update-password`: Rota protegida (envolta em `<ProtectedRoute>`), garantindo que o link do e-mail autenticou o usuário corretamente antes de permitir a alteração.

### 4. Atualizar a Tela de Login (`Login.tsx`)
- Adicionaremos um link "Esqueci minha senha" logo abaixo ou ao lado do campo de senha, direcionando para `/forgot-password`.

Dessa forma, o fluxo completo será:
1. Usuário clica em "Esqueci minha senha" no Login.
2. Insere o e-mail em `/forgot-password`.
3. Recebe e-mail do Supabase e clica no link.
4. É redirecionado para `/update-password` (já logado).
5. Define a nova senha e é redirecionado para o Dashboard ou Login.