import { useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'

export default function FerramentasPlanejamento() {
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
          <h1>Ferramentas de Planejamento</h1>
          <p className="subtitle">
            Organize informações e alinhe os objetivos para começar seu projeto com clareza e direcionamento estratégico.
          </p>
        </div>
        
        <div className="tools-grid">
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-search-location"></i>
            </div>
            <h3>Análise Contextual</h3>
            <p>Ferramenta para mapear e analisar o contexto do projeto, identificando variáveis importantes, público-alvo e objetivos específicos para fundamentar as decisões de design instrucional.</p>
          </div>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-clipboard-check"></i>
            </div>
            <h3>Checklist de Variáveis para Briefing</h3>
            <p>Lista estruturada de verificação com todas as variáveis essenciais que devem ser consideradas e documentadas durante a fase de briefing do projeto educacional.</p>
          </div>

          <div className="tool-card">
            <a href="/transcricao" className="block">
              <div className="tool-icon">
                <i className="fas fa-microphone-lines"></i>
              </div>
              <h3>Transcrição</h3>
              <p>Ferramenta que converte automaticamente áudios e vídeos em texto, facilitando o acesso, análise e documentação do conteúdo falado. Ideal para criar registros de reuniões, legendas, materiais de estudo e acessibilidade em projetos educacionais.</p>
            </a>
          </div>
        </div>
        
        <div className="help-section">
          <h3>Como Usar as Ferramentas de Planejamento</h3>
          <p>
            Estas ferramentas foram desenvolvidas para auxiliar na fase inicial do seu projeto. Comece pela Análise Contextual para entender o cenário completo, depois utilize o Checklist para garantir que todas as variáveis importantes foram consideradas.
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