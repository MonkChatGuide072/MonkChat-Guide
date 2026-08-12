/**
 * MonkChat Guide — Safe Supabase Browser Client
 *
 * Security rules enforced here:
 * - Reads ONLY VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
 * - Does NOT read, reference, or expose any service-role key or secret.
 * - Does NOT create the client when either variable is missing.
 * - Does NOT throw errors that prevent the public prototype from loading.
 * - Does NOT log environment variable values.
 *
 * When supabaseClient is null, the app continues to serve mock data as before.
 * Real Supabase queries will only be enabled in a later approved step.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/**
 * True only when both required public environment variables are present.
 * When false the app falls back to local mock data.
 */
export const isSupabaseConfigured: boolean =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.trim().length > 0 &&
  typeof supabasePublishableKey === 'string' &&
  supabasePublishableKey.trim().length > 0

/**
 * The Supabase browser client, or null when configuration is missing.
 *
 * Always check `isSupabaseConfigured` or null-guard `supabaseClient`
 * before calling any Supabase method.
 *
 * Example:
 *   if (supabaseClient) {
 *     const { data } = await supabaseClient.from('languages').select('*')
 *   }
 */
export const supabaseClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        // Persist the session in localStorage for PWA offline-first behavior.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
