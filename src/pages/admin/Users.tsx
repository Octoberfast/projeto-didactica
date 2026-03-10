import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Plus, Edit2, UserX, UserCheck, Shield, ShieldAlert, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  created_at: string
  banned_until?: string | null
  last_sign_in_at?: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  user?: User | null
  loading: boolean
}

function UserModal({ isOpen, onClose, onSave, user, loading }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Password not visible
        full_name: user.full_name,
        role: user.role
      })
    } else {
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'user'
      })
    }
  }, [user, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              disabled={!!user} // Disable email edit for simplicity or allow via specific flow
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {(!user || formData.password) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {user ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
              </label>
              <input
                type="password"
                required={!user}
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {user ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list', page, perPage: 20 }
      })

      if (error) throw error
      if (data?.error) {
          console.error('Business logic error:', data.error)
          throw new Error(data.error)
      }

      console.log('Success:', data)

      // Force sorting by created_at desc to ensure new user appears at top
      const fetchedUsers = data.users || []
      fetchedUsers.sort((a: User, b: User) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setUsers(fetchedUsers)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  const handleSaveUser = async (formData: any) => {
    try {
      setActionLoading(true)
      const action = editingUser ? 'update' : 'create'
      const payload = {
        action,
        ...formData,
        id: editingUser?.id
      }

      console.log('Sending request to manage-users:', payload)

      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: payload
      })

      if (error) {
          console.error('Supabase function error:', error)
          throw error
      }
      
      if (data?.error) {
          console.error('Business logic error:', data.error)
          throw new Error(data.error)
      }

      console.log('Success:', data)

      await fetchUsers()
      setIsModalOpen(false)
      setEditingUser(null)
    } catch (err: any) {
      console.error('Error saving user:', err)
      alert(`Erro: ${err.message || 'Erro desconhecido ao salvar usuário'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleStatus = async (user: User) => {
    const isActive = !user.banned_until
    const confirmMsg = isActive 
      ? `Deseja desativar o usuário ${user.full_name}?` 
      : `Deseja ativar o usuário ${user.full_name}?`
    
    if (!window.confirm(confirmMsg)) return

    try {
      const targetActive = !!user.banned_until 
      
      const { data: resData, error: resError } = await supabase.functions.invoke('manage-users', {
        body: {
            action: 'toggle_status',
            id: user.id,
            active: targetActive
        }
      })

      if (resError) throw resError
      if (resData?.error) throw new Error(resData.error)

      await fetchUsers()
    } catch (err: any) {
      console.error('Error toggling status:', err)
      alert(`Erro: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
            <Link 
              to="/admin" 
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 mt-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para Administração
            </Link>
            <p className="text-gray-500 mt-4">Administre o acesso e permissões do sistema</p>
          </div>
          <button
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 font-semibold text-gray-600">Usuário</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Função</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Criado em</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    const isBanned = !!user.banned_until
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{user.full_name}</span>
                            <span className="text-sm text-gray-500">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            !isBanned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {!isBanned ? 'Ativo' : 'Desativado'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {user.role === 'admin' ? (
                              <Shield className="w-4 h-4 text-purple-600" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="capitalize text-gray-700">{user.role}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-2 rounded-lg transition-all ${
                                !isBanned 
                                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                  : 'text-red-600 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={!isBanned ? 'Desativar' : 'Ativar'}
                            >
                              {!isBanned ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">Página {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading || users.length < 20}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <UserModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        onSave={handleSaveUser}
        user={editingUser}
        loading={actionLoading}
      />
    </div>
  )
}
