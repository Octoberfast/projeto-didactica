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
  }, [])

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
    } catch (err) {
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
            <h1 className="text-2xl font-bold text-custom-purple mb-2">M