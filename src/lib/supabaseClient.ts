import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDY2MjgwMDAsImV4cCI6MTk2MjIwNDAwMH0.placeholder'

// Debug: Log environment variables (only in development)
if (import.meta.env.DEV) {
  console.log('Environment check:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined',
    mode: import.meta.env.MODE
  })
}

// Validate environment variables
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables are not properly configured', {
    url: !!import.meta.env.VITE_SUPABASE_URL,
    key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    mode: import.meta.env.MODE
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)