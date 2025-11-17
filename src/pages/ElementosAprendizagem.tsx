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
          <a href="/guia-manual" className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-book"></i>
            </div>
            <h3>Guias, Manuais, E-Books, Artigos</h3>
            <p>Documentação passo a passo para orientar processos, procedimentos ou uso de ferramentas de forma clara e objetiva.</p>
          </a>
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-video"></i>
            </div>
            <h3>Live Action, Motion</h3>
            <p>Formato digital interativo para apresentar conteúdos educacionais de forma estruturada, com recursos multimídia e navegação intuitiva.</p>
          </div>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-headphones"></i>
            </div>
            <h3>Podcasts</h3>
            <p>Conteúdos em áudio desenvolvidos para estudo flexível, com explicações, debates, entrevistas e aprofundamentos acessíveis em qualquer lugar.</p>
          </div>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-puzzle-piece"></i>
            </div>
            <h3>Jogos, Quizzes</h3>
            <p>Atividades interativas para reforçar o aprendizado, testar conhecimentos e promover engajamento de forma leve e divertida.</p>
          </div>
          
          
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-mouse-pointer"></i>
            </div>
            <h3>Conteúdo Interativo (OnePage / Rise)</h3>
            <p>Experiências de aprendizado com navegação não-linear, animações, elementos clicáveis e recursos interativos que elevam o engajamento.</p>
          </div>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-desktop"></i>
            </div>
            <h3>Treinamento e Slides</h3>
            <p>Materiais visuais e tutoriais práticos para ensinar o uso de sistemas, ferramentas e processos por meio de demonstrações claras e objetivas.</p>
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
