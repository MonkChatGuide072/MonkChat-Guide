import { createClient } from 'npm:@supabase/supabase-js@2.112.3'
import { handleTeamRequest } from './handler.ts'

// These keys exist only in the Edge Function environment, never in VITE_*.
const url = Deno.env.get('SUPABASE_URL')!
const publicKey = Deno.env.get('SUPABASE_ANON_KEY')!
const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const allowedOrigins = (Deno.env.get('CMS_ALLOWED_ORIGINS') ?? 'https://monkchat-guide.pages.dev').split(',').map(origin => origin.trim()).filter(Boolean)

Deno.serve(request => handleTeamRequest(request, {
  allowedOrigins,
  authorize: async token => {
    const client = createClient(url, publicKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: auth, error: authError } = await client.auth.getUser(token)
    if (authError || !auth.user) return null
    const columns = 'id,display_name,role,is_active'
    const { data: actor, error: profileError } = await client.from('profiles').select(columns).eq('id', auth.user.id).single()
    if (profileError || !actor) return null
    return {
      actor,
      securityVersion: async () => {
        const { data, error } = await client.rpc('cms_security_version')
        return error ? null : data
      },
      list: async () => {
        const { data, error } = await client.from('profiles').select(columns).order('created_at', { ascending: true })
        if (error) throw error
        return data ?? []
      },
      createAccount: async (email, password) => {
        // Instantiate the privileged client only after the handler verifies Owner.
        const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
        const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
        if (error || !data.user) throw error ?? new Error('Create failed')
        return data.user.id
      },
      addProfile: async profile => {
        // Use the Owner's JWT, preserving RLS and database audit attribution.
        const { data, error } = await client.from('profiles').insert(profile).select(columns).single()
        if (error || !data) throw error ?? new Error('No profile')
        return data
      },
      updateMember: async (id, display_name, is_active) => {
        const { data, error } = await client.from('profiles').update({ display_name, is_active }).eq('id', id).eq('role', 'team_member').select(columns).single()
        if (error || !data) throw error ?? new Error('No member')
        return data
      },
    }
  },
}))
