import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Create a Supabase client with the Service Role Key for admin actions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get the user from the authorization header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Check if the user is an admin in the profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, ...payload } = await req.json()

    let result

    switch (action) {
      case 'list': {
        const { page = 1, perPage = 20 } = payload
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: page,
          perPage: perPage,
        })
        if (listError) throw listError

        // Fetch profiles for these users to get names/roles
        const userIds = users.map((u) => u.id)
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, role')
          .in('id', userIds)
        
        if (profilesError) throw profilesError

        // Merge data
        const mergedUsers = users.map(u => {
            const p = profiles?.find(prof => prof.id === u.id)
            return {
                id: u.id,
                email: u.email,
                last_sign_in_at: u.last_sign_in_at,
                created_at: u.created_at,
                banned_until: u.banned_until,
                full_name: p?.full_name || u.user_metadata?.full_name || 'N/A',
                role: p?.role || 'user'
            }
        })

        result = { users: mergedUsers }
        break
      }

      case 'create': {
        const { email, password, full_name, role } = payload
        
        // 1. Create User in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, role }
        })

        if (authError) throw authError

        // The 'on_auth_user_created' trigger creates the profile automatically.
        // We upsert here to ensure the correct role set by the admin is applied,
        // handling any race condition gracefully.
        const { error: profileUpsertError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: authData.user.id,
            full_name,
            role,
            email
          }, { onConflict: 'id' })

        if (profileUpsertError) {
          // Rollback auth user if profile upsert fails
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          throw new Error(`Failed to set profile: ${profileUpsertError.message}`)
        }

        result = { user: authData.user }
        break
      }

      case 'update': {
        const { id, email, password, full_name, role, ban_duration } = payload

        const authUpdates: any = {}
        if (email) authUpdates.email = email
        if (password) authUpdates.password = password
        if (ban_duration !== undefined) authUpdates.ban_duration = ban_duration // 'none' to unban

        // Update Auth
        if (Object.keys(authUpdates).length > 0) {
            const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates)
            if (authUpdateError) throw authUpdateError
        }

        // Update Profile
        const profileUpdates: any = {}
        if (full_name) profileUpdates.full_name = full_name
        if (role) profileUpdates.role = role
        if (email) profileUpdates.email = email

        if (Object.keys(profileUpdates).length > 0) {
            const { error: profileUpdateError } = await supabaseAdmin
                .from('profiles')
                .update(profileUpdates)
                .eq('id', id)
            
            if (profileUpdateError) throw profileUpdateError
        }

        result = { success: true }
        break
      }

      case 'toggle_status': {
         const { id, active } = payload
         // If active is true, we want to UNBAN (ban_duration = 'none').
         // If active is false, we want to BAN (ban_duration = '876600h' aka 100 years)
         
         const ban_duration = active ? 'none' : '876600h'; // ~100 years

         const { error: toggleError } = await supabaseAdmin.auth.admin.updateUserById(id, {
             ban_duration
         })

         if (toggleError) throw toggleError
         result = { success: true, active }
         break
      }

      case 'delete': {
          const { id } = payload
          // Delete from Auth (Cascade should handle profile if configured, but let's be explicit)
          // Actually, standard Supabase cascade deletes profile if referencing auth.users with ON DELETE CASCADE.
          // But here we do manual.
          
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id)
          if (deleteError) throw deleteError
          
          // Profile deletion is likely handled by trigger or cascade, but if not:
          await supabaseAdmin.from('profiles').delete().eq('id', id)
          
          result = { success: true }
          break
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
