import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Filter, ArrowUpDown, ArrowUp, ArrowDown, Copy, CheckCircle, Clock, FileText } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface ProjectRequest {
  id: string
  company_name: string
  project_name: string
  responsible: string
  department: string
  request_deadline: string
  delivery_deadline: string
  status: 'em_andamento' | 'concluido'
  user_email: string
  created_at: string
  origin_id?: string
  form_data?: any
}

interface DashboardFilters {
  status: 'rascunho' | 'em_progresso' | 'concluido' | 'todos'
  sortBy: 'created_at' | 'title'
  sortOrder: 'asc' | 'desc'
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<ProjectRequest[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Novos estados para filtros simplificados
  const [filters, setFilters] = useState<DashboardFilters>({
    status: 'todos',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  useEffect(() => {
    // Protect this route - require authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
        return
      }
      setUser(session.user)
      await fetchProjects(session.user.email!)
    }
    checkAuth()
  }, [])

  // Função reutilizável de sincronização: marca 'concluido' em project_requests com base em transcriptions_meta
  const syncConclusions = async () => {
    if (!user?.id || !user?.email) return
    try {
      const { data: concluidas, error } = await supabase
        .from('transcriptions_meta')
        .select('empresa, projeto')
        .eq('user_id', user.id)
        .eq('status', 'concluido')

      if (error) throw error

      if (concluidas && concluidas.length > 0) {
        const updates = concluidas.map(async (row: any) => {
          const { error: updErr } = await supabase
            .from('project_requests')
            .update({ status: 'concluido' })
            .eq('company_name', row.empresa)
            .eq('project_name', row.projeto)
            .eq('user_email', user.email)
            .eq('status', 'em_andamento')

          if (updErr) {
            console.error('Falha ao atualizar status em project_requests (sync):', updErr)
          }
        })

        await Promise.all(updates)
        await fetchProjects(user.email)
      }
    } catch (e) {
      console.error('Erro na sincronização de status:', e)
    }
  }

  // Assinar atualizações de status na tabela transcriptions_meta
  useEffect(() => {
    if (!user?.id || !user?.email) return

    const channel = supabase
      .channel('transcriptions-meta-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'transcriptions_meta',
        filter: `user_id=eq.${user.id}`,
      }, async (payload) => {
        const newRow = payload.new as any
        // Atualizar project_requests somente quando transcriptions_meta.status === 'concluido'
        if (newRow?.status === 'concluido') {
          try {
            const { error: updErr } = await supabase
              .from('project_requests')
              .update({ status: 'concluido' })
              .eq('company_name', newRow.empresa)
              .eq('project_name', newRow.projeto)
              .eq('user_email', user.email)
              .eq('status', 'em_andamento')

            if (updErr) {
              console.error('Falha ao atualizar status em project_requests:', updErr)
              return
            }

            await fetchProjects(user.email)
          } catch (e) {
            console.error('Erro ao processar atualização de transcrição:', e)
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, user?.email])

  // Sincronização inicial (dentro do componente): refletir transcrições já concluídas
  useEffect(() => {
    if (!user?.id || !user?.email) return
    syncConclusions()
  }, [user?.id, user?.email])

  // Fallback de sincronização: tenta periodicamente por até 2 minutos
  useEffect(() => {
    if (!user?.id || !user?.email) return

    let attempts = 0
    const maxAttempts = 4
    const intervalMs = 30000

    const intervalId = setInterval(async () => {
      attempts += 1
      await syncConclusions()

      try {
        const { count, error } = await supabase
          .from('project_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_email', user.email!)
          .eq('status', 'em_andamento')

        if (error) {
          console.error('Erro ao contar projetos em andamento:', error)
        }

        if ((count ?? 0) === 0 || attempts >= maxAttempts) {
          clearInterval(intervalId)
        }
      } catch (err) {
        console.error('Erro no fallback de sincronização:', err)
        if (attempts >= maxAttempts) {
          clearInterval(intervalId)
        }
      }
    }, intervalMs)

    return () => clearInterval(intervalId)
  }, [user?.id, user?.email])

  const fetchProjects = async (userEmail: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_requests')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Ordenar projetos: 'Em Andamento' primeiro, depois 'Concluído'
      const sortedProjects = (data || []).sort((a, b) => {
        // Prioridade: em_andamento = 0, concluido = 1
        const statusOrder = { em_andamento: 0, concluido: 1 }
        const aOrder = statusOrder[a.status] ?? 2
        const bOrder = statusOrder[b.status] ?? 2
        
        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }
        
        // Se o status for igual, ordenar por data de criação (mais recente primeiro)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setProjects(sortedProjects)
      setFilteredProjects(sortedProjects)
    } catch (err) {
      console.error('Erro ao buscar projetos:', err)
      setError('Erro ao carregar projetos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Função para reutilizar conteúdo
  const handleReuseContent = (project: ProjectRequest) => {
    // Redirecionar para a página de Guia & Manual com parâmetro de reutilização
    window.location.href = `/guia-manual?reuse=${project.id}`
  }

  // Função para aplicar filtros e ordenação
  const applyFiltersAndSort = () => {
    let filtered = projects

    // Aplicar filtro por status
    if (filters.status !== 'todos') {
      // Mapear os status para compatibilidade
      const statusMap = {
        'rascunho': 'em_andamento', // Temporário até implementar rascunho
        'em_progresso': 'em_andamento',
        'concluido': 'concluido'
      }
      const mappedStatus = statusMap[filters.status]
      filtered = filtered.filter(project => project.status === mappedStatus)
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let comparison = 0
      
      if (filters.sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (filters.sortBy === 'title') {
        comparison = a.project_name.localeCompare(b.project_name)
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    setFilteredProjects(filtered)
  }

  // Aplicar filtros quando os valores mudarem
  useEffect(() => {
    applyFiltersAndSort()
  }, [filters, projects])

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleSort = (field: 'created_at' | 'title') => {
    if (filters.sortBy === field) {
      // Se já está ordenando por este campo, inverte a ordem
      handleFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      // Se é um novo campo, define como descendente por padrão
      handleFilterChange({ sortBy: field, sortOrder: 'desc' })
    }
  }

  const getSortIcon = (field: 'created_at' | 'title') => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    return filters.sortOrder === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'em_andamento') {
      return 'bg-yellow-100 text-yellow-800'
    } else if (status === 'concluido') {
      return 'bg-green-100 text-green-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Hero Section - Seguindo padrão do GuiaManual */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Filter className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Minhas Solicitações de Projeto
            </h1>
            <p className="text-gray-600">
              Acompanhe o status dos seus projetos solicitados
            </p>
          </div>

          {/* Seção de Filtros - Redesenhada */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 hover:shadow-xl transition-shadow duration-300 mb-8">
            <div className="flex items-center mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 md:mr-4">
                <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <h2 className="text-lg md:text-2xl font-semibold text-slate-900">Filtros e Ordenação</h2>
            </div>
            
            {/* Layout Mobile - Compacto */}
            <div className="md:hidden space-y-4">
              {/* Linha 1: Status e Ordenação */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="status-filter-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status-filter-mobile"
                    value={filters.status}
                    onChange={(e) => handleFilterChange({ status: e.target.value as DashboardFilters['status'] })}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="rascunho">Rascunho</option>
                    <option value="em_progresso">Em Progresso</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="sort-by-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                    Ordenar por
                  </label>
                  <select
                    id="sort-by-mobile"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as DashboardFilters['sortBy'] })}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="created_at">Data</option>
                    <option value="title">Título</option>
                  </select>
                </div>
              </div>

              {/* Linha 2: Ordem */}
              <div>
                <label htmlFor="sort-order-mobile" className="block text-xs font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <select
                  id="sort-order-mobile"
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange({ sortOrder: e.target.value as DashboardFilters['sortOrder'] })}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Mais recente primeiro</option>
                  <option value="asc">Mais antigo primeiro</option>
                </select>
              </div>
            </div>

            {/* Layout Desktop - Original */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {/* Filtro por Status */}
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value as DashboardFilters['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="em_progresso">Em Progresso</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>

              {/* Ordenação */}
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  id="sort-by"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as DashboardFilters['sortBy'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Data de Criação</option>
                  <option value="title">Título</option>
                </select>
              </div>

              {/* Ordem */}
              <div>
                <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-2">
                  Ordem
                </label>
                <select
                  id="sort-order"
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange({ sortOrder: e.target.value as DashboardFilters['sortOrder'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Mais recente primeiro</option>
                  <option value="asc">Mais antigo primeiro</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum projeto encontrado
              </h3>
              <p className="text-gray-500">
                Você ainda não possui projetos solicitados.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum conteúdo encontrado com este filtro
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros para ver mais resultados.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                          <span>Projeto</span>
                          {getSortIcon('title')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                          <span>Data de Criação</span>
                          {getSortIcon('created_at')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Departamento</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">{project.project_name}</div>
                              <div className="text-sm text-gray-500">{project.company_name}</div>
                              {project.origin_id && (
                                <div className="text-xs text-blue-600 flex items-center mt-1">
                                  <Copy className="w-3 h-3 mr-1" />
                                  Reutilizado
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDateTime(project.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {project.department}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                            {project.status === 'concluido' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {project.status === 'em_andamento' ? 'Em progresso' : 'Concluído'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {project.status === 'concluido' && project.department !== 'Transcrição' && (
                            <button
                              onClick={() => handleReuseContent(project)}
                              disabled={loading}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reutilizar este conteúdo"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Reutilizar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1">
                        <FileText className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{project.project_name}</h3>
                          <p className="text-sm text-gray-500 truncate">{project.company_name}</p>
                          {project.origin_id && (
                            <div className="text-xs text-blue-600 flex items-center mt-1">
                              <Copy className="w-3 h-3 mr-1" />
                              Reutilizado
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusBadgeClass(project.status)}`}>
                        {project.status === 'concluido' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {project.status === 'em_andamento' ? 'Em progresso' : 'Concluído'}
                      </span>
                    </div>

                    {/* Informações do Card */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium w-20">Depto:</span>
                        <span>{project.department}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium w-20">Criado:</span>
                        <span>{formatDateTime(project.created_at)}</span>
                      </div>
                    </div>

                    {/* Ações do Card */}
                    {project.status === 'concluido' && project.department !== 'Transcrição' && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleReuseContent(project)}
                          disabled={loading}
                          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reutilizar este conteúdo"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Reutilizar Conteúdo
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Exibindo {filteredProjects.length} de {projects.length} projetos
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


