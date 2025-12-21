import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="w-full px-6 md:px-10 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="https://didacticasempre.com.br/wp-content/uploads/2025/05/logo_didactica-10-scaled-e1750184715681-1024x213.png" 
            alt="Didáctica Logo" 
            className="h-14 md:h-16 w-auto object-contain"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Right side actions removed as per request */}
        </div>
      </div>
    </header>
  );
};