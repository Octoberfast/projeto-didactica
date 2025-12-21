import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

export const AdvancedSupabaseDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = useCallback((result: Omit<DiagnosticResult, 'timestamp'>) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }])
  }, [])

  const runDiagnostics = useCallback(async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Environment Variables
    addResult({
      test: 'Environment Variables Check',
      status: 'pending',
      message: 'Verificando variáveis de ambiente...'
    })

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      addResult({
        test: 'Environment Variables Check',
        status: 'error',
        message: 'Variáveis de ambiente não encontradas',
        details: {
          url: !!supabaseUrl,
          key: !!supabaseAnonKey,
          mode: import.meta.env.MODE,
          dev: import.meta.env.DEV,
          prod: import.meta.env.PROD
        }
      })
      setIsRunning(false)
      return
    }

    addResult({
      test: 'Environment Variables Check',
      status: 'success',
      message: 'Variáveis de ambiente encontradas',
      details: {
        url: `${supabaseUrl.substring(0, 30)}...`,
        keyLength: supabaseAnonKey.length,
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        prod: import.meta.env.PROD
      }
    })

    // Test 2: Direct API Test with fetch
    addResult({
      test: 'Direct API Test (fetch)',
      status: 'pending',
      message: 'Testando API diretamente com fetch...'
    })

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        addResult({
          test: 'Direct API Test (fetch)',
          status: 'success',
          message: 'API respondeu com sucesso',
          details: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          }
        })
      } else {
        const errorText = await response.text()
        addResult({
          test: 'Direct API Test (fetch)',
          status: 'error',
          message: `API retornou erro: ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            headers: Object.fromEntries(response.headers.entries())
          }
        })
      }
    } catch (error) {
      addResult({
        test: 'Direct API Test (fetch)',
        status: 'error',
        message: 'Erro na requisição fetch',
        details: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      })
    }

    // Test 3: Supabase Client Creation
    addResult({
      test: 'Supabase Client Creation',
      status: 'pending',
      message: 'Criando cliente Supabase...'
    })

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      addResult({
        test: 'Supabase Client Creation',
        status: 'success',
        message: 'Cliente Supabase criado com sucesso',
        details: {
          clientExists: !!supabase,
          clientType: typeof supabase
        }
      })

      // Test 4: Auth Test
      addResult({
        test: 'Auth Service Test',
        status: 'pending',
        message: 'Testando serviço de autenticação...'
      })

      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          addResult({
            test: 'Auth Service Test',
            status: 'error',
            message: 'Erro no serviço de autenticação',
            details: {
              error: error.message,
              code: error.status
            }
          })
        } else {
          addResult({
            test: 'Auth Service Test',
            status: 'success',
            message: 'Serviço de autenticação funcionando',
            details: {
              hasSession: !!data.session,
              sessionData: data.session ? 'Session exists' : 'No session'
            }
          })
        }
      } catch (authError) {
        addResult({
          test: 'Auth Service Test',
          status: 'error',
          message: 'Exceção no teste de autenticação',
          details: {
            error: authError instanceof Error ? authError.message : String(authError)
          }
        })
      }

      // Test 5: Database Connection Test
      addResult({
        test: 'Database Connection Test',
        status: 'pending',
        message: 'Testando conexão com banco de dados...'
      })

      try {
        const { data, error } = await supabase
          .from('project_requests')
          .select('count')
          .limit(1)

        if (error) {
          addResult({
            test: 'Database Connection Test',
            status: 'error',
            message: 'Erro na conexão com banco',
            details: {
              error: error.message,
              code: error.code,
              hint: error.hint
            }
          })
        } else {
          addResult({
            test: 'Database Connection Test',
            status: 'success',
            message: 'Conexão com banco funcionando',
            details: {
              queryExecuted: true,
              dataReceived: !!data
            }
          })
        }
      } catch (dbError) {
        addResult({
          test: 'Database Connection Test',
          status: 'error',
          message: 'Exceção no teste de banco',
          details: {
            error: dbError instanceof Error ? dbError.message : String(dbError)
          }
        })
      }

    } catch (clientError) {
      addResult({
        test: 'Supabase Client Creation',
        status: 'error',
        message: 'Erro ao criar cliente Supabase',
        details: {
          error: clientError instanceof Error ? clientError.message : String(clientError)
        }
      })
    }

    // Test 6: Network and CORS Test
    addResult({
      test: 'Network and CORS Test',
      status: 'pending',
      message: 'Testando rede e CORS...'
    })

    try {
      const corsResponse = await fetch(`${supabaseUrl}/rest/v1/project_requests?select=count&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      })

      addResult({
        test: 'Network and CORS Test',
        status: corsResponse.ok ? 'success' : 'error',
        message: corsResponse.ok ? 'CORS e rede funcionando' : `CORS/Rede com problema: ${corsResponse.status}`,
        details: {
          status: corsResponse.status,
          origin: window.location.origin,
          corsHeaders: {
            'access-control-allow-origin': corsResponse.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': corsResponse.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': corsResponse.headers.get('access-control-allow-headers')
          }
        }
      })
    } catch (corsError) {
      addResult({
        test: 'Network and CORS Test',
        status: 'error',
        message: 'Erro de rede/CORS',
        details: {
          error: corsError instanceof Error ? corsError.message : String(corsError)
        }
      })
    }

    setIsRunning(false)
  }, [addResult])

  useEffect(() => {
    runDiagnostics()
  }, [runDiagnostics])

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Diagnóstico Avançado do Supabase
        </h2>
        <p className="text-gray-600">
          Teste completo de conectividade e configuração do Supabase
        </p>
        <div className="mt-4">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              result.status === 'success'
                ? 'bg-green-50 border-green-500'
                : result.status === 'error'
                ? 'bg-red-50 border-red-500'
                : 'bg-yellow-50 border-yellow-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{result.test}</h3>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  result.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : result.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {result.status.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-700 mb-2">{result.message}</p>
            <p className="text-xs text-gray-500 mb-2">{result.timestamp}</p>
            {result.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Ver detalhes
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          Clique em "Executar Diagnóstico" para começar os testes
        </div>
      )}
    </div>
  )
}

export default AdvancedSupabaseDiagnostic