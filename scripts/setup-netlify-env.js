#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente no Netlify
 * Execute: node scripts/setup-netlify-env.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Lê o arquivo .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local')

if (!fs.existsSync(envLocalPath)) {
  console.error('❌ Arquivo .env.local não encontrado!')
  process.exit(1)
}

const envContent = fs.readFileSync(envLocalPath, 'utf8')
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))

console.log('🚀 Configuração necessária no Netlify:')
console.log('\n📋 Copie e cole estas variáveis no painel do Netlify:')
console.log('\n' + '='.repeat(60))

envLines.forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    console.log(`${key}=${value}`)
  }
})

console.log('='.repeat(60))
console.log('\n📝 Passos para configurar no Netlify:')
console.log('1. Acesse: https://app.netlify.com/sites')
console.log('2. Selecione seu site ou crie um novo')
console.log('3. Vá em Site settings > Environment variables')
console.log('4. Clique em "Add a variable" para cada variável:')
envLines.forEach(line => {
  const [key] = line.split('=')
  if (key) {
    console.log(`   - Adicione: ${key}`)
  }
})
console.log('5. Faça um novo deploy (ou será automático se conectado ao Git)')
console.log('\n🔧 Comandos úteis:')
console.log('# Instalar Netlify CLI (opcional)')
console.log('npm install -g netlify-cli')
console.log('\n# Deploy manual (se necessário)')
console.log('netlify deploy --prod --dir=dist')
console.log('\n✅ Após configurar, o login funcionará no ambiente de produção!')
console.log('\n💡 Dica: O Netlify detecta automaticamente projetos Vite e usa as configurações do netlify.toml')