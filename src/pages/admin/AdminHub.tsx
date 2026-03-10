import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Users, Key } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminHub() {
  return (
    <>
      <Header />
      
      <main className="main-content">
        <div className="welcome-section">
          <h1>Painel de Administração</h1>
          <p className="subtitle">
            Selecione a área que deseja gerenciar.
          </p>
        </div>
        
        <div className="categories-grid">
          <Link to="/admin/users" className="category-card">
            <div className="card-icon flex justify-center items-center">
              <Users size={48} />
            </div>
            <h3>Usuários</h3>
            <p>Administre os acessos e permissões dos usuários do sistema.</p>
          </Link>
          
          <Link to="/admin/tokens" className="category-card">
            <div className="card-icon flex justify-center items-center">
              <Key size={48} />
            </div>
            <h3>Tokens de API</h3>
            <p>Configure e gerencie as chaves de integração e limites de uso.</p>
          </Link>
        </div>
      </main>
      
      <Footer />
    </>
  )
}
