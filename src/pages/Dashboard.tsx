import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/Header'
import Footer from '../components/Footer'
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
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<ProjectRequest[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados dos filtros
  const [companyFilter, setCompanyFilter] = useState<string>('todos')
  const [projectFilter, setProjectFilter] = useState<string>('todos')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

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

  // Função para aplicar filtros
  const applyFilters = () => {
    let filtered = projects

    if (companyFilter !== 'todos') {
      filtered = filtered.filter(project => project.company_name === companyFilter)
    }

    if (projectFilter !== 'todos') {
      filtered = filtered.filter(project => project.project_name === projectFilter)
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    setFilteredProjects(filtered)
  }

  // Aplicar filtros quando os valores mudarem
  useEffect(() => {
    applyFilters()
  }, [companyFilter, projectFilter, statusFilter, projects])

  // Obter valores únicos para os dropdowns
  const getUniqueCompanies = () => {
    const companies = [...new Set(projects.map(p => p.company_name))]
    return companies.sort()
  }

  const getUniqueProjects = () => {
    const projectNames = [...new Set(projects.map(p => p.project_name))]
    return projectNames.sort()
  }

  const getUniqueStatuses = () => {
    const statuses = [...new Set(projects.map(p => p.status))]
    return statuses.sort()
  }

  const getStatusLabel = (status: string) => {
    if (status === 'em_andamento') return 'Em Andamento'
    if (status === 'concluido') return 'Concluído'
    return status
  }

  const formatDate = (dateString: string) => {
    // Para campos DATE do PostgreSQL, evitar conversão de timezone
    // que pode causar diferença de 1 dia
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-white text-sm font-medium'
    
    if (status === 'em_andamento') {
      return (
        <span className={`${baseClasses} bg-custom-purple`}>
          Em Andamento
        </span>
      )
    } else if (status === 'concluido') {
      return (
        <span className={`${baseClasses} bg-blue-500`}>
          Concluído
        </span>
      )
    }
    
    return (
      <span className={`${baseClasses} bg-gray-500`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-purple"></div>
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-custom-purple mb-2">
              Minhas Solicitações de Projeto
            </h1>
            <p className="text-gray-600">
              Acompanhe o status dos seus projetos solicitados
            </p>
          </div>

          {/* Seção de Filtros */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por Empresa */}
              <div>
                <label htmlFor="company-filter" className="block text-xs font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <select
                  id="company-filter"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  {getUniqueCompanies().map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Projeto */}
              <div>
                <label htmlFor="project-filter" className="block text-xs font-medium text-gray-700 mb-2">
                  Projeto
                </label>
                <select
                  id="project-filter"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  {getUniqueProjects().map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Status */}
              <div>
                <label htmlFor="status-filter" className="block text-xs font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  {getUniqueStatuses().map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Empresa</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Projeto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Responsável</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Departamento</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data de Solicitação</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Horário de Solicitação</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prazo Entrega</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, index) => (
                    <tr 
                      key={project.id} 
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                    >
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">{project.company_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">{project.project_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{project.responsible}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{project.department}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{formatDate(project.request_deadline)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{formatTime(project.created_at)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{formatDate(project.delivery_deadline)}</td>
                      <td className="px-4 py-4">{getStatusBadge(project.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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