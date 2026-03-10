import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    async function checkAdminStatus() {
      try {
        // 1. Get Session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          if (mounted) {
            setSession(null)
            setLoading(false)
          }
          return
        }

        if (mounted) setSession(session)

        // 2. Check Profile Role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          if (mounted) setIsAdmin(false)
        } else {
          if (mounted) setIsAdmin(profile?.role === 'admin')
        }

      } catch (error) {
        console.error('Auth check error:', error)
        if (mounted) setIsAdmin(false)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkAdminStatus()

    // Listen for auth changes (optional but good for robustness)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            setSession(null)
            setIsAdmin(false)
            setLoading(false)
        } else if (event === 'SIGNED_IN' && session) {
             // Re-check logic could go here, but usually a page reload or state update is enough
             // For simplicity, we rely on the initial check or refresh
        }
    })

    return () => {
        mounted = false
        subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-purple"></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
