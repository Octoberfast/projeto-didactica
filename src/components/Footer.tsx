export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <img
            src="https://didacticasempre.com.br/wp-content/uploads/2025/05/logo_didactica-10-scaled-e1750184715681-1024x213.png"
            alt="Didáctica"
            className="footer-logo"
          />
          <p>Transformando conhecimento em experiências de aprendizagem excepcionais.</p>
        </div>
        <div className="footer-section">
          <h4>Tipos de Conteúdo</h4>
          <ul>
            <li><a href="/planejamento">Planejamento</a></li>
            <li><a href="/aprendizagem">Aprendizagem</a></li>
            <li><a href="/revisao">Revisão</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contato</h4>
          <p>Entre em contato conosco para mais informações sobre nossos serviços de design instrucional.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Didáctica Sempre. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}