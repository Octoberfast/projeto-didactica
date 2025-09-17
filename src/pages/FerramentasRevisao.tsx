import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'

const FerramentasRevisao: React.FC = () => {
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
          <h1>Ferramentas de Revisão</h1>
          <p className="subtitle">
            Ferramentas para validar e refinar seu conteúdo com foco em qualidade, inclusão e adequação ao público-alvo.
          </p>
        </div>
        
        <div className="tools-grid">
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-universal-access"></i>
            </div>
            <h3>Acessibilidade e Inclusão</h3>
            <p>
              Conjunto de diretrizes e verificações para garantir que o conteúdo seja acessível a pessoas com diferentes necessidades e habilidades, promovendo a inclusão digital e educacional.
            </p>
          </div>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-layer-group"></i>
            </div>
            <h3>Adaptação Linguística por Nível Hierárquico</h3>
            <p>
              Ferramenta para ajustar a linguagem, tom e complexidade do conteúdo de acordo com diferentes níveis hierárquicos organizacionais, garantindo comunicação efetiva.
            </p>
          </div>
        </div>
        
        <div className="help-section">
          <h3>Garantindo Qualidade e Inclusão</h3>
          <p>
            As ferramentas de revisão são essenciais para assegurar que seu conteúdo atenda aos mais altos padrões de qualidade, acessibilidade e adequação ao público. Use-as na fase final do desenvolvimento para validar e aperfeiçoar seu material educacional.
          </p>
          <button className="help-button" onClick={handleHelpClick}>
            Solicitar Orientação
          </button>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default FerramentasRevisao;