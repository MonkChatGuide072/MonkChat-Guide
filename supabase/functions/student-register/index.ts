import { createClient } from 'npm:@supabase/supabase-js@2.112.3'
import { handleStudentRegister } from './handler.ts'

const url = Deno.env.get('SUPABASE_URL')!
const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const allowedOrigins = (Deno.env.get('CMS_ALLOWED_ORIGINS') ?? 'https://monkchat-guide.pages.dev')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

Deno.serve((request) => {
  const admin = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return handleStudentRegister(request, {
    allowedOrigins,
    findInviteByHash: async (codeHash) => {
      const { data, error } = await admin
        .from('student_cohort_invites')
        .select('id, cohort_year, is_active, max_uses, used_count, expires_at')
        .eq('invite_code_hash', codeHash)
        .maybeSingle()
      if (error) throw error
      return data
    },
    hasExistingStudentCode: async (studentCode) => {
      const { data, error } = await admin
        .from('profiles')
        .select('id')
        .eq('student_code', studentCode)
        .maybeSingle()
      if (error) throw error
      return Boolean(data)
    },
    createAuthUser: async (email, password) => {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error || !data.user) throw error ?? new Error('Create failed')
      return data.user.id
    },
    claimInviteSlot: async (codeHash, cohortYear) => {
      const { data, error } = await admin.rpc('claim_student_cohort_invite', {
        p_code_hash: codeHash,
        p_cohort_year: cohortYear,
      })
      if (error) throw error
      return typeof data === 'string' ? data : null
    },
    insertStudentProfile: async (profile) => {
      const { error } = await admin.from('profiles').insert({
        id: profile.id,
        display_name: profile.display_name,
        dharma_name: profile.dharma_name,
        role: 'student',
        is_active: true,
        student_code: profile.student_code,
        cohort_year: profile.cohort_year,
      })
      if (error) throw error
    },
  })
})

