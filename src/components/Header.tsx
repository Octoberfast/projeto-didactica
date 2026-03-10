import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get current user and check admin status
    const checkUser = async () => {
       const { data: { user } } = await supabase.auth.getUser()
       setUser(user)
       
       if (user) {
         console.log('Verificando status de admin para usuário:', user.id)
         const { data: profile, error } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', user.id)
           .single()
         
         if (error) {
           console.error('Erro ao verificar perfil de admin:', error)
         } else {
           console.log('Perfil encontrado:', profile)
         }
         
         setIsAdmin(profile?.role === 'admin')
       }
     }
    
    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
         const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Função para formatar nome do usuário a partir do email
  const formatEmailToName = (email: string): string => {
    const emailPrefix = email.split('@')[0]
    return emailPrefix
      .replace(/[._]/g, ' ') // Substitui pontos e underscores por espaços
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza primeira letra
      .join(' ')
  }

  const userName = user?.user_metadata?.name || 
    (user?.email ? formatEmailToName(user.email) : 'Usuário')
  // const isAdmin = user?.user_metadata?.role === 'admin' // Comentado: variável não utilizada atualmente

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="w-full pl-4 pr-8 flex items-center justify-between h-16">
        <a href="/">
          <img
            src="https://didacticasempre.com.br/wp-content/uploads/2025/05/logo_didactica-10-scaled-e1750184715681-1024x213.png"
            alt="Didáctica"
            className="h-16 w-auto"
          />
        </a>
        <div className="flex items-center gap-4 ml-auto">
          <span className="text-gray-700 font-medium">
            Bem-vindo(a), <span id="userName">{userName}</span>!
          </span>
          {isAdmin && (
            <a href="/admin" className="bg-gray-800 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-opacity-90 transition-colors">
              <i className="fas fa-users-cog"></i>
              Admin
            </a>
          )}
          <a href="/dashboard" className="bg-custom-purple text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-opacity-90 transition-colors">
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </a>
          <button className="bg-custom-orange text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-opacity-90 transition-colors" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}