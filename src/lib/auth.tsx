import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabaseClient } from './supabase'

interface Profile {
  id: string
  display_name: string
  role: 'owner' | 'team_member'
  is_active: boolean
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      if (!supabaseClient) {
        setIsLoading(false)
        return
      }

      try {
        const { data: { session: initialSession }, error } = await supabaseClient.auth.getSession()
        if (error) throw error

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          // Do not fetch profile here. The separate effect will handle it based on user.id
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
        if (mounted) setIsLoading(false)
      }
    }

    getInitialSession()

    let authListener: { subscription: { unsubscribe: () => void } } | null = null
    
    if (supabaseClient) {
      // KEEP THIS SYNCHRONOUS to avoid deadlocks!
      const { data } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
        if (!mounted) return
        setSession(newSession)
        setUser(newSession?.user ?? null)
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
      if (!supabaseClient) return
      
      setIsLoading(true)
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
          if (mounted) setProfile(data as Profile)
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err)
        if (mounted) setProfile(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchProfile(user.id)
    } else {
      setProfile(null)
      // Only set loading false here if we know supabase is initialized
      // (This handles the logged-out state correctly)
      setIsLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [user?.id])

  const signOut = async () => {
    if (!supabaseClient) return
    try {
      await supabaseClient.auth.signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
