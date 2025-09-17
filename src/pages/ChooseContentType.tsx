import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'
import { useEffect } from 'react'

export default function ChooseContentType() {
  useEffect(() => {
    // Protect this route - require authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
      }
    }
    checkAuth()
  }, [])

  const handleHelpClick = () => {
    // Handle help button click
    console.log('Orientação Personalizada clicked')
  }

  return (
    <>
      <Header />
      
      <main className="main-content">
        <div className="welcome-section">
          <h1>Escolha o Tipo de Conteúdo</h1>
          <p className="subtitle">
            Selecione uma categoria abaixo para acessar as ferramentas mais adequadas para sua necessidade específica.
          </p>
        </div>
        
        <div className="categories-grid">
          <a href="/ferramentas-planejamento" className="category-card">
            <div className="card-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <h3>Ferramentas de Planejamento</h3>
            <p>Organize informações e alinhe os objetivos para começar.</p>
          </a>
          
          <a href="/elementos-aprendizagem" className="category-card">
            <div className="card-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>Elementos de Aprendizagem</h3>
            <p>Desenvolva conteúdos que explicam, orientam e facilitam a jornada de criação.</p>
          </a>
          
          <a href="/ferramentas-revisao" className="category-card">
            <div className="card-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>Ferramentas de Revisão</h3>
            <p>Ferramentas para validar e refinar com foco em qualidade e inclusão.</p>
          </a>
        </div>
        
        <div className="help-section">
          <h3>Precisa de Ajuda na Escolha?</h3>
          <p>
            Ainda não sabe qual tipo de conteúdo é melhor para o seu projeto? Clique no botão abaixo para receber orientação personalizada.
          </p>
          <button className="help-button" onClick={handleHelpClick}>
            Orientação Personalizada
          </button>
        </div>
      </main>
      
      <Footer />
    </>
  )
}