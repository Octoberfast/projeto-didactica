import { useEffect } from 'react'
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
          <h1>Ferramentas de Apoio</h1>
          <p className="subtitle">
            Ferramentas para validar e refinar seu conteúdo com foco em qualidade, inclusão e adequação ao público-alvo.
          </p>
        </div>
        
        <div className="tools-grid">
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-spell-check"></i>
            </div>
            <h3>Revisão Ortográfica</h3>
            <p>Ferramenta que verifica automaticamente ortografia, gramática e coerência textual, garantindo clareza, precisão e acessibilidade. Ideal para elevar a qualidade linguística de materiais educacionais e comunicacionais.</p>
          </div>
          
          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-layer-group"></i>
            </div>
            <h3>Feedback de Telas</h3>
            <p>Avaliação estruturada da clareza visual, hierarquia da informação e consistência do layout. Auxilia na criação de interfaces educacionais mais intuitivas, acessíveis e alinhadas às boas práticas de design instrucional.</p>
          </div>

          <div className="tool-card">
            <a href="/transcricao" className="block">
              <div className="tool-icon">
                <i className="fas fa-microphone-lines"></i>
              </div>
              <h3>Transcrição</h3>
              <p>Ferramenta que converte automaticamente áudios e vídeos em texto organizado, facilitando estudo, registro e documentação. Ideal para transformar conteúdos audiovisuais em materiais acessíveis e reutilizáveis.</p>
            </a>
          </div>

          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-code"></i>
            </div>
            <h3>Validador de Programação</h3>
            <p>Analisa códigos para identificar erros, vulnerabilidades, problemas de estilo e oportunidades de otimização. Garante padronização técnica e eleva a qualidade de materiais interativos e educacionais baseados em lógica computacional.</p>
          </div>

          <div className="tool-card">
            <div className="tool-icon">
              <i className="fas fa-film"></i>
            </div>
            <h3>Decodificador de Vídeo</h3>
            <p>Ferramenta que interpreta e extrai informações relevantes de vídeos, gerando resumos, insights e estruturação de conteúdo. Auxilia na criação de materiais didáticos a partir de recursos audiovisuais.</p>
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
