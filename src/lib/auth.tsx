import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabaseClient } from './supabase'

export interface Profile {
  id: string
  display_name: string
  role: 'owner' | 'team_member' | 'student'
  is_active: boolean
  student_code?: string | null
  cohort_year?: number | null
  dharma_name?: string | null
  student_access_status?: 'pending' | 'active' | 'suspended' | 'needs_review' | null
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [profileFor, setProfileFor] = useState<string | null>(null)
  const [profileRevision, setProfileRevision] = useState(0)
  const isLoading = !sessionReady || (!!user && profileFor !== user.id)

  useEffect(() => {
    let mounted = true
    let receivedAuthEvent = false

    async function getInitialSession() {
      if (!supabaseClient) {
        if (typeof window !== 'undefined') {
          if (sessionStorage.getItem('mock_owner_auth') === 'true') {
            const mockUser = { id: 'mock-owner-001', email: 'owner@monkchat.invalid' } as User
            setSession({ user: mockUser } as Session)
            setUser(mockUser)
            setProfile({
              id: 'mock-owner-001',
              display_name: 'อาจารย์ผู้ดูแลระบบ (Owner)',
              role: 'owner',
              is_active: true,
            })
            setProfileFor('mock-owner-001')
            setSessionReady(true)
            return
          }
          if (sessionStorage.getItem('mock_student_pending') === 'true') {
            const mockUser = { id: 'mock-student-001', email: '6611018@student.monkchat.invalid' } as User
            setSession({ user: mockUser } as Session)
            setUser(mockUser)
            setProfile({
              id: 'mock-student-001',
              display_name: 'พระสมชาย สุทฺธิปญฺโญ',
              dharma_name: 'สุทฺธิปญฺโญ',
              student_code: '6611018',
              cohort_year: 66,
              role: 'student',
              is_active: false,
            })
            setProfileFor('mock-student-001')
            setSessionReady(true)
            return
          }
        }
        setSessionReady(true)
        return
      }

      try {
        const { data: { session: initialSession }, error } = await supabaseClient.auth.getSession()
        if (error) throw error

        if (mounted && !receivedAuthEvent) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          setSessionReady(true)
          // Do not fetch profile here. The separate effect will handle it based on user.id
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
        if (mounted && !receivedAuthEvent) setSessionReady(true)
      }
    }

    getInitialSession()

    let authListener: { subscription: { unsubscribe: () => void } } | null = null
    
    if (supabaseClient) {
      // KEEP THIS SYNCHRONOUS to avoid deadlocks!
      const { data } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
        if (!mounted) return
        receivedAuthEvent = true
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setProfileFor(null)
        setSessionReady(true)
        setProfileRevision(value => value + 1)
      })
      authListener = data
    }

    return () => {
      mounted = false
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Separate effect to fetch the profile whenever the user changes
  useEffect(() => {
    let mounted = true

    async function fetchProfile(userId: string) {
      if (!supabaseClient) {
        if (typeof window !== 'undefined') {
          if (sessionStorage.getItem('mock_owner_auth') === 'true') {
            setProfile({
              id: 'mock-owner-001',
              display_name: 'อาจารย์ผู้ดูแลระบบ (Owner)',
              role: 'owner',
              is_active: true,
            })
          } else if (sessionStorage.getItem('mock_student_pending') === 'true') {
            setProfile({
              id: 'mock-student-001',
              display_name: 'พระสมชาย สุทฺธิปญฺโญ',
              dharma_name: 'สุทฺธิปญฺโญ',
              student_code: '6611018',
              cohort_year: 66,
              role: 'student',
              is_active: false,
            })
          }
        }
        if (mounted) setProfileFor(userId)
        return
      }
      
      setProfileFor(null)
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('id, display_name, role, is_active')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          if (mounted) setProfile(null)
        } else {
          let resolved = data as Profile
          if (resolved?.role === 'student') {
            const { data: extra } = await supabaseClient
              .from('profiles')
              .select('student_code, cohort_year, dharma_name')
              .eq('id', userId)
              .single()
            if (extra) resolved = { ...resolved, ...(extra as Partial<Profile>) }
            // A separate optional query keeps the preceding deployment compatible.
            const { data: access } = await supabaseClient.from('profiles')
              .select('student_access_status').eq('id', userId).single()
            if (access) resolved = { ...resolved, ...(access as Partial<Profile>) }
          }
          if (mounted) setProfile(resolved)
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err)
        if (mounted) setProfile(null)
      } finally {
        if (mounted) setProfileFor(userId)
      }
    }

    if (user?.id) {
      fetchProfile(user.id)
    } else {
      setProfile(null)
      setProfileFor(null)
    }

    return () => {
      mounted = false
    }
  }, [user?.id, profileRevision])

  useEffect(() => {
    const refresh = () => { if (user?.id) setProfileRevision(value => value + 1) }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [user?.id])

  const signOut = async () => {
    if (!supabaseClient) return
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ session, user, profile: profileFor === user?.id ? profile : null, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
