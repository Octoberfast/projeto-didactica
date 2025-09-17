import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface ChangePasswordFormData {
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChangePassword() {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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
    setSuccess(false)

    // Validação básica
    if (formData.newPassword !== formData.confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.')
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    if (!formData.email) {
      setError('Por favor, informe o email.')
      setLoading(false)
      return
    }

    try {
      // Tentar fazer login com a senha atual para verificar se está correta
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.currentPassword
      })

      if (signInError) {
        setError('Senha atual incorreta.')
        setLoading(false)
        return
      }

      // Se chegou até aqui, a senha atual está correta, então atualizar
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        setFormData({
          email: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/login')
        }, 2000)
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
          <h1 className="text-2xl font-bold text-custom-purple mb-2">Trocar Senha</h1>
          <p className="text-gray-600">Altere sua senha de acesso</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            Senha alterada com sucesso! Redirecionando para o login...
          </div>
        )}

        {/* Change password form */}
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
              placeholder="Seu email"
            />
          </div>

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-custom-purple mb-1">
              Senha Atual
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Sua senha atual"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-custom-purple mb-1">
              Nova Senha
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Sua nova senha"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-custom-purple mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirme sua nova senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="bg-custom-purple hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Alterando...
              </>
            ) : (
              'Alterar Senha'
            )}
          </button>
        </form>

        {/* Back to login link */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-custom-purple hover:text-purple-700 text-sm font-medium transition-colors"
          >
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  )
}