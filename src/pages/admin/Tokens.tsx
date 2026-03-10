import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Tokens() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tokens de API</h1>
          <Link 
            to="/admin" 
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 mt-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para Administração
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-50 p-6 rounded-full">
              <Construction className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Em Desenvolvimento</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            O gerenciamento de tokens de API estará disponível em breve. Aqui você poderá criar e revogar chaves de acesso para integrações externas.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
