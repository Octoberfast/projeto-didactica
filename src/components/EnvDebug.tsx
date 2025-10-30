import React from 'react';

const EnvDebug: React.FC = () => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
  };

  const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '20px', 
      zIndex: 9999,
      maxWidth: '100vw',
      maxHeight: '100vh',
      overflow: 'auto',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3>Environment Variables Debug</h3>
      
      <h4>import.meta.env:</h4>
      <pre>{JSON.stringify(envVars, null, 2)}</pre>
      
      <h4>process.env:</h4>
      <pre>{JSON.stringify(processEnv, null, 2)}</pre>
      
      <h4>All import.meta.env:</h4>
      <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
      
      <h4>Window location:</h4>
      <pre>{JSON.stringify({
        href: window.location.href,
        hostname: window.location.hostname,
        origin: window.location.origin
      }, null, 2)}</pre>
      
      <button 
        onClick={() => {
          const element = document.querySelector('[data-env-debug]') as HTMLElement;
          if (element) element.style.display = 'none';
        }}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px',
          background: 'red',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          cursor: 'pointer'
        }}
      >
        Fechar
      </button>
    </div>
  );
};

export default EnvDebug;