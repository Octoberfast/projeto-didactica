import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const ProductionDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Capturar informações de debug no carregamento
    const info = {
      environment: import.meta.env.MODE,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
        `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined',
      supabaseAnonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
      hostname: window.location.hostname,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
  }, [])

  const testSupabaseConnection = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Teste 1: Verificar se o cliente Supabase foi inicializado
      results.clientInitialized = !!supabase
      results.supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      results.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined'

      // Teste 2: Testar conexão básica com uma query simples
      try {
        const { data, error } = await supabase
          .from('user')
          .select('count')
          .limit(1)
        
        results.basicQuery = {
          success: !error,
          error: error?.message,
          data: data
        }
      } catch (err: any) {
        results.basicQuery = {
          success: false,
          error: err.message
        }
      }

      // Teste 3: Testar autenticação (sem fazer login real)
      try {
        const { data, error } = await supabase.auth.getSession()
        results.authTest = {
          success: !error,
          error: error?.message,
          hasSession: !!data.session
        }
      } catch (err: any) {
        results.authTest = {
          success: false,
          error: err.message
        }
      }

      // Teste 4: Verificar se as variáveis estão sendo lidas corretamente
      results.envVars = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY_EXISTS: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        VITE_SUPABASE_ANON_KEY_LENGTH: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
      }

    } catch (err: any) {
      results.generalError = err.message
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4">
      <h3 className="text-lg font-bold mb-4 text-gray-800">🔧 Debug de Produção - Supabase</h3>
      
      {/* Informações do Ambiente */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Informações do Ambiente:</h4>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {/* Botão de Teste */}
      <button
        onClick={testSupabaseConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Testar Conexão Supabase'}
      </button>

      {/* Resultados dos Testes */}
      {Object.keys(testResults).length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Resultados dos Testes:</h4>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-4 text-xs text-gray-600">
        <p><strong>Instruções:</strong></p>
        <ul className="list-disc list-inside">
          <li>Verifique se as variáveis de ambiente estão sendo carregadas</li>
          <li>Teste a conexão básica com o Supabase</li>
          <li>Verifique se há erros de autenticação</li>
          <li>Compare os valores com o ambiente local</li>
        </ul>
      </div>
    </div>
  )
}

export default ProductionDebug