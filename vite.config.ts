import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  
  console.log('Vite config - mode:', mode)
  console.log('Vite config - env loaded:', {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY ? 'LOADED' : 'NOT_LOADED'
  })
  
  return {
    build: {
      sourcemap: 'hidden',
    },
    plugins: [
      react({
        babel: {
          plugins: [
            'react-dev-locator',
          ],
        },
      }),
      tsconfigPaths()
    ],
    define: {
      // Explicitly define environment variables for build
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://osaiqomiywdtngtddpmg.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zYWlxb21peXdkdG5ndGRkcG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU3MTAsImV4cCI6MjA3MjkyMTcxMH0.qDPrlB1K5jcFVt1ThVNqcdX07canrgros1eH3suuCUI'),
    },
  }
})
