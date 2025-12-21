import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-12">
      <div className="container mx-auto max-w-5xl px-4 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="font-bold text-white mb-4">StructSum</h4>
          <p className="mb-4 text-slate-400">
            Ferramenta profissional para estruturação acadêmica e corporativa.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Links Úteis</h4>
          <ul className="space-y-2 text-slate-400">
            <li className="hover:text-white cursor-pointer transition-colors">Normas ABNT</li>
            <li className="hover:text-white cursor-pointer transition-colors">Exportar PDF</li>
            <li className="hover:text-white cursor-pointer transition-colors">Termos de Uso</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Contato</h4>
          <p className="text-slate-400">suporte@structsum.com</p>
        </div>
      </div>
      <div className="container mx-auto max-w-5xl px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} StructSum. Todos os direitos reservados.
      </div>
    </footer>
  );
};