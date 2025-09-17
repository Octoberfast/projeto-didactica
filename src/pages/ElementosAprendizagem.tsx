import { useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'

export default function ElementosAprendizagem() {
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
    console.log('Solicitar Orientação clicked')
  }

  return (
    <>
      <Header />
      
      <main className="main-content">
        <div className="back-navigation">
          <a href="/" className="back-button">
            <i className="fas fa-arrow-left"></i>
            Voltar ao Início
          </a>
        </div>
        
        <div className="welcome-section">
          <h1>Elementos de Aprendizagem</h1>
          <p className="subtitle">
            Desenvolva conteúdos que explicam, orientam e facilitam a jornada de criação de materiais educacionais eficazes.
          </p>
        </div>
        
        <div className="tools-grid">
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-book-open"></i>
            </div>
            <h3>E-book</h3>
            <p>Formato digital interativo para apresentar conteúdos educacionais de forma estruturada, com recursos multimídia e navegação intuitiva.</p>
          </div>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-book"></i>
            </div>
            <h3>Livro Didático</h3>
            <p>Material educacional completo e estruturado, organizado em capítulos com exercícios, exemplos práticos e conteúdo progressivo.</p>
          </div>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-question-circle"></i>
            </div>
            <h3>FAQ (Perguntas Frequentes)</h3>
            <p>Compilação organizada das dúvidas mais comuns com respostas claras e diretas para facilitar o acesso à informação.</p>
          </div>
          
          <a href="/guia-manual" className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-map"></i>
            </div>
            <h3>Guia &amp; Manual</h3>
            <p>Documentação passo a passo para orientar processos, procedimentos ou uso de ferramentas de forma clara e objetiva.</p>
          </a>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-mouse-pointer"></i>
            </div>
            <h3>Conteúdo Interativo (OnePage / Rise)</h3>
            <p>Experiências de aprendizagem dinâmicas com elementos interativos, animações e navegação não-linear para engajamento máximo.</p>
          </div>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-desktop"></i>
            </div>
            <h3>Tutoriais de Sistema</h3>
            <p>Instruções visuais e práticas para ensinar o uso de softwares, plataformas ou sistemas específicos através de demonstrações.</p>
          </div>
        </div>
        
        <div className="help-section">
          <h3>Escolhendo o Formato Ideal</h3>
          <p>
            Cada formato de conteúdo tem suas características específicas. Considere seu público-alvo, objetivos de aprendizagem e recursos disponíveis para escolher a melhor opção para seu projeto educacional.
          </p>
          <button className="help-button" onClick={handleHelpClick}>
            Solicitar Orientação
          </button>
        </div>
      </main>
      
      <Footer />
    </>
  )
}