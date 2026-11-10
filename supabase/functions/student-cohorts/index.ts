import { createClient } from 'npm:@supabase/supabase-js@2.112.3'
import { handleStudentCohortRequest, type StudentRecord } from './handler.ts'

const url = Deno.env.get('SUPABASE_URL')!
const publicKey = Deno.env.get('SUPABASE_ANON_KEY')!
const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const allowedOrigins = (Deno.env.get('CMS_ALLOWED_ORIGINS') ?? 'https://monkchat-guide.pages.dev')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

Deno.serve((request) =>
  handleStudentCohortRequest(request, {
    allowedOrigins,
    authorize: async (token) => {
      const client = createClient(url, publicKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data: auth, error: authError } = await client.auth.getUser(token)
      if (authError || !auth.user) return null
      const { data: actor, error: profileError } = await client
        .from('profiles')
        .select('id, display_name, role, is_active')
        .eq('id', auth.user.id)
        .single()
      if (profileError || !actor) return null

      const admin = createClient(url, secretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      return {
        actor,
        studentSecurityVersion: async () => {
          const { data, error } = await client.rpc('student_security_version')
          return error ? null : data
        },
        listData: async () => {
          const [invitesRes, studentsRes, progressRes] = await Promise.all([
            client
              .from('student_cohort_invites')
              .select('id, cohort_year, label, code_hint, is_active, max_uses, used_count, expires_at, created_at')
              .order('created_at', { ascending: false }),
            client
              .from('profiles')
              .select('id, display_name, dharma_name, student_code, cohort_year, role, is_active')
              .eq('role', 'student')
              .order('cohort_year', { ascending: false })
              .order('student_code', { ascending: true }),
            client
              .from('student_practice_progress')
              .select('student_id, module_type'),
          ])
          if (invitesRes.error) throw invitesRes.error
          if (studentsRes.error) throw studentsRes.error
          if (progressRes.error) throw progressRes.error

          const counts = new Map<string, { vocab: number; qa: number }>()
          for (const row of progressRes.data ?? []) {
            const current = counts.get(row.student_id) ?? { vocab: 0, qa: 0 }
            if (row.module_type === 'vocab_lesson') current.vocab += 1
            if (row.module_type === 'qa_flashcard') current.qa += 1
            counts.set(row.student_id, current)
          }

          const students: StudentRecord[] = ((studentsRes.data ?? []) as StudentRecord[]).map((student) => {
            const summary = counts.get(student.id)
            return {
              ...student,
              vocab_count: summary?.vocab ?? 0,
              qa_count: summary?.qa ?? 0,
            }
          })

          return {
            invites: invitesRes.data ?? [],
            students,
          }
        },
        createInvite: async (payload) => {
          const { data, error } = await admin
            .from('student_cohort_invites')
            .insert(payload)
            .select('id, cohort_year, label, code_hint, is_active, max_uses, used_count, expires_at, created_at')
            .single()
          if (error || !data) throw error ?? new Error('Create invite failed')
          return data
        },
        toggleInvite: async (id, is_active) => {
          const { data, error } = await admin
            .from('student_cohort_invites')
            .update({ is_active })
            .eq('id', id)
            .select('id, cohort_year, label, code_hint, is_active, max_uses, used_count, expires_at, created_at')
            .single()
          if (error || !data) throw error ?? new Error('Toggle invite failed')
          return data
        },
        updateStudent: async (id, display_name, dharma_name, is_active) => {
          // Run via Owner JWT so RLS + database audit attribution remain active.
          const { data, error } = await client
            .from('profiles')
            .update({ display_name, dharma_name, is_active })
            .eq('id', id)
            .eq('role', 'student')
            .select('id, display_name, dharma_name, student_code, cohort_year, role, is_active')
            .single()
          if (error || !data) throw error ?? new Error('Update student failed')
          return data as StudentRecord
        },
        hasStudent: async (id) => {
          const { data, error } = await client
            .from('profiles')
            .select('id')
            .eq('id', id)
            .eq('role', 'student')
            .maybeSingle()
          if (error) throw error
          return Boolean(data)
        },
        resetStudentPassword: async (id, password) => {
          const { error } = await admin.auth.admin.updateUserById(id, { password })
          if (error) throw error
        },
      }
    },
  }),
)

