import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface LoginFormData {
  email: string
  password: string
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

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

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        setError(error.message)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl max-w-md w-full p-8 rounded-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://didacticasempre.com.br/wp-content/uploads/2025/05/logo_didactica-10-scaled-e1750184715681-1024x213.png"
            alt="Didáctica, sempre."
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-custom-purple mb-2">Fazer Login</h1>
          <p className="text-gray-600">Acesse sua conta</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-custom-purple mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-custom-purple mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-custom-purple hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Change password link */}
        <div className="mt-6 text-center">
          <Link
            to="/change-password"
            className="text-custom-purple hover:text-purple-700 text-sm font-medium transition-colors"
          >
            Trocar Senha
          </Link>
        </div>
      </div>
    </div>
  )
}