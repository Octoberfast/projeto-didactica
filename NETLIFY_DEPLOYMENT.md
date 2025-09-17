# Deploy no Netlify

Este guia explica como fazer o deploy da aplicação no Netlify.

## Configuração Inicial

### 1. Conectar Repositório

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub/GitLab/Bitbucket
4. Selecione o repositório do projeto

### 2. Configurações de Build

O Netlify detectará automaticamente as configurações do `netlify.toml`:

- **Build command**: `pnpm run build`
- **Publish directory**: `dist`
- **Node version**: 22

## Configuração de Ambiente

Antes de fazer o deploy, você precisa configurar as variáveis de ambiente no Netlify:

1. Acesse o dashboard do Netlify
2. Selecione seu projeto
3. Vá em **Site settings** > **Environment variables**
4. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL`: [sua URL do Supabase]
   - `VITE_SUPABASE_ANON_KEY`: [sua chave anônima do Supabase]

### Script Automático

Use o script `setup-netlify-env.js` para ver as variáveis necessárias:

```bash
node setup-netlify-env.js
```

## Configuração de Secrets Scanning

O Netlify possui um sistema de detecção de secrets que pode bloquear o build quando encontra chaves no código. Para aplicações frontend com Supabase, a `VITE_SUPABASE_ANON_KEY` é uma chave pública que **deve** estar no bundle final.

### Por que é seguro?

- A `VITE_SUPABASE_ANON_KEY` é uma chave **pública** e **anônima**
- Ela é projetada para ser exposta no frontend
- Não possui privilégios administrativos
- É protegida pelas Row Level Security (RLS) policies do Supabase

### Configuração no netlify.toml

O arquivo `netlify.toml` já está configurado para excluir esta chave do scanning:

```toml
[build]
  environment = { SECRETS_SCAN_OMIT_KEYS = "VITE_SUPABASE_ANON_KEY" }
```

Esta configuração informa ao Netlify que é seguro ter esta chave no build output.

### Alternativas de Configuração

Se necessário, você também pode usar outras opções:

```toml
# Desabilitar completamente o secrets scanning (não recomendado)
environment = { SECRETS_SCAN_ENABLED = "false" }

# Omitir arquivos específicos
environment = { SECRETS_SCAN_OMIT_PATHS = "dist/assets/*.js" }
```

## Deploy

### Deploy Automático

Após conectar o repositório, o Netlify fará deploy automaticamente a cada push na branch principal.

### Deploy Manual

Para fazer deploy manual:

1. Faça build local: `pnpm run build`
2. Arraste a pasta `dist` para o dashboard do Netlify

## Verificação

Após o deploy:

1. Acesse a URL fornecida pelo Netlify
2. Teste o login/cadastro
3. Verifique se não há erros no console do navegador

## Troubleshooting

### Erro de Secrets Scanning

Se você receber o erro:
```
Secret env var "VITE_SUPABASE_ANON_KEY"'s value detected
```

Verifique se o `netlify.toml` contém a configuração `SECRETS_SCAN_OMIT_KEYS`.

### Erro de Build

- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o Node.js version está correto (22)
- Verifique os logs de build no dashboard do Netlify

### Erro de Login

- Confirme se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas
- Verifique se o domínio do Netlify está autorizado no Supabase

## Recursos Úteis

- [Documentação do Netlify](https://docs.netlify.com/)
- [Secrets Scanning](https://ntl.fyi/configure-secrets-scanning)
- [Environment Variables](https://docs.netlify.com/environment-variables/overview/)