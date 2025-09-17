import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDY2MjgwMDAsImV4cCI6MTk2MjIwNDAwMH0.placeholder'

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not properly configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)