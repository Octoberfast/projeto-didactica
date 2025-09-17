import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    // Check environment variables
    const envInfo = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
    }
    setDebugInfo(envInfo)
  }, [])

  const testConnection = async () => {
    try {
      setTestResult('Testando conexão...')
      
      // Test basic connection
      const { data, error } = await supabase.from('project_requests').select('count', { count: 'exact', head: true })
      
      if (error) {
        setTestResult(`Erro de conexão: ${error.message}`)
      } else {
        setTestResult('Conexão com Supabase funcionando!')
      }
    } catch (err) {
      setTestResult(`Erro inesperado: ${err}`)
    }
  }

  const testAuth = async () => {
    try {
      setTestResult('Testando autenticação...')
      
      // Test with a dummy login to see the specific error
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@test.com',
        password: 'testpassword'
      })
      
      if (error) {
        setTestResult(`Erro de autenticação: ${error.message}`)
      } else {
        setTestResult('Login de teste funcionou (não deveria!)')
      }
    } catch (err) {
      setTestResult(`Erro inesperado na autenticação: ${err}`)
    }
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Debug Supabase</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Variáveis de Ambiente:</h4>
        <pre className="bg-white p-2 rounded text-sm">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <button 
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Testar Conexão
        </button>
        <button 
          onClick={testAuth}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Testar Auth
        </button>
      </div>

      {testResult && (
        <div className="bg-white p-2 rounded">
          <strong>Resultado:</strong> {testResult}
        </div>
      )}
    </div>
  )
}