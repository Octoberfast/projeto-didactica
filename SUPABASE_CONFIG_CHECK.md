# Verificação de Configuração do Supabase

## Problema Identificado
- Aplicação funciona localmente (localhost:5173)
- Aplicação falha no Netlify (didacticasempre.netlify.app) com erro "Invalid API key"
- Variáveis de ambiente estão corretas no Netlify
- Chaves do Supabase são válidas

## Possíveis Causas

### 1. URLs Permitidas no Supabase
O Supabase pode estar bloqueando requisições do domínio do Netlify. Verificar:
- Site URL: https://didacticasempre.netlify.app
- Redirect URLs: https://didacticasempre.netlify.app/**

### 2. Configurações de CORS
Verificar se o domínio do Netlify está permitido nas configurações de CORS.

### 3. Configurações de Autenticação
Verificar se há restrições específicas para domínios de produção.

## Configurações Necessárias no Supabase

### Authentication > URL Configuration
- Site URL: `https://didacticasempre.netlify.app`
- Redirect URLs: 
  - `https://didacticasempre.netlify.app/**`
  - `http://localhost:5173/**` (para desenvolvimento)

### API Settings
- Verificar se não há restrições de IP ou domínio
- Verificar se a API está habilitada para todos os domínios

## Próximos Passos
1. ✅ Verificar variáveis de ambiente no Netlify
2. ✅ Comparar chaves local vs produção
3. 🔄 Verificar configurações de URL no Supabase
4. ⏳ Testar conectividade direta
5. ⏳ Verificar logs do Supabase