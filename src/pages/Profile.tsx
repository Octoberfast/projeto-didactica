import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/Header'
import Footer from '../components/Footer'
import type { User } from '@supabase/supabase-js'

interface ProfileFormData {
  name: string
  email: string
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Protect this route - require authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }
      
      const currentUser = session.user
      setUser(currentUser)
      
      // Populate form with current user data
      setFormData({
        name: currentUser.user_metadata?.name || '',
        email: currentUser.email || ''
      })
    }

    checkAuth()
  }, [navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validação básica
    if (!formData.name.trim()) {
      setError('O nome é obrigatório')
      setLoading(false)
      return
    }

    if (formData.name.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres')
      setLoading(false)
      return
    }

    try {
      // Update user metadata with the new name
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name.trim()
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Update local user state
        if (user) {
          setUser({
            ...user,
            user_metadata: {
              ...user.user_metadata,
              name: formData.name.trim()
            }
          })
        }
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="https://didacticasempre.com.br/wp-content/uploads/2025/05/logo_didactica-10-scaled-e1750184715681-1024x213.png"
              alt="Didáctica, sempre."
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-custom-purple mb-2">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Perfil atualizado com sucesso! Redirecionando...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                placeholder="Seu email"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">
                O email não pode ser alterado
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>

          {/* Back to Dashboard */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              ← Voltar ao Dashboard
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}